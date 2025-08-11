import React, { useCallback, useRef, useState } from "react";
import { useHands } from "./useHands";
import { normalizeLandmarks } from "./landmarkUtils";

export default function CollectPage() {
  const [label, setLabel] = useState("A");
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const downloadRef = useRef(null);

  const onLm = useCallback((lm) => {
    if (!lm || lm.length !== 21) return;
    const feat = normalizeLandmarks(lm);
    if (!feat) return;
    if (count % 3 === 0) setRows((r) => [...r, { label, features: feat }]);
    setCount((c) => c + 1);
  }, [label, count]);

  const { videoRef } = useHands(onLm);

  function downloadCSV() {
    const header = ["label", ...Array.from({ length: 63 }, (_, i) => `f${i}`)];
    const lines = [header.join(",")];
    for (const r of rows) lines.push([r.label, ...r.features.map((v) => v.toFixed(6))].join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    if (downloadRef.current) {
      downloadRef.current.href = url;
      downloadRef.current.download = "abc_landmarks.csv";
      downloadRef.current.click();
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Recolección A/B/C</h2>
      <video ref={videoRef} style={{ width: 480, transform: "scaleX(-1)" }} autoPlay muted playsInline />
      <div style={{ marginTop: 8 }}>
        <label>Etiqueta: </label>
        <select value={label} onChange={(e) => setLabel(e.target.value)}>
          <option>A</option><option>B</option><option>C</option>
        </select>
        <button onClick={downloadCSV} style={{ marginLeft: 8 }}>
          Descargar CSV ({rows.length} muestras)
        </button>
        <a ref={downloadRef} style={{ display: "none" }}>download</a>
      </div>
      <p>Varía luz, distancia y mano (izq/der). Mantén la mano centrada.</p>
    </div>
  );
}
