// src/App.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useHands } from "./handlandmarks/useHands";
import { normalizeLandmarks } from "./handlandmarks/landmarkUtils";
import { loadWeights, predictProba } from "./handlandmarks/classifier";
import { smoothProbs, decide } from "./handlandmarks/smoothing";
import Visualizer from "./handlandmarks/Visualizer";

export default function App() {
    const [label, setLabel] = useState("-");
    const [conf, setConf] = useState(0);
    const [ready, setReady] = useState(false);
    const [lastLm, setLastLm] = useState(null);

    const onLm = useCallback((lm) => {
        setLastLm(lm && lm.length === 21 ? lm : null);
        const feat = normalizeLandmarks(lm);
        if (!feat) {
            setLabel("-");
            setConf(0);
            return;
        }
        try {
            const { labels, probs } = predictProba(feat);
            const pSm = smoothProbs(probs, 0.6);
            const d = decide(labels, pSm, 0.7);
            setLabel(d || "-");
            setConf(Math.max(...pSm));
        } catch (e) {
            // Pesos aún no cargados; ignoramos hasta que estén listos
        }
    }, []);

    const { videoRef } = useHands(onLm);

    useEffect(() => {
        loadWeights("/public/weights.json")
            .then(() => setReady(true))
            .catch((err) => {
                console.error("Error cargando weights.json:", err);
                setReady(false);
            });
    }, []);

    return (
        <div style={{ padding: 16, position: "relative", width: 480 }}>
            <h2>Demo A/B/C con landmarks</h2>
            <div style={{ position: "relative" }}>
                <video ref={videoRef} style={{ width: 480, transform: "scaleX(-1)" }} autoPlay muted playsInline />
                <Visualizer videoRef={videoRef} landmarks={lastLm} />
            </div>

            <div style={{ marginTop: 8, fontSize: 24 }}>
                Predicción: <b>{label}</b> &nbsp; Confianza: {conf.toFixed(2)}
            </div>
            <p>Umbral: 0.70 · Suavizado EMA: 0.6</p>
            {!ready && <p style={{ color: "#a00" }}>Cargando pesos… (weights.json)</p>}
        </div>
    );
}
