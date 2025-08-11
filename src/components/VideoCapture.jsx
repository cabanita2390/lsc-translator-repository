import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { loadModel, predictGesture } from "../utils/tfModel";

export default function VideoCapture() {
  const videoRef = useRef(null);
  const [gesture, setGesture] = useState("Cargando...");
  const [confidence, setConfidence] = useState("");

  useEffect(() => {
    let animationFrameId;
    let _isMounted = true;
    let modelInstance = null;
    let stream = null;

    const startVideo = async () => {
      try {
        console.log("Iniciando la carga del modelo...");
        modelInstance = await loadModel();
        if (!modelInstance) {
          console.error("No se pudo cargar el modelo. Deteniendo la aplicación.");
          setGesture("Error de carga");
          return;
        }
        console.log("Modelo cargado exitosamente.");
        setGesture("Listo para detectar");
        
        console.log("Accediendo a la cámara...");
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = videoRef.current;
        if (!video) {
          console.error("Referencia del video no encontrada.");
          return;
        }

        video.srcObject = stream;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            console.log("Metadatos del video cargados.");
            video.play();
            resolve();
          };
        });

        // Espera un breve momento para asegurar que el video esté reproduciéndose
        setTimeout(() => analyzeFrame(modelInstance), 500);

      } catch (err) {
        console.error("Error al iniciar la cámara o cargar el modelo:", err);
        setGesture("Error: " + err.name);
      }
    };

    const analyzeFrame = async (model) => {
      if (!_isMounted || !videoRef.current || videoRef.current.readyState < 2) {
        // La condición `readyState < 2` asegura que el video esté listo
        animationFrameId = requestAnimationFrame(() => analyzeFrame(model));
        return;
      }

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      
      // Dibujar la imagen del video en el canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Usar tf.tidy para liberar la memoria de los tensores
      tf.tidy(() => {
        try {
          const imgTensor = tf.browser
            .fromPixels(canvas)
            .toFloat()
            .div(tf.scalar(255))
            .expandDims(0);

          predictGesture(model, imgTensor)
            .then((preds) => {
              if (_isMounted) { // Comprueba si el componente sigue montado
                setGesture(preds.gesture || "");
                setConfidence(preds.confidence ? (preds.confidence * 100).toFixed(2) : "");
              }
            })
            .catch((err) => {
              console.error("Error en la predicción:", err);
              if (_isMounted) {
                setGesture("Error de predicción");
                setConfidence("");
              }
            });
        } catch (err) {
          console.error("Error en el procesamiento del tensor:", err);
        }
      });

      animationFrameId = requestAnimationFrame(() => analyzeFrame(model));
    };

    startVideo();

    return () => {
      _isMounted = false;
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (modelInstance) {
        modelInstance.dispose();
      }
    };
  }, []);

  return (
    <>
      <style>{`
        .container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #2a2a72, #009ffd);
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
        }
        h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          text-shadow: 0 2px 6px rgba(0,0,0,0.7);
        }
        video {
          width: 100%;
          max-width: 500px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.7);
          background-color: #111;
          aspect-ratio: 4 / 3;
          margin-bottom: 1.5rem;
          border: 4px solid #00d2ff;
        }
        .gesture-box {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          box-shadow: inset 0 0 10px rgba(255,255,255,0.2);
          user-select: none;
        }
        .gesture-label {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }
        .gesture-value {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ffdd57;
          text-shadow: 0 0 8px #ffdd57;
          margin-bottom: 0.5rem;
        }
        .confidence {
          font-size: 1rem;
          font-weight: 500;
          color: #cde1f9;
          text-shadow: 0 0 5px rgba(0,0,0,0.4);
        }
      `}</style>
      <div className="container">
        <h2>Inferencia en Tiempo Real (Web)</h2>
        <video ref={videoRef} autoPlay muted playsInline />
        <div className="gesture-box">
          <div className="gesture-label">Seña detectada:</div>
          <div className="gesture-value">{gesture || "—"}</div>
          <div className="confidence">
            Confianza: {confidence ? `${confidence}%` : "—"}
          </div>
        </div>
      </div>
    </>
  );
}