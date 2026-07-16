"""
app.py
------
CareerAI Flask REST API — Phase 1

Endpoints:
  POST /api/predict  → Career prediction + HDBSCAN persona + SHAP + PyTorch confidence
  POST /api/chat     → Grok API career counseling chatbot (RAG-augmented)
  GET  /api/health   → Health check for Docker + Render
"""

import os
import json
import pickle
import numpy as np
import shap
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

from career_rag import retrieve_context

# ─────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────

load_dotenv()  # reads .env file → GROK_API_KEY

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────────
# Load ML Models
# ─────────────────────────────────────────────────────────────────

print("Loading ML models...")

rf_model        = pickle.load(open("career_model.pkl",    "rb"))
clusterer       = pickle.load(open("cluster_model.pkl",   "rb"))
pca_model       = pickle.load(open("pca_model.pkl",       "rb"))
scaler          = pickle.load(open("scaler.pkl",          "rb"))
shap_background = pickle.load(open("shap_background.pkl", "rb"))

with open("cluster_names.json") as f:
    cluster_names = json.load(f)

with open("cluster_centers.json") as f:
    cluster_centers = json.load(f)

with open("pca_reference.json") as f:
    pca_reference = json.load(f)

print("All models loaded ✅")

# ─────────────────────────────────────────────────────────────────
# Grok API Client
# ─────────────────────────────────────────────────────────────────

# Groq Cloud Client (free, fast LLaMA inference)
grok_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ─────────────────────────────────────────────────────────────────
# Session context (per-process; stateless across restarts)
# ─────────────────────────────────────────────────────────────────

user_context = {
    "prediction":    "",
    "cluster_name":  "",
    "confidence":    0,
    "skills":        {}
}

# ─────────────────────────────────────────────────────────────────
# Helper: Resolve HDBSCAN cluster label
# ─────────────────────────────────────────────────────────────────

def resolve_cluster(X_scaled_row):
    """
    Predict HDBSCAN cluster for a new point.
    HDBSCAN doesn't natively predict new points — we find nearest centroid.
    """
    centers_arr = np.array([cluster_centers[k] for k in sorted(cluster_centers.keys(), key=int)])
    center_keys = sorted(cluster_centers.keys(), key=int)

    # Use original (unscaled) space for distance to centroids
    dists = np.linalg.norm(centers_arr - X_scaled_row, axis=1)
    nearest_key = center_keys[np.argmin(dists)]
    return int(nearest_key)

# ─────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Health check — used by Docker and Render."""
    return jsonify({
        "status": "ok",
        "model":  "career_model_v2",
        "careers": list(rf_model.classes_)
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.json

    features = [
        data["math"],     data["science"],
        data["logical"],  data["creative"],
        data["tech"],     data["business"]
    ]
    X = np.array([features])

    # ── Career Prediction (Random Forest) ──
    prediction = rf_model.predict(X)[0]
    prob       = rf_model.predict_proba(X)[0]
    rf_confidence = round(float(max(prob)) * 100, 2)

    # ── Calibrated Confidence (Fallback to RF) ──
    calibrated_confidence = rf_confidence

    # ── HDBSCAN Persona Cluster ──
    cluster_id   = resolve_cluster(features)
    cluster_name = cluster_names.get(str(cluster_id), "🌐 The Versatile Builder")

    # ── PCA Coordinates (scaled space) ──
    X_scaled   = scaler.transform(X)
    pca_coords = pca_model.transform(X_scaled)[0].tolist()

    # ── SHAP Explainability ──
    explainer   = shap.TreeExplainer(rf_model)
    shap_values = explainer.shap_values(X)

    class_index = list(rf_model.classes_).index(prediction)

    if isinstance(shap_values, list):
        feature_impact = shap_values[class_index][0].tolist()
    else:
        feature_impact = shap_values[0, :, class_index].tolist()

    feature_names = ["Math", "Science", "Logical", "Creative", "Tech", "Business"]
    shap_data = [
        {"feature": name, "impact": round(float(val), 4)}
        for name, val in zip(feature_names, feature_impact)
    ]
    # Sort by absolute impact (most impactful first)
    shap_data.sort(key=lambda x: abs(x["impact"]), reverse=True)

    # ── Update session context for chatbot ──
    user_context["prediction"]   = prediction
    user_context["cluster_name"] = cluster_name
    user_context["confidence"]   = calibrated_confidence
    user_context["skills"]       = dict(zip(feature_names, features))

    return jsonify({
        "prediction":           prediction,
        "confidence":           rf_confidence,
        "calibrated_confidence": calibrated_confidence,
        "cluster":              cluster_id,
        "cluster_name":         cluster_name,
        "pca_coords":           pca_coords,
        "pca_reference":        pca_reference,
        "shap_data":            shap_data,
        "skill_scores":         dict(zip(feature_names, features))
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    data    = request.json
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"reply": "Please send a message!"}), 400

    # ── RAG context retrieval ──
    rag_query = f"{message} {user_context['prediction']}"
    context   = retrieve_context(rag_query, top_k=2)

    # ── Build Grok system prompt ──
    system_prompt = (
        f"You are an expert AI career counselor helping a student. "
        f"The student's AI-recommended career path is: **{user_context['prediction']}**. "
        f"Their learner persona is: **{user_context['cluster_name']}**. "
        f"Their AI confidence score is: {user_context['confidence']}%. "
        f"Their skill scores are: {user_context['skills']}. "
        f"\n\nRelevant knowledge base context:\n{context}"
        f"\n\nBe encouraging, specific, and give actionable advice. "
        f"Use bullet points or numbered steps where helpful. "
        f"Keep responses concise (under 200 words) but impactful."
    )

    try:
        response = grok_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system",  "content": system_prompt},
                {"role": "user",    "content": message}
            ],
            max_tokens=300,
            temperature=0.7
        )
        reply = response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Grok API error: {e}")
        # Graceful fallback to RAG context
        reply = (
            context if context
            else "I'm having trouble connecting right now. Please try again in a moment."
        )

    return jsonify({"reply": reply})


# ─────────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)
