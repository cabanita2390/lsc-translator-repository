import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const classLabels = ['letra_A', 'letra_B', 'letra_C']; // Ajusta según tu mapeo real

// 1️⃣ Listado de rutas a las imágenes estáticas
const testImages = [
  // Letra A
  { label: 'Letra A 1', path: '/test_images/letra_A_1.jpg' },
  { label: 'Letra A 2', path: '/test_images/letra_A_2.jpg' },
  { label: 'Letra A 3', path: '/test_images/letra_A_3.jpg' },
  { label: 'Letra A 4', path: '/test_images/letra_A_4.jpg' },
  { label: 'Letra A 5', path: '/test_images/letra_A_5.jpg' },
  // Letra B
  { label: 'Letra B 1', path: '/test_images/letra_B_1.jpg' },
  { label: 'Letra B 2', path: '/test_images/letra_B_2.jpg' },
  { label: 'Letra B 3', path: '/test_images/letra_B_3.jpg' },
  { label: 'Letra B 4', path: '/test_images/letra_B_4.jpg' },
  { label: 'Letra B 5', path: '/test_images/letra_B_5.jpg' },
  // Letra C
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
  const [previewSrc, setPreviewSrc] = useState(''); // Para mostrar la imagen actual

  useEffect(() => {
    // Carga el modelo TensorFlow.js al montar el componente
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
      // Preprocesamiento
      const tensor = tf.browser.fromPixels(image)
        .resizeNearestNeighbor([128, 128])
        .toFloat()
        .expandDims(0)
        .div(255.0);

      // Predicción
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Prueba de Inferencia con Imágenes</h2>

      {/* Vista previa de la imagen seleccionada */}
      {previewSrc && (
        <img
          src={previewSrc}
          alt="Preview"
          className="mb-4 max-w-xs rounded border"
        />
      )}

      {/* Botones dinámicos */}
      <div className="flex flex-wrap gap-2 mb-4">
        {testImages.map(img => (
          <button
            key={img.path}
            onClick={() => handleImagePrediction(img.path)}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            {img.label}
          </button>
        ))}
      </div>

      {/* Selector de archivos */}
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block"
        />
      </div>

      {/* Resultados */}
      {prediction && (
        <p className="text-lg">
          Predicción: <strong>{prediction}</strong> ({confidence}%)
        </p>
      )}
    </div>
  );
};

export default ImageTest;
