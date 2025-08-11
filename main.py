# main.py

# Importaciones necesarias para la aplicación
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import os
import json

# Definir la aplicación FastAPI
app = FastAPI()

# --- Configuración y carga del modelo de IA ---

# Ruta donde se espera encontrar el modelo de TensorFlow.
# La ruta corregida ahora apunta a la carpeta "model_web/" en la raíz.
MODEL_PATH = "model_web/"

# Variable para almacenar el modelo cargado
model = None
infer = None

# Cargar el modelo de TensorFlow previamente entrenado
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"La carpeta del modelo no se encontró en '{MODEL_PATH}'.")

    model = tf.saved_model.load(MODEL_PATH)
    infer = model.signatures["serving_default"]
    print("✅ Modelo de TensorFlow cargado en el backend.")
except FileNotFoundError as fnf_error:
    print(f"❌ Error al cargar el modelo: {fnf_error}")
    print("Asegúrate de que la carpeta 'model_web/' exista en el mismo directorio que este archivo.")
except Exception as e:
    print(f"❌ Error al cargar el modelo: {e}")
    print("Verifica que las dependencias estén instaladas y el modelo sea válido.")
    model = None

# --- Definir el esquema de datos para la API ---

# Usamos Pydantic para validar los datos que recibimos.
# Esto asegura que la API reciba un array de 21 coordenadas (x, y, z).
class HandLandmarks(BaseModel):
    landmarks: list[list[float]]

# --- Endpoints de la API ---

# Endpoint raíz para verificar que el servidor está funcionando
@app.get("/")
def read_root():
    return {"message": "¡Servidor de backend de LSC funcionando!", "status": "OK"}

# Endpoint para predecir la seña a partir de las coordenadas de la mano
@app.post("/predict_hand_pose")
async def predict_hand_pose(data: HandLandmarks):
    """
    Recibe las coordenadas de 21 puntos de la mano, las procesa
    y usa el modelo para predecir la seña correspondiente.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Modelo de IA no cargado. No se pueden hacer predicciones.")

    try:
        # Pre-procesar los datos
        # Aplanar la lista de coordenadas para que coincida con el formato del modelo
        input_data = np.array(data.landmarks, dtype=np.float32).flatten()
        input_data = np.expand_dims(input_data, axis=0)  # Añadir la dimensión del batch

        # Convertir a tensor
        input_tensor = tf.convert_to_tensor(input_data, dtype=tf.float32)

        # Hacer la predicción con el modelo
        predictions = infer(input_tensor)
        output_data = predictions['output_0'].numpy()

        # Encontrar el índice de la predicción con mayor probabilidad
        predicted_class_index = np.argmax(output_data)

        # Aquí deberías tener un mapeo de índices a las clases (letras o señas)
        # Por ahora, devolvemos solo el índice.
        # Puedes añadir un diccionario aquí para traducir el índice a una letra.
        # Por ejemplo: labels = ["A", "B", "C", ...]
        labels = [chr(ord('A') + i) for i in range(26)]
        predicted_label = labels[predicted_class_index] if predicted_class_index < len(labels) else "Desconocido"

        return {"prediction": predicted_label, "confidence": float(output_data[0][predicted_class_index])}

    except Exception as e:
        print(f"❌ Error en la predicción: {e}")
        raise HTTPException(status_code=500, detail=f"Ocurrió un error al procesar la predicción: {e}")
