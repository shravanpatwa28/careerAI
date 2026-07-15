"""
confidence_model.py
-------------------
PyTorch SkillEmbedder: A small MLP that re-calibrates the Random Forest's
raw confidence score. It learns from whether the RF was correct or not,
producing a more nuanced calibrated_confidence for the user.
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pickle
from sklearn.model_selection import train_test_split

# ─────────────────────────────────────────────
# Model Architecture
# ─────────────────────────────────────────────

class SkillEmbedder(nn.Module):
    """
    6-feature skill vector -> calibrated confidence score [0, 1]

    Architecture:
        Input(6) -> Linear(32) -> ReLU -> Dropout(0.2)
                 -> Linear(16) -> ReLU
                 -> Linear(1)  -> Sigmoid
    """
    def __init__(self):
        super(SkillEmbedder, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(6, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.network(x)


# ─────────────────────────────────────────────
# Training Function
# ─────────────────────────────────────────────

def train_confidence_model(X, y, rf_model, save_path="confidence_model.pt", epochs=80):
    """
    Train the SkillEmbedder to predict whether the RF model is correct.

    Args:
        X: Feature DataFrame (skills)
        y: True career labels
        rf_model: Trained RandomForestClassifier
        save_path: Where to save the .pt file
        epochs: Training epochs
    """
    print("Training PyTorch SkillEmbedder (confidence calibrator)...")

    # Generate calibration targets: 1.0 = RF was correct, 0.0 = RF was wrong
    rf_preds = rf_model.predict(X)
    calibration_targets = (rf_preds == y.values).astype(float)

    # Convert to tensors (normalize features to [0, 1] range)
    X_arr = X.values.astype(np.float32)

    # Normalize: marks /100, aptitude scores /10
    X_norm = X_arr.copy()
    X_norm[:, 0] = X_arr[:, 0] / 100.0   # math
    X_norm[:, 1] = X_arr[:, 1] / 100.0   # science
    X_norm[:, 2] = X_arr[:, 2] / 10.0    # logical
    X_norm[:, 3] = X_arr[:, 3] / 10.0    # creative
    X_norm[:, 4] = X_arr[:, 4] / 10.0    # tech
    X_norm[:, 5] = X_arr[:, 5] / 10.0    # business

    X_tensor = torch.tensor(X_norm)
    y_tensor = torch.tensor(calibration_targets, dtype=torch.float32).unsqueeze(1)

    # Train/val split
    X_train, X_val, y_train, y_val = train_test_split(
        X_tensor, y_tensor, test_size=0.2, random_state=42
    )

    model = SkillEmbedder()
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=25, gamma=0.5)

    best_val_loss = float('inf')
    best_state = None

    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()
        scheduler.step()

        if (epoch + 1) % 20 == 0:
            model.eval()
            with torch.no_grad():
                val_outputs = model(X_val)
                val_loss = criterion(val_outputs, y_val)
                val_acc = ((val_outputs > 0.5).float() == y_val).float().mean()
            print(f"  Epoch {epoch+1:3d}/{epochs} | Train Loss: {loss.item():.4f} | Val Loss: {val_loss.item():.4f} | Val Acc: {val_acc.item():.3f}")

            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_state = {k: v.clone() for k, v in model.state_dict().items()}

    if best_state:
        model.load_state_dict(best_state)

    torch.save(model.state_dict(), save_path)
    print(f"  [OK] SkillEmbedder saved -> {save_path}")
    return model


# ─────────────────────────────────────────────
# Inference Helper (used in app.py)
# ─────────────────────────────────────────────

def load_confidence_model(path="confidence_model.pt"):
    """Load the trained SkillEmbedder for inference."""
    model = SkillEmbedder()
    model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))
    model.eval()
    return model


def get_calibrated_confidence(model, features_list):
    """
    Args:
        model: loaded SkillEmbedder
        features_list: [math, science, logical, creative, tech, business]
    Returns:
        float: calibrated confidence in [0, 100]
    """
    arr = np.array(features_list, dtype=np.float32)
    # Normalize same way as training
    arr[0] /= 100.0   # math
    arr[1] /= 100.0   # science
    arr[2] /= 10.0    # logical
    arr[3] /= 10.0    # creative
    arr[4] /= 10.0    # tech
    arr[5] /= 10.0    # business

    tensor = torch.tensor(arr).unsqueeze(0)  # shape [1, 6]
    with torch.no_grad():
        confidence = model(tensor).item()
    return round(confidence * 100, 2)
