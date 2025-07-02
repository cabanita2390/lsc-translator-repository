import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint

# Configuración de rutas
DATASET_DIR = 'dataset_split'
IMAGE_SIZE = (128, 128)
BATCH_SIZE = 32
EPOCHS = 10
MODEL_NAME = 'lsc_model.h5'

def build_model(input_shape, num_classes):
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        MaxPooling2D(2, 2),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(num_classes, activation='softmax')
    ])
    return model

def main():
    # Preprocesamiento de imágenes
    datagen = ImageDataGenerator(rescale=1.0/255)

    train_generator = datagen.flow_from_directory(
        os.path.join(DATASET_DIR, 'train'),
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    print('Mapeo de clases:', train_generator.class_indices)

    import json

    # Guardar mapeo de clases
    mapping_path = 'class_indices.json'
    with open(mapping_path, 'w') as f:
        json.dump(train_generator.class_indices, f)
    print(f'Mapeo de clases guardado en {mapping_path}: {train_generator.class_indices}')

    test_generator = datagen.flow_from_directory(
        os.path.join(DATASET_DIR, 'test'),
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    input_shape = (IMAGE_SIZE[0], IMAGE_SIZE[1], 3)
    num_classes = len(train_generator.class_indices)

    model = build_model(input_shape, num_classes)
    model.compile(optimizer=Adam(), loss='categorical_crossentropy', metrics=['accuracy'])

    # Guardar el mejor modelo
    checkpoint = ModelCheckpoint(MODEL_NAME, monitor='val_accuracy', save_best_only=True, verbose=1)

    # Entrenamiento
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=test_generator,
        callbacks=[checkpoint]
    )

    print('Entrenamiento completado. Mejor modelo guardado como:', MODEL_NAME)

if __name__ == '__main__':
    main()
