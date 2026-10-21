import unittest
import json
from app import app, init_db, DB_PATH
from disease_data import SYMPTOMS

class TestFlaskEndpoints(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()
        init_db()

    def test_home_page(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"MediPredict", res.data)
        self.assertIn(b"Launch Symptom Checker", res.data)

    def test_checker_page(self):
        res = self.client.get("/checker")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Select your", res.data)
        self.assertIn(b"symptoms", res.data)
        self.assertIn(b"fever", res.data)

    def test_about_page(self):
        res = self.client.get("/about")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"System Architecture", res.data)

    def test_conditions_catalog(self):
        res = self.client.get("/conditions")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Disease & Condition", res.data)
        self.assertIn(b"Common cold", res.data)

    def test_condition_detail(self):
        res = self.client.get("/conditions/Common cold")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Common cold", res.data)
        self.assertIn(b"Self-Care", res.data)

        # Non-existent condition should return 404
        res_404 = self.client.get("/conditions/NonExistentIllnessXYZ")
        self.assertEqual(res_404.status_code, 404)

    def test_analytics_page(self):
        res = self.client.get("/analytics")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Machine Learning", res.data)
        self.assertIn(b"Algorithm Benchmark Leaderboard", res.data)

    def test_history_page_and_csv_export(self):
        res = self.client.get("/history")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Prediction", res.data)

        res_csv = self.client.get("/export/csv")
        self.assertEqual(res_csv.status_code, 200)
        self.assertEqual(res_csv.content_type, "text/csv; charset=utf-8")
        self.assertIn(b"ID,Timestamp,Prediction", res_csv.data)

    def test_predict_form_validation(self):
        # Empty symptoms should return 400
        res = self.client.post("/predict", data={"symptoms": []})
        self.assertEqual(res.status_code, 400)
        self.assertIn(b"Please select at least one symptom", res.data)

    def test_predict_form_success(self):
        res = self.client.post("/predict", data={
            "symptoms": ["fever", "cough", "fatigue"],
            "age_group": "Adult (18-64)",
            "duration": "2-5 days"
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Pattern Analysis", res.data)
        self.assertIn(b"Confidence Match", res.data)
        self.assertIn(b"Recommended Home Care", res.data)

    def test_api_predict_json(self):
        # Valid JSON payload
        res = self.client.post(
            "/api/predict",
            data=json.dumps({"symptoms": ["headache", "sensitivity_to_light", "nausea"]}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("prediction", data)
        self.assertIn("confidence", data)
        self.assertIn("triage", data)
        self.assertIn("differential_diagnoses", data)
        self.assertGreater(len(data["differential_diagnoses"]), 0)

        # Invalid/empty payload
        res_err = self.client.post(
            "/api/predict",
            data=json.dumps({"symptoms": []}),
            content_type="application/json"
        )
        self.assertEqual(res_err.status_code, 400)

    def test_api_symptoms(self):
        res = self.client.get("/api/symptoms")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["total"], len(SYMPTOMS))

    def test_api_conditions(self):
        res = self.client.get("/api/conditions")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertGreaterEqual(data["total"], 16)

    def test_api_metrics(self):
        res = self.client.get("/api/metrics")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("champion_model", data["metadata"])

if __name__ == "__main__":
    unittest.main()
