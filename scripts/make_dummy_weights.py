# scripts/make_dummy_weights.py
import json, os
os.makedirs("public", exist_ok=True)
W = [[0.0]*63 for _ in range(3)]  # 3 clases x 63 features
b = [0.0, 0.0, 0.0]
labels = ["A","B","C"]
with open("public/weights.json", "w") as f:
    json.dump({"W": W, "b": b, "labels": labels}, f, indent=2)
print("Listo: public/weights.json")
