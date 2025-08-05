import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { loadModel, predictGesture } from "../utils/tfModel";

export default function VideoCapture() {
    const videoRef = useRef(null);
    const canvasRef = useRef(document.createElement("canvas"));
    const [gesture, setGesture] = useState("");
    const [confidence, setConfidence] = useState("");
    const [cameraState, setCameraState] = useState("idle");
    const animationRef = useRef(null); // Usamos RAF en vez de setInterval

    useEffect(() => {
        const startVideo = async () => {
            setCameraState("loading");
            try {
                await loadModel();
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = videoRef.current;
                video.srcObject = stream;

                video.onloadedmetadata = async () => {
                    await video.play();
                    setCameraState("ready");
                    analyzeFrame(); // Inicia el ciclo de inferencia
                };
            } catch (error) {
                console.error("Error al acceder a la cámara:", error);
                setCameraState("error");
            }
        };

        const analyzeFrame = async () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (!video || !canvas || video.readyState !== 4) {
                animationRef.current = requestAnimationFrame(analyzeFrame);
                return;
            }

            const ctx = canvas.getContext("2d");
            canvas.width = 128;
            canvas.height = 128;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            let imgTensor;

            try {
                imgTensor = tf.browser
                    .fromPixels(canvas)
                    .resizeNearestNeighbor([128, 128])
                    .toFloat()
                    .div(255.0)
                    .expandDims();

                const result = await predictGesture(imgTensor);
                setGesture(result.gesture);
                setConfidence((result.confidence * 100).toFixed(2));
            } catch (error) {
                console.error("Error en la inferencia:", error);
                setGesture("Error");
                setConfidence("0");
            } finally {
                if (imgTensor) imgTensor.dispose();
                animationRef.current = requestAnimationFrame(analyzeFrame);
            }
        };

        startVideo();

        return () => {
            cancelAnimationFrame(animationRef.current);
            const video = videoRef.current;
            if (video?.srcObject) {
                video.srcObject.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const renderMessage = () => {
        switch (cameraState) {
            case "loading":
                return <p style={styles.loading}>Cargando cámara...</p>;
            case "error":
                return <p style={{ ...styles.loading, color: "red" }}>Error al acceder a la cámara.</p>;
            default:
                return null;
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Inferencia en Tiempo Real (Web)</h2>
            {renderMessage()}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ ...styles.video, display: cameraState === "ready" ? "block" : "none" }}
            />
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
    video: {
        width: "100%",
        maxWidth: "640px",
        borderRadius: "8px",
        boxShadow: "0 0 8px rgba(0,0,0,0.3)",
        margin: "0 auto 20px auto",
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
    loading: {
        fontSize: "18px",
        color: "#555",
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#e9e9e9",
        borderRadius: "8px",
    },
};
