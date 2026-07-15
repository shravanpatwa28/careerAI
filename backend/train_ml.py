"""
train_ml.py
-----------
Phase 1: Trains all CareerAI models.

What this does:
  1. Generates a realistic 1,000-row synthetic dataset (8 careers,
     normal distributions, feature correlations)
  2. Trains RandomForestClassifier for career prediction
  3. Trains HDBSCAN clustering -> assigns named student personas
  4. Trains PCA (3D) for the persona scatter map
  5. Trains PyTorch SkillEmbedder for calibrated confidence scoring
  6. Saves all .pkl, .pt, .json, .csv artifacts

Run with: python train_ml.py
"""

import pandas as pd
import numpy as np
import pickle
import json
import hdbscan
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from confidence_model import train_confidence_model

np.random.seed(42)

# ─────────────────────────────────────────────────────────────────
# STEP 1: Generate Realistic Dataset (16 Careers, 2000 rows)
# ─────────────────────────────────────────────────────────────────

print("=" * 60)
print("STEP 1: Generating realistic dataset (2000 rows, 16 careers)")
print("=" * 60)

def clip(arr, lo, hi):
    return np.clip(np.round(arr), lo, hi).astype(int)

def generate_career(n, career,
                    math_mu, math_sig,
                    sci_mu, sci_sig,
                    log_mu, log_sig,
                    cre_mu, cre_sig,
                    tech_mu, tech_sig,
                    bus_mu, bus_sig):
    """
    Generate n samples for a career using normal distributions.
    Marks (math, science): scale 0-100  -> clipped to [30, 100]
    Aptitude scores (logical, creative, tech, business): scale 1-10 -> clipped to [1, 10]
    """
    math    = clip(np.random.normal(math_mu,  math_sig,  n), 30, 100)
    sci     = clip(np.random.normal(sci_mu,   sci_sig,   n), 30, 100)
    logical = clip(np.random.normal(log_mu,   log_sig,   n), 1,  10)
    creative= clip(np.random.normal(cre_mu,   cre_sig,   n), 1,  10)
    tech    = clip(np.random.normal(tech_mu,  tech_sig,  n), 1,  10)
    business= clip(np.random.normal(bus_mu,   bus_sig,   n), 1,  10)

    # Mild correlations: add noise that mirrors a related feature
    logical  = clip(logical  + np.random.normal(0, 0.5, n), 1, 10)
    tech     = clip(tech     + np.random.normal(0, 0.5, n), 1, 10)

    return pd.DataFrame({
        "math": math, "science": sci,
        "logical": logical, "creative": creative,
        "tech": tech, "business": business,
        "career": career
    })

