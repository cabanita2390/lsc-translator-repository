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

        const startVideo = async () => {
            try {
                await loadModel();

                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = videoRef.current;

                if (video) {
                    video.srcObject = stream;

                    video.onloadedmetadata = () => {
                        video.play();
                    };

                    const canvas = document.createElement("canvas");
                    canvas.width = 128;
                    canvas.height = 128;
                    canvasRef.current = canvas;
                    const ctx = canvas.getContext("2d");

                    async function analyzeFrame() {
                        if (!video || video.readyState < 2) {
                            requestAnimationFrame(analyzeFrame);
                            return;
                        }

                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const imgTensor = tf.browser
                            .fromPixels(canvas)
                            .resizeNearestNeighbor([128, 128])
                            .toFloat()
                            .div(255.0)
                            .expandDims();

                        let shouldPredict = true;

                        if (lastTensor) {
                            const diff = tf.metrics.meanAbsoluteError(lastTensor, imgTensor).dataSync()[0];
                            if (diff < THRESHOLD) {
                                shouldPredict = false;
                            }
                        }

                        if (shouldPredict) {
                            const result = await predictGesture(imgTensor);
                            setGesture(result.gesture);
                            setConfidence((result.confidence * 100).toFixed(2));
                        }

                        if (lastTensor) lastTensor.dispose();
                        lastTensor = imgTensor.clone();
                        imgTensor.dispose();

                        requestAnimationFrame(analyzeFrame);
                    }

                    analyzeFrame();
                }
            } catch (error) {
                console.error("Error al iniciar video:", error);
            }
        };

        startVideo();

        return () => {
            const video = videoRef.current;
            if (video?.srcObject) {
                video.srcObject.getTracks().forEach((t) => t.stop());
            }
            if (canvasRef.current) {
                canvasRef.current = null;
            }
        };
    }, []);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Inferencia en Tiempo Real (Web)</h2>
            <div style={styles.videoWrapper}>
                <video ref={videoRef} autoPlay muted playsInline style={styles.video} />
            </div>
            <p style={styles.result}>
                Seña detectada: <strong>{gesture}</strong> ({confidence}%)
            </p>
        </div>
    );
}

const styles = {
    container: {
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f3f3f3",
        borderRadius: "10px",
        maxWidth: "720px",
        margin: "0 auto",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    title: {
        fontSize: "22px",
        fontWeight: "bold",
        marginBottom: "16px",
        color: "#222",
        textAlign: "center",
    },
    videoWrapper: {
        position: "relative",
        width: "100%",
        maxWidth: "640px",
        margin: "0 auto 20px auto",
        backgroundColor: "#000", // fondo por si no carga la cámara
        borderRadius: "8px",
        overflow: "hidden",
    },
    video: {
        width: "100%",
        height: "auto",
        borderRadius: "8px",
        display: "block",
    },
    result: {
        fontSize: "18px",
        color: "#333",
        textAlign: "center",
        backgroundColor: "#ffffff",
        padding: "10px",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
    },
};
