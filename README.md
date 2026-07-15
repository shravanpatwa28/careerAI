# 🚀 CareerAI - Advanced AI Career Guidance System

CareerAI is a multi-model AI platform designed to help students (Class 10 and above) discover their ideal career path. By analyzing academic marks and personal aptitude, the system predicts a career, determines the student's learning persona, and provides a fully explainable step-by-step roadmap.

## ✨ Features
- **Multi-Model AI Pipeline**: Uses Random Forest for career prediction, HDBSCAN for learner persona clustering, and a PyTorch neural network for confidence calibration.
- **Explainable AI (XAI)**: Uses SHAP values to explain *why* the AI made its decision, making the process transparent.
- **Interactive Aptitude Wizard**: A 12-question quiz assessing logical, creative, technical, and business traits.
- **RAG-Powered Chatbot**: An embedded AI counselor (powered by LLaMA 3.3 via Groq) that provides personalized career advice using Retrieval-Augmented Generation.
- **16 Distinct Careers**: Covers Engineering, Medicine, Humanities, Arts, and Commerce.
- **Premium UI**: Built with React, Vite, Framer Motion, and Recharts, featuring a dynamic PCA scatter plot and a glassmorphism design.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Framer Motion, Recharts
- **Backend**: Python, Flask, Scikit-Learn, PyTorch, SHAP, HDBSCAN, Groq API (LLaMA)
- **Deployment**: Docker, Docker Compose, Nginx, Render.com

## ⚙️ How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- A [Groq API Key](https://console.groq.com/keys)

### 1. Setup the Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt

# Create a .env file and add your Groq API key:
# GROQ_API_KEY=gsk_your_key_here

# Train the ML models (Generates the dataset and .pkl files)
python train_ml.py

# Start the Flask API
$env:PYTHONIOENCODING="utf-8"
python app.py
```

### 2. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

## 🐳 Running with Docker
```bash
docker-compose up --build
```
The app will be available at `http://localhost`.

## 📈 Machine Learning Details
- **Random Forest Classifier**: Achieves ~88% cross-validation accuracy on a generated dataset of 2,000 students.
- **HDBSCAN**: Identifies natural groupings in the skill-space to assign unique "Learner Personas" (e.g., *The Analytical Thinker*, *The Creative Visionary*).
- **PCA**: Reduces 6-dimensional skill vectors into 2 dimensions for visual technical analysis on the dashboard.
