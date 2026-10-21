import unittest
import json
from pathlib import Path
import pickle
import numpy as np
import pandas as pd

from disease_data import SYMPTOMS, DISEASE_INFO, evaluate_triage_risk

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "disease_model.pkl"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.json"
DATA_PATH = BASE_DIR / "data" / "symptoms_dataset.csv"

class TestModelPipeline(unittest.TestCase):
    def setUp(self):
        self.assertTrue(MODEL_PATH.exists(), "Model binary should exist. Run train_model.py.")
        with MODEL_PATH.open("rb") as f:
            self.model = pickle.load(f)

    def test_dataset_integrity(self):
        self.assertTrue(DATA_PATH.exists(), "Dataset CSV must exist.")
        df = pd.read_csv(DATA_PATH)
        self.assertGreaterEqual(len(df), 100, "Dataset should have at least 100 samples.")
        for symptom in SYMPTOMS:
            self.assertIn(symptom, df.columns, f"Symptom '{symptom}' missing from dataset.")
        self.assertIn("condition", df.columns, "'condition' column missing from dataset.")
        self.assertFalse(df.isnull().any().any(), "Dataset must not have missing values.")

    def test_metadata_completeness(self):
        self.assertTrue(METADATA_PATH.exists(), "Metadata JSON must exist.")
        with METADATA_PATH.open("r", encoding="utf-8") as f:
            meta = json.load(f)
        
        required_keys = [
            "trained_at", "total_samples", "features", "classes",
            "champion_model", "champion_metrics", "model_comparison", "feature_importance"
        ]
        for key in required_keys:
            self.assertIn(key, meta, f"Missing key '{key}' in metadata.")

        self.assertGreaterEqual(len(meta["classes"]), 10, "Should cover at least 10 conditions.")
        self.assertGreaterEqual(meta["champion_metrics"]["test_accuracy"], 0.80, "Champion accuracy should be >= 80%.")

    def test_inference_shape_and_probability(self):
        # Create zero vector with fever and cough
        sample = [1 if s in ["fever", "cough", "fatigue"] else 0 for s in SYMPTOMS]
        features = pd.DataFrame([sample], columns=SYMPTOMS)

        prediction = self.model.predict(features)
        self.assertEqual(len(prediction), 1)
        self.assertIsInstance(str(prediction[0]), str)

        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(features)[0]
            self.assertAlmostEqual(float(np.sum(probs)), 1.0, places=2)
            self.assertEqual(len(probs), len(self.model.classes_))

    def test_triage_risk_engine(self):
        # High-risk red flag: shortness of breath + high fever
        triage_urgent = evaluate_triage_risk(["shortness_of_breath", "high_fever"])
        self.assertEqual(triage_urgent["level"], "Urgent Attention")
        self.assertGreater(len(triage_urgent["red_flags"]), 0)

        # Low-risk routine: mild sneezing + runny nose
        triage_low = evaluate_triage_risk(["sneezing", "runny_nose"], "Common cold")
        self.assertEqual(triage_low["level"], "Low / Routine")

    def test_disease_info_coverage(self):
        # Verify that all classes predicted by the model have detailed clinical info
        for cls_name in self.model.classes_:
            self.assertIn(cls_name, DISEASE_INFO, f"Condition '{cls_name}' lacks entry in DISEASE_INFO.")
            info = DISEASE_INFO[cls_name]
            self.assertIn("category", info)
            self.assertIn("description", info)
            self.assertIn("self_care", info)
            self.assertIn("when_to_see_doctor", info)
            self.assertIn("specialist", info)

if __name__ == "__main__":
    unittest.main()
