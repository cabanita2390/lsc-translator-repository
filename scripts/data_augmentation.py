import os
import cv2
import numpy as np
from tqdm import tqdm

# Rutas base
DATASET_DIR = 'dataset'
OUTPUT_DIR = 'augmented_dataset'

# Transformaciones de Data Augmentation
def apply_augmentations(image):
    augmented_images = []

    # Flip horizontal
    flip = cv2.flip(image, 1)
    augmented_images.append(flip)

    # Rotación -15 grados
    rows, cols = image.shape[:2]
    M = cv2.getRotationMatrix2D((cols/2, rows/2), -15, 1)
    rotated = cv2.warpAffine(image, M, (cols, rows))
    augmented_images.append(rotated)

    # Aumento de brillo
    bright = cv2.convertScaleAbs(image, alpha=1.2, beta=30)
    augmented_images.append(bright)

    # Agregar ruido
    noise = np.random.normal(0, 25, image.shape).astype(np.uint8)
    noisy = cv2.add(image, noise)
    augmented_images.append(noisy)

    return augmented_images

# Procesar cada video del dataset
def process_videos():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    for label in os.listdir(DATASET_DIR):
        label_path = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(label_path):
            continue

        output_label_path = os.path.join(OUTPUT_DIR, label)
        if not os.path.exists(output_label_path):
            os.makedirs(output_label_path)

        for video_file in tqdm(os.listdir(label_path), desc=f'Procesando {label}'):
            if not video_file.endswith('.webm'):
                continue

            video_path = os.path.join(label_path, video_file)
            cap = cv2.VideoCapture(video_path)

            frame_count = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_filename = f'{os.path.splitext(video_file)[0]}_frame_{frame_count}.jpg'
                frame_path = os.path.join(output_label_path, frame_filename)
                cv2.imwrite(frame_path, frame)

                # Aplicar augmentaciones
                augmented_images = apply_augmentations(frame)
                for idx, aug_image in enumerate(augmented_images):
                    aug_frame_path = os.path.join(output_label_path, f'{os.path.splitext(video_file)[0]}_frame_{frame_count}_aug_{idx}.jpg')
                    cv2.imwrite(aug_frame_path, aug_image)

                frame_count += 1

            cap.release()

    print('Data Augmentation finalizada.')

if __name__ == '__main__':
    process_videos()
