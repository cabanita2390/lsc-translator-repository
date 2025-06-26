import os
import shutil
import random

# Configuración de rutas
DATASET_DIR = 'augmented_dataset'
OUTPUT_DIR = 'dataset_split'
TRAIN_RATIO = 0.8

def split_dataset():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(os.path.join(OUTPUT_DIR, 'train'))
        os.makedirs(os.path.join(OUTPUT_DIR, 'test'))

    for label in os.listdir(DATASET_DIR):
        label_path = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(label_path):
            continue

        images = [f for f in os.listdir(label_path) if f.endswith('.jpg')]
        random.shuffle(images)

        split_index = int(len(images) * TRAIN_RATIO)
        train_images = images[:split_index]
        test_images = images[split_index:]

        # Crear carpetas destino
        train_label_path = os.path.join(OUTPUT_DIR, 'train', label)
        test_label_path = os.path.join(OUTPUT_DIR, 'test', label)

        os.makedirs(train_label_path, exist_ok=True)
        os.makedirs(test_label_path, exist_ok=True)

        # Mover archivos de entrenamiento
        for image in train_images:
            src = os.path.join(label_path, image)
            dst = os.path.join(train_label_path, image)
            shutil.copyfile(src, dst)

        # Mover archivos de prueba
        for image in test_images:
            src = os.path.join(label_path, image)
            dst = os.path.join(test_label_path, image)
            shutil.copyfile(src, dst)

        print(f'Clase {label}: {len(train_images)} entrenamiento, {len(test_images)} prueba.')

    print('Separación de dataset completada.')

if __name__ == '__main__':
    split_dataset()
