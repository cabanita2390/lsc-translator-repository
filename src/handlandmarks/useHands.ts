// src/handlandmarks/useHands.ts
import { useEffect, useRef } from "react";

// Instala: npm i @mediapipe/hands @mediapipe/camera_utils
// y añade <video ref={videoRef} /> en tu componente.

declare global {
  interface Window { Camera: any; }
}

export function useHands(onLandmarks: (lm: number[][]) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let camera: any;
    let hands: any;

    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const { Hands } = await import("@mediapipe/hands");
      await import("@mediapipe/camera_utils");

      hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
        modelComplexity: 1,
      });

      hands.onResults((res: any) => {
        const lm = res.multiHandLandmarks?.[0];
        if (lm && lm.length === 21) {
          // lm: [{x,y,z}, ...]
          onLandmarks(lm.map((p: any) => [p.x, p.y, p.z]));
        } else {
          onLandmarks([]);
        }
      });

      camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => { await hands.send({ image: videoRef.current! }); },
        width: 640,
        height: 480,
      });

      camera.start();
    }

    init();
    return () => {
      try { camera?.stop(); } catch {}
    };
  }, [onLandmarks]);

  return { videoRef };
}
