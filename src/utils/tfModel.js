import * as tf from '@tensorflow/tfjs';

let model;

export const loadModel = async () => {
  model = await tf.loadGraphModel('/model_web/model.json');
  console.log('Modelo cargado correctamente');
};

export const predictGesture = async (frameTensor) => {
  if (!model) return { gesture: 'Modelo no cargado', confidence: 0 };

  const prediction = model.predict(frameTensor);
  const predictionData = await prediction.array();
  const classId = predictionData[0].indexOf(Math.max(...predictionData[0]));
  const confidence = Math.max(...predictionData[0]);

  // Ajusta este mapeo con tus clases reales
  const classLabels = ['letra_A', 'letra_B', 'letra_C'];

  return { gesture: classLabels[classId], confidence };
};