#           career                  math        sci        log        cre        tech       biz
careers = [
    generate_career(125, "AI Engineer",
                    math_mu=88, math_sig=5,  sci_mu=85, sci_sig=5,
                    log_mu=9.0, log_sig=0.6, cre_mu=4.0, cre_sig=0.8,
                    tech_mu=9.5, tech_sig=0.5, bus_mu=3.0, bus_sig=0.8),

    generate_career(125, "Software Engineer",
                    math_mu=80, math_sig=5,  sci_mu=73, sci_sig=6,
                    log_mu=8.0, log_sig=0.7, cre_mu=4.5, cre_sig=0.9,
                    tech_mu=9.0, tech_sig=0.6, bus_mu=3.5, bus_sig=0.8),

    generate_career(125, "Data Analyst",
                    math_mu=75, math_sig=5,  sci_mu=70, sci_sig=6,
                    log_mu=7.5, log_sig=0.7, cre_mu=4.0, cre_sig=0.9,
                    tech_mu=7.5, tech_sig=0.7, bus_mu=5.5, bus_sig=0.8),

    generate_career(125, "UI/UX Designer",
                    math_mu=50, math_sig=6,  sci_mu=48, sci_sig=6,
                    log_mu=5.0, log_sig=0.8, cre_mu=9.5, cre_sig=0.5,
                    tech_mu=6.5, tech_sig=0.8, bus_mu=5.0, bus_sig=0.8),

    generate_career(125, "Marketing Manager",
                    math_mu=55, math_sig=6,  sci_mu=50, sci_sig=6,
                    log_mu=5.0, log_sig=0.8, cre_mu=7.0, cre_sig=0.7,
                    tech_mu=4.0, tech_sig=0.8, bus_mu=9.5, bus_sig=0.5),

    generate_career(125, "Cybersecurity Analyst",
                    math_mu=78, math_sig=5,  sci_mu=74, sci_sig=6,
                    log_mu=9.0, log_sig=0.6, cre_mu=3.0, cre_sig=0.8,
                    tech_mu=9.5, tech_sig=0.5, bus_mu=3.0, bus_sig=0.8),

    generate_career(125, "Product Manager",
                    math_mu=62, math_sig=6,  sci_mu=58, sci_sig=6,
                    log_mu=6.5, log_sig=0.7, cre_mu=7.0, cre_sig=0.7,
                    tech_mu=5.5, tech_sig=0.8, bus_mu=9.0, bus_sig=0.5),

    generate_career(125, "Biomedical Researcher",
                    math_mu=75, math_sig=5,  sci_mu=92, sci_sig=4,
                    log_mu=7.0, log_sig=0.7, cre_mu=5.0, cre_sig=0.8,
                    tech_mu=5.0, tech_sig=0.8, bus_mu=2.5, bus_sig=0.7),

    # -- 8 NEW CAREERS ------------------------------------------------

    generate_career(125, "Finance Analyst",
                    math_mu=85, math_sig=5,  sci_mu=60, sci_sig=6,
                    log_mu=8.0, log_sig=0.6, cre_mu=3.5, cre_sig=0.8,
                    tech_mu=5.0, tech_sig=0.8, bus_mu=9.5, bus_sig=0.5),

    generate_career(125, "Content Creator",
                    math_mu=45, math_sig=6,  sci_mu=42, sci_sig=6,
                    log_mu=4.5, log_sig=0.8, cre_mu=9.5, cre_sig=0.5,
                    tech_mu=6.0, tech_sig=0.8, bus_mu=7.0, bus_sig=0.7),

    generate_career(125, "Architect",
                    math_mu=78, math_sig=5,  sci_mu=65, sci_sig=6,
                    log_mu=7.0, log_sig=0.7, cre_mu=9.0, cre_sig=0.5,
                    tech_mu=5.0, tech_sig=0.8, bus_mu=4.0, bus_sig=0.8),

    generate_career(125, "Psychologist",
                    math_mu=55, math_sig=6,  sci_mu=62, sci_sig=6,
                    log_mu=6.0, log_sig=0.7, cre_mu=8.0, cre_sig=0.6,
                    tech_mu=3.0, tech_sig=0.7, bus_mu=5.0, bus_sig=0.8),

    generate_career(125, "Civil Services",
                    math_mu=68, math_sig=6,  sci_mu=65, sci_sig=6,
                    log_mu=8.0, log_sig=0.6, cre_mu=6.0, cre_sig=0.7,
                    tech_mu=3.0, tech_sig=0.7, bus_mu=8.0, bus_sig=0.6),

    generate_career(125, "Doctor",
                    math_mu=82, math_sig=5,  sci_mu=95, sci_sig=3,
                    log_mu=7.5, log_sig=0.6, cre_mu=4.5, cre_sig=0.8,
                    tech_mu=4.0, tech_sig=0.8, bus_mu=3.0, bus_sig=0.7),

    generate_career(125, "Lawyer",
                    math_mu=58, math_sig=6,  sci_mu=50, sci_sig=6,
                    log_mu=9.0, log_sig=0.5, cre_mu=7.0, cre_sig=0.7,
                    tech_mu=2.5, tech_sig=0.7, bus_mu=7.0, bus_sig=0.7),

    generate_career(125, "Teacher",
                    math_mu=65, math_sig=6,  sci_mu=70, sci_sig=6,
                    log_mu=6.0, log_sig=0.7, cre_mu=7.5, cre_sig=0.7,
                    tech_mu=3.5, tech_sig=0.8, bus_mu=4.5, bus_sig=0.8),
]

data = pd.concat(careers).sample(frac=1, random_state=42).reset_index(drop=True)
data.to_csv("advanced_dataset.csv", index=False)
print(f"  [OK] Dataset saved -> advanced_dataset.csv  ({len(data)} rows, {data['career'].nunique()} careers)")
print(f"       Careers: {list(data['career'].unique())}")

X = data.drop("career", axis=1)
y = data["career"]

# ─────────────────────────────────────────────────────────────────
# STEP 2: Train Random Forest Classifier
# ─────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 2: Training Random Forest Classifier")
print("=" * 60)

rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_split=4,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X, y)
pickle.dump(rf_model, open("career_model.pkl", "wb"))

# Quick accuracy check
from sklearn.model_selection import cross_val_score
cv_scores = cross_val_score(rf_model, X, y, cv=5)
print(f"  [OK] Random Forest trained | 5-Fold CV Accuracy: {cv_scores.mean():.3f} +/- {cv_scores.std():.3f}")

# ─────────────────────────────────────────────────────────────────
# STEP 3: HDBSCAN Clustering with Named Personas
# ─────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 3: HDBSCAN Clustering -> Named Student Personas")
print("=" * 60)

# Standardize for clustering
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
pickle.dump(scaler, open("scaler.pkl", "wb"))

clusterer = hdbscan.HDBSCAN(
    min_cluster_size=8,
    min_samples=3,
    metric='euclidean',
    cluster_selection_method='leaf',
    cluster_selection_epsilon=0.3,
    alpha=0.8
)
cluster_labels = clusterer.fit_predict(X_scaled)
pickle.dump(clusterer, open("cluster_model.pkl", "wb"))

