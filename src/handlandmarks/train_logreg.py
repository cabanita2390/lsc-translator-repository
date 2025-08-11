# scripts/train_logreg.py
# Uso:
#   pip install pandas numpy scikit-learn
#   python scripts/train_logreg.py --csv abc_landmarks.csv --out public/weights.json
import argparse, json
import numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

parser = argparse.ArgumentParser()
parser.add_argument("--csv", required=True)
parser.add_argument("--out", required=True)
args = parser.parse_args()

df = pd.read_csv(args.csv)
labels = df['label'].values
X = df.drop(columns=['label']).values.astype(np.float32)
y_map = {l:i for i,l in enumerate(sorted(np.unique(labels)))}
y = np.array([y_map[l] for l in labels], dtype=np.int64)

clf = LogisticRegression(max_iter=200, multi_class='multinomial', solver='lbfgs')
clf.fit(X, y)
pred = clf.predict(X)
print(classification_report(y, pred, target_names=[k for k,_ in sorted(y_map.items(), key=lambda kv: kv[1])]))
print(confusion_matrix(y, pred))

W = clf.coef_.tolist()   # shape: [3, 63]
b = clf.intercept_.tolist()  # shape: [3]
labels_sorted = [k for k,_ in sorted(y_map.items(), key=lambda kv: kv[1])]

with open(args.out, "w") as f:
  json.dump({"W": W, "b": b, "labels": labels_sorted}, f, indent=2)
print("Pesos guardados en", args.out)
