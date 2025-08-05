// src/components/VideoCapture.jsx
import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { loadModel, predictGesture } from "../utils/tfModel";

export default function VideoCapture() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [gesture, setGesture] = useState("");
    const [confidence, setConfidence] = useState("");

    useEffect(() => {
        let lastTensor = null;
        const THRESHOLD = 0.02;
        let isMounted = true;

        const startVideo = async () => {
            await loadModel();
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;

            // Create offscreen canvas once
            const canvas = document.createElement("canvas");
            canvas.width = 128;
            canvas.height = 128;
            canvasRef.current = canvas;

            async function analyzeFrame() {
                ctx.drawImage(video, 0, 0, width, height);

                tf.tidy(() => {
                    const imgTensor = tf.browser
                        .fromPixels(canvas)
                        .resizeNearestNeighbor([224, 224])
                        .toFloat()
                        .div(255)
                        .expandDims();

                    // calcula diff y decide si predecir
                    if (lastTensor) {
                        const diff = tf.metrics.mean(tf.abs(tf.sub(imgTensor, lastTensor))).dataSync()[0];
                        console.log("Diff:", diff);
                        if (diff < THRESHOLD) {
                            // sólo actualiza lastTensor
                            lastTensor.dispose();
                            lastTensor = imgTensor.clone();
                            return;
                        }
                    }

                    // llama a tu modelo
                    const preds = model.predict(imgTensor);
                    const data = preds.dataSync();
                    console.log("Predicción cruda:", data);
                    // … lógica de elegir y mostrar la clase …

                    // guarda este tensor para el próximo frame
                    if (lastTensor) lastTensor.dispose();
                    lastTensor = imgTensor.clone();

                    // limpia el tensor de salida del modelo
                    preds.dispose();
                });
            }

            analyzeFrame();
        };

        startVideo();

        return () => {
            isMounted = false;
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
            }
            if (canvasRef.current) {
                canvasRef.current = null;
            }
        };
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Inferencia en Tiempo Real (Web)</h2>
            <video ref={videoRef} autoPlay muted className="w-full max-w-lg rounded-lg shadow mb-4" />
            <p className="text-lg">
                Seña detectada: <strong>{gesture}</strong> ({confidence}%)
            </p>
        </div>
    );
}
