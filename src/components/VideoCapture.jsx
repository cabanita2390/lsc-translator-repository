import { useEffect, useRef, useState } from 'react';
import { loadModel, predictGesture } from '../utils/tfModel';
import * as tf from '@tensorflow/tfjs';

const VideoCapture = () => {
  const videoRef = useRef(null);
  const [gesture, setGesture] = useState('');
  const [confidence, setConfidence] = useState('');

  useEffect(() => {
    const startVideo = async () => {
      await loadModel();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      const interval = setInterval(() => {
        predictCurrentFrame();
      }, 500);

      return () => clearInterval(interval);
    };

    startVideo();
  }, []);

  const predictCurrentFrame = async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 128, 128);

    const imageData = ctx.getImageData(0, 0, 128, 128);
    const frameTensor = tf.browser.fromPixels(imageData).expandDims(0).div(255.0);

    const result = await predictGesture(frameTensor);
    setGesture(result.gesture);
    setConfidence((result.confidence * 100).toFixed(1));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inferencia en Tiempo Real (Web)</h2>
      <video ref={videoRef} autoPlay className="w-full max-w-lg rounded-lg shadow mb-4" />
      <p className="text-lg">Seña detectada: {gesture} ({confidence}%)</p>
    </div>
  );
};

export default VideoCapture;
