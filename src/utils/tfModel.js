import * as tf from '@tensorflow/tfjs';

let model;

export const loadModel = async () => {
  if (model) return model;

  try {
    // Intenta cargar el modelo de la ruta local
    model = await tf.loadGraphModel('/model_web/model.json');
    console.log('Modelo cargado correctamente');
    return model;
  } catch (error) {
    console.error('Error al cargar el modelo. Asegúrate de que el path sea correcto y los archivos existan:', error);
    return null;
  }
};

export const predictGesture = async (modelInstance, frameTensor) => {
  if (!modelInstance) return { gesture: 'Modelo no cargado', confidence: 0 };

  try {
    const prediction = modelInstance.predict(frameTensor);
    const predictionData = await prediction.data();
    
    // Libera el tensor de la predicción para evitar fugas de memoria
    prediction.dispose();

    const classLabels = ['letra_A', 'letra_B', 'letra_C'];

    // Encontrar el índice de la clase con mayor confianza
    const classId = predictionData.indexOf(Math.max(...predictionData));
    const confidence = predictionData[classId];

    // console.log(`→ Predicción: ${classLabels[classId]} con ${(confidence * 100).toFixed(2)}% de confianza`);

    return { gesture: classLabels[classId], confidence };

  } catch (error) {
    console.error('Error durante la predicción:', error);
    return { gesture: 'Error de predicción', confidence: 0 };
  }
};