unique_labels = sorted(set(cluster_labels))
print(f"  Clusters found: {[l for l in unique_labels if l != -1]}  (noise: {(cluster_labels == -1).sum()} points)")

# ── Auto-name clusters based on dominant skill feature ──
# Persona rules (highest mean feature -> name)
PERSONA_RULES = [
    ("tech",     "The Tech Innovator"),
    ("logical",  "The Analytical Thinker"),
    ("creative", "The Creative Visionary"),
    ("business", "The Business Strategist"),
    ("science",  "The Deep Researcher"),
    ("math",     "The Mathematical Mind"),
]

feature_cols = list(X.columns)  # math, science, logical, creative, tech, business

def name_cluster(cluster_id, cluster_mask, X_df):
    """Name a cluster by its highest mean feature relative to global mean."""
    global_means = X_df.mean()
    cluster_means = X_df[cluster_mask].mean()
    relative = cluster_means - global_means
    dominant_feature = relative.idxmax()

    for feat, name in PERSONA_RULES:
        if feat == dominant_feature:
            return name
    return "The Versatile Builder"

cluster_names = {}
cluster_centers = {}

# Handle noise (-1) separately
for label in unique_labels:
    if label == -1:
        continue
    mask = cluster_labels == label
    persona = name_cluster(label, mask, X)
    cluster_names[str(label)] = persona
    cluster_centers[str(label)] = X[mask].mean().tolist()
    print(f"  Cluster {label:2d}: {persona}  ({mask.sum()} members)")

# Map noise points to nearest cluster center
if -1 in unique_labels:
    noise_mask = cluster_labels == -1
    noise_X = X[noise_mask].values
    centers_arr = np.array([cluster_centers[str(l)] for l in sorted(cluster_names.keys(), key=int)])
    center_ids  = sorted(cluster_names.keys(), key=int)

    for i, noise_pt in enumerate(noise_X):
        dists = np.linalg.norm(centers_arr - noise_pt, axis=1)
        nearest = center_ids[np.argmin(dists)]
        # We'll handle noise remapping in app.py at inference time

cluster_names["-1"] = "The Versatile Builder"
cluster_centers["-1"] = list(X.mean())

with open("cluster_names.json", "w") as f:
    json.dump(cluster_names, f, indent=2)
with open("cluster_centers.json", "w") as f:
    json.dump(cluster_centers, f, indent=2)

print(f"\n  [OK] cluster_names.json saved -> {len(cluster_names)} personas")
print(f"  [OK] cluster_centers.json saved")

# ─────────────────────────────────────────────────────────────────
# STEP 4: PCA (3D) for Persona Scatter Map
# ─────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 4: PCA Dimensionality Reduction (3D)")
print("=" * 60)

pca = PCA(n_components=2)
pca.fit(X_scaled)
pickle.dump(pca, open("pca_model.pkl", "wb"))
explained = pca.explained_variance_ratio_.sum() * 100
print(f"  [OK] PCA trained | Explained variance: {explained:.1f}%")

# Save PCA reference data for scatter plot (sample 200 points)
pca_all = pca.transform(X_scaled)
sample_idx = np.random.choice(len(pca_all), size=min(200, len(pca_all)), replace=False)
pca_ref = [
    {"x": round(float(pca_all[i][0]), 3), "y": round(float(pca_all[i][1]), 3), "career": str(y.iloc[i])}
    for i in sample_idx
]
with open("pca_reference.json", "w") as f:
    json.dump(pca_ref, f)
print(f"  [OK] pca_reference.json saved ({len(pca_ref)} reference points)")

# ─────────────────────────────────────────────────────────────────
# STEP 5: SHAP Background Data
# ─────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 5: Saving SHAP background data")
print("=" * 60)

shap_background = X.sample(100, random_state=42)
pickle.dump(shap_background, open("shap_background.pkl", "wb"))
print(f"  [OK] shap_background.pkl saved (100 representative rows)")

# ─────────────────────────────────────────────────────────────────
# STEP 6: PyTorch SkillEmbedder (Confidence Calibrator)
# ─────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 6: Training PyTorch SkillEmbedder (confidence calibrator)")
print("=" * 60)

train_confidence_model(X, y, rf_model, save_path="confidence_model.pt", epochs=80)

# ─────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("[DONE] ALL PHASE 1 MODELS TRAINED & SAVED")
print("=" * 60)
print("  career_model.pkl      - Random Forest classifier")
print("  cluster_model.pkl     - HDBSCAN clusterer")
print("  cluster_names.json    - Named student personas")
print("  cluster_centers.json  - Cluster centroids")
print("  pca_model.pkl         - PCA 3D reducer")
print("  scaler.pkl            - StandardScaler")
print("  shap_background.pkl   - SHAP baseline")
print("  confidence_model.pt   - PyTorch SkillEmbedder")
print("  advanced_dataset.csv  - 2000-row realistic dataset")
print("=" * 60)
