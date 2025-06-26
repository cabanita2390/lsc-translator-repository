import React, { useRef, useState, useEffect } from "react";

const VideoCapture = () => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [chunks, setChunks] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState("letra_A");

    useEffect(() => {
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                setStream(stream);
            } catch (err) {
                console.error("Error al acceder a la cámara: ", err);
            }
        };

        startVideo();
    }, []);

    const startRecording = () => {
        setChunks([]);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                setChunks((prev) => [...prev, e.data]);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);

            // Descarga simulada. En integración backend, aquí se haría un POST.
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `${selectedLabel}_${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Captura Incremental por Fases</h2>

            <div className="mb-4">
                <label htmlFor="label" className="mr-2">
                    Selecciona la categoría:
                </label>
                <select
                    id="label"
                    value={selectedLabel}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                    className="border p-1"
                >
                    <option value="letra_A">Letra A</option>
                    <option value="letra_B">Letra B</option>
                    <option value="letra_C">Letra C</option>
                    {/* Puedes agregar más categorías aquí */}
                </select>
            </div>

            <video ref={videoRef} autoPlay className="w-full max-w-lg rounded-lg shadow mb-4" />

            {!isRecording ? (
                <button onClick={startRecording} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                    Iniciar Grabación
                </button>
            ) : (
                <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2 rounded">
                    Detener Grabación
                </button>
            )}
        </div>
    );
};

export default VideoCapture;
