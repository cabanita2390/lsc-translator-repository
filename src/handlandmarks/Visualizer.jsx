// src/handlandmarks/Visualizer.jsx
import React, { useEffect, useRef } from "react";

export default function Visualizer({ videoRef, landmarks }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef?.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || landmarks.length !== 21) return;

    // Landmarks vienen normalizados 0..1 en (x,y), dibujamos invertido en X para espejo
    for (const [x, y] of landmarks.map(([x,y]) => [1 - x, y])) {
      const px = x * canvas.width;
      const py = y * canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [landmarks, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, width: 480, height: 360, pointerEvents: "none" }}
    />
  );
}
