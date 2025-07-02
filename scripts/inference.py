import os
import cv2
import numpy as np
import tensorflow as tf

# Configuración
MODEL_PATH = 'lsc_model_colab.h5'
IMAGE_SIZE = (128, 128)

# Cargar el modelo entrenado
model = tf.keras.models.load_model(MODEL_PATH)

# Mapear índices de clase a etiquetas
import json

# Leer mapeo de clases desde archivo
with open('class_indices_colab.json', 'r') as f:
    class_indices = json.load(f)

class_labels = {v: k for k, v in class_indices.items()}


def preprocess_frame(frame):
    frame = cv2.resize(frame, IMAGE_SIZE)
    frame = frame.astype('float32') / 255.0
    frame = np.expand_dims(frame, axis=0)
    return frame

def predict_gesture(frame):
    processed = preprocess_frame(frame)
    prediction = model.predict(processed)
    class_id = np.argmax(prediction)
    confidence = np.max(prediction)
    return class_labels[class_id], confidence

def main():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print('Error al acceder a la cámara.')
        return

    print('Iniciando inferencia en tiempo real. Presiona "q" para salir.')

    while True:
        ret, frame = cap.read()
        if not ret:
            print('Error al capturar el frame.')
            break

        gesture, confidence = predict_gesture(frame)

        # Mostrar resultado en pantalla
        cv2.putText(frame, f'{gesture} ({confidence*100:.1f}%)', (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow('Inference - Lengua de Señas Colombiana', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
