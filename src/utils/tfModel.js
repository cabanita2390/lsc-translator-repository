import * as tf from "@tensorflow/tfjs";

let model;

export const loadModel = async () => {
    try {
        model = await tf.loadGraphModel("/model_web/model.json");
        console.log("✅ Modelo cargado correctamente");
    } catch (error) {
        console.error("❌ Error al cargar el modelo:", error);
    }
};

export const predictGesture = async (frameTensor) => {
    if (!model) {
        console.error("⚠️ Modelo no cargado.");
        return { gesture: "Modelo no cargado", confidence: 0 };
    }

    try {
        const prediction = model.predict(frameTensor);
        const predictionData = await prediction.data();
        prediction.dispose();

        const classId = predictionData.indexOf(Math.max(...predictionData));
        const confidence = Math.max(...predictionData);
        const classLabels = ["letra_A", "letra_B", "letra_C"];

        return { gesture: classLabels[classId], confidence };
    } catch (error) {
        console.error("❌ Error en predictGesture:", error);
        return { gesture: "Error", confidence: 0 };
    }
};
