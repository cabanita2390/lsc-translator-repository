import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

// ------------------------------------------------
// UTILS: Funciones de carga y predicción del modelo
// ------------------------------------------------
let model;
const classLabels = ['letra_A', 'letra_B', 'letra_C'];

const loadModel = async () => {
    try {
        model = await tf.loadGraphModel('/model_web/model.json');
        console.log('✅ Modelo cargado correctamente');
        
        // Calentar el modelo con una inferencia inicial
        const warmupTensor = tf.zeros([1, 128, 128, 3]);
        const prediction = model.predict(warmupTensor);
        await prediction.data();
        prediction.dispose();
        warmupTensor.dispose();
    } catch (error) {
        console.error('❌ Error al cargar el modelo:', error);
    }
};

const predictGesture = async (frameTensor) => {
    if (!model) {
        console.error('⚠️ Modelo no cargado.');
        return { gesture: 'Modelo no cargado', confidence: 0 };
    }

    try {
        const prediction = model.predict(frameTensor);
        const predictionData = await prediction.array(); // Cambiado a .array() para obtener valores normalizados
        
        // Normalizar las probabilidades manualmente si es necesario
        const softmax = (arr) => {
            const max = Math.max(...arr);
            const exps = arr.map(x => Math.exp(x - max));
            const sum = exps.reduce((a, b) => a + b, 0);
            return exps.map(x => x / sum);
        };
        
        const normalized = softmax(predictionData[0]);
        const classId = normalized.indexOf(Math.max(...normalized));
        const confidence = Math.max(...normalized);
        
        prediction.dispose();
        
        return { 
            gesture: classLabels[classId], 
            confidence: confidence * 100 // Convertir a porcentaje
        };
    } catch (error) {
        console.error('❌ Error en predictGesture:', error);
        return { gesture: 'Error', confidence: 0 };
    }
};

// ------------------------------------------------
// COMPONENTES DE LA APLICACIÓN
// ------------------------------------------------

// Componente para probar la inferencia con imágenes estáticas
const ImageTest = () => {
    const [localModel, setLocalModel] = useState(null);
    const [prediction, setPrediction] = useState('');
    const [confidence, setConfidence] = useState('');
    const [previewSrc, setPreviewSrc] = useState('');

    useEffect(() => {
        tf.loadGraphModel('/model_web/model.json')
            .then(m => {
                setLocalModel(m);
                console.log('Modelo de ImageTest cargado correctamente');
                
                // Calentar el modelo
                const warmupTensor = tf.zeros([1, 128, 128, 3]);
                m.predict(warmupTensor).dispose();
                warmupTensor.dispose();
            })
            .catch(err => console.error('Error cargando modelo en ImageTest:', err));
    }, []);

    const handleImagePrediction = async (imagePath) => {
        if (!localModel) return;
        setPreviewSrc(imagePath);

        const image = new Image();
        image.src = imagePath;
        image.crossOrigin = 'anonymous';
        image.onload = async () => {
            try {
                const tensor = tf.browser.fromPixels(image)
                    .resizeNearestNeighbor([128, 128])
                    .toFloat()
                    .expandDims(0)
                    .div(255.0);

                const result = await predictGesture(tensor);
                tensor.dispose();

                setPrediction(result.gesture);
                setConfidence(result.confidence.toFixed(2));
            } catch (error) {
                console.error('Error procesando imagen:', error);
                setPrediction('Error');
                setConfidence('0');
            }
        };
    };

    useEffect(() => {
        window.__handleImagePrediction = handleImagePrediction;
        return () => { delete window.__handleImagePrediction; };
    }, [localModel]);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md mb-6">
            {previewSrc && (
                <img
                    src={previewSrc}
                    alt="Preview"
                    className="mb-4 max-w-xs mx-auto rounded-lg border-2 border-gray-300"
                />
            )}

            {prediction && (
                <p className="text-xl text-center mt-4 p-2 bg-green-100 rounded-lg">
                    ✅ Predicción: <strong className="text-green-700">{prediction}</strong> (<span className="font-mono">{confidence}%</span>)
                </p>
            )}
        </div>
    );
};

// Componente para inferencia en tiempo real con la cámara web
const VideoCapture = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(document.createElement('canvas'));
    const [gesture, setGesture] = useState('');
    const [confidence, setConfidence] = useState('0');
    const [cameraState, setCameraState] = useState('idle');
    const animationRef = useRef(null);

    useEffect(() => {
        const startVideo = async () => {
            setCameraState('loading');
            try {
                await loadModel();
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 640 }, 
                        height: { ideal: 480 },
                        facingMode: 'user' 
                    } 
                });
                const video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                    video.onloadedmetadata = async () => {
                        await video.play();
                        setCameraState('ready');
                        animationRef.current = requestAnimationFrame(analyzeFrame);
                    };
                }
            } catch (error) {
                console.error('Error al acceder a la cámara:', error);
                setCameraState('error');
            }
        };

        const analyzeFrame = async () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (!video || !canvas || video.readyState !== 4) {
                animationRef.current = requestAnimationFrame(analyzeFrame);
                return;
            }

            const ctx = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            let imgTensor;
            try {
                imgTensor = tf.browser
                    .fromPixels(canvas)
                    .resizeNearestNeighbor([128, 128])
                    .toFloat()
                    .div(255.0)
                    .expandDims();
                
                const result = await predictGesture(imgTensor);
                setGesture(result.gesture);
                setConfidence(result.confidence.toFixed(2));
            } catch (error) {
                console.error('Error en la inferencia:', error);
                setGesture('Error');
                setConfidence('0');
            } finally {
                if (imgTensor) imgTensor.dispose();
                animationRef.current = requestAnimationFrame(analyzeFrame);
            }
        };

        startVideo();

        return () => {
            cancelAnimationFrame(animationRef.current);
            const video = videoRef.current;
            if (video?.srcObject) {
                video.srcObject.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const renderMessage = () => {
        switch (cameraState) {
            case 'loading':
                return <p className="text-xl text-center text-gray-600 p-4 bg-gray-100 rounded-lg">Cargando cámara...</p>;
            case 'error':
                return <p className="text-xl text-center text-red-600 p-4 bg-red-100 rounded-lg">❌ Error al acceder a la cámara. Por favor, verifica los permisos.</p>;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Inferencia en Tiempo Real (Webcam)</h2>
            {renderMessage()}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full max-w-lg mx-auto rounded-lg shadow-lg mb-4 border-2 border-gray-300 ${cameraState === 'ready' ? 'block' : 'hidden'}`}
            />
            <p className="text-xl text-center p-2 bg-blue-100 rounded-lg">
                Seña detectada: <strong className="text-blue-700">{gesture}</strong> (<span className="font-mono">{confidence}%</span>)
            </p>
        </div>
    );
};

// ------------------------------------------------
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ------------------------------------------------

const App = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center space-y-8 font-sans">
            <ImageTest />
            <VideoCapture />
        </div>
    );
};

export default App;