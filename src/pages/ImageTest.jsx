import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useNavigate } from 'react-router-dom';

const classLabels = ['letra_A', 'letra_B', 'letra_C'];

const testImages = [
  { label: 'Letra A 1', path: '/test_images/letra_A_1.jpg' },
  { label: 'Letra A 2', path: '/test_images/letra_A_2.jpg' },
  { label: 'Letra A 3', path: '/test_images/letra_A_3.jpg' },
  { label: 'Letra A 4', path: '/test_images/letra_A_4.jpg' },
  { label: 'Letra A 5', path: '/test_images/letra_A_5.jpg' },
  { label: 'Letra B 1', path: '/test_images/letra_B_1.jpg' },
  { label: 'Letra B 2', path: '/test_images/letra_B_2.jpg' },
  { label: 'Letra B 3', path: '/test_images/letra_B_3.jpg' },
  { label: 'Letra B 4', path: '/test_images/letra_B_4.jpg' },
  { label: 'Letra B 5', path: '/test_images/letra_B_5.jpg' },
  { label: 'Letra C 1', path: '/test_images/letra_C_1.jpg' },
  { label: 'Letra C 2', path: '/test_images/letra_C_2.jpg' },
  { label: 'Letra C 3', path: '/test_images/letra_C_3.jpg' },
  { label: 'Letra C 4', path: '/test_images/letra_C_4.jpg' },
  { label: 'Letra C 5', path: '/test_images/letra_C_5.jpg' },
];

const ImageTest = () => {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState('');
  const [previewSrc, setPreviewSrc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    tf.loadGraphModel('/model_web/model.json')
      .then(m => {
        setModel(m);
        console.log('Modelo cargado correctamente');
      })
      .catch(err => console.error('Error cargando modelo:', err));
  }, []);

  const handleImagePrediction = async (imagePath) => {
    if (!model) return;
    setPreviewSrc(imagePath);

    const image = new Image();
    image.src = imagePath;
    image.crossOrigin = 'anonymous';
    image.onload = async () => {
      const tensor = tf.browser.fromPixels(image)
        .resizeNearestNeighbor([128, 128])
        .toFloat()
        .expandDims(0)
        .div(255.0);

      const predictionTensor = model.predict(tensor);
      const predictionData = await predictionTensor.array();
      const classId = predictionData[0].indexOf(Math.max(...predictionData[0]));
      const confidenceValue = Math.max(...predictionData[0]);

      setPrediction(classLabels[classId]);
      setConfidence((confidenceValue * 100).toFixed(1));
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    handleImagePrediction(url);
  };

  return (
    <div className="image-test-container">
      <h2 className="title">🎯 Prueba de Inferencia con Imágenes</h2>

      {previewSrc && (
        <img
          src={previewSrc}
          alt="Preview"
          className="preview-image"
        />
      )}

      <div className="button-grid">
        {testImages.map(img => (
          <button
            key={img.path}
            onClick={() => handleImagePrediction(img.path)}
            className={`image-button ${img.label.includes('A') ? 'btn-a' : img.label.includes('B') ? 'btn-b' : 'btn-c'}`}
          >
            {img.label}
          </button>
        ))}
      </div>

      <div className="file-upload-wrapper">
        <label htmlFor="file-upload" className="custom-file-upload">
          📂 Seleccionar Imagen
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {prediction && (
        <p className="result">
          ✅ Predicción: <strong>{prediction}</strong> ({confidence}%)
        </p>
      )}

      <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate('/')}>
          🔙 Volver a Inicio
        </button>
      </div>
    </div>
  );
};

export default ImageTest;

// CSS embebido
const style = document.createElement('style');
style.textContent = `
.image-test-container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(to right, #fdfbfb, #ebedee);
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', sans-serif;
  text-align: center;
  border: 2px solid #ddd;
}

.title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #222;
}

.preview-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 1rem;
  border: 2px solid #999;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.button-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
}

.image-button {
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
}

.image-button:hover {
  transform: scale(1.05);
}

.btn-a {
  background-color: #3498db;
}
.btn-a:hover {
  background-color: #2980b9;
}

.btn-b {
  background-color: #e67e22;
}
.btn-b:hover {
  background-color: #d35400;
}

.btn-c {
  background-color: #9b59b6;
}
.btn-c:hover {
  background-color: #8e44ad;
}

.file-upload-wrapper {
  margin-top: 1.5rem;
  margin-bottom: 2rem; /* ← Aumentamos espacio inferior */
  position: relative;
  display: inline-block;
}

.custom-file-upload {
  background-color: #2ecc71;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.custom-file-upload:hover {
  background-color: #27ae60;
}

input[type="file"] {
  display: none;
}

.result {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  color: #222;
  background-color: #f1f1f1;
  padding: 0.8rem;
  border-radius: 8px;
  display: inline-block;
}

.back-button-wrapper {
  margin-top: 2rem;
}

.back-button {
  background-color: #e74c3c;
  color: white;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.back-button:hover {
  background-color: #c0392b;
  transform: scale(1.05);
}
`;
document.head.appendChild(style);
