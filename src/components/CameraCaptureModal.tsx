import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Circle, Square, RotateCw, X, Check, AlertCircle } from 'lucide-react';
import { MediaAttachment } from '../types';

interface CameraCaptureModalProps {
  onCapture: (media: MediaAttachment) => void;
  onClose: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ onCapture, onClose }) => {
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [capturedPreview, setCapturedPreview] = useState<{
    type: 'image' | 'video';
    url: string;
    blob?: Blob;
    duration?: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setError(null);
        const constraints: MediaStreamConstraints = {
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: mode === 'video',
        };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err: any) {
        console.error('Erro ao acessar câmera:', err);
        setError('Não foi possível acessar a câmera. Verifique as permissões do seu navegador.');
      }
    }

    if (!capturedPreview) {
      initCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mode, capturedPreview]);

  // Clean stream when closing
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  // Capture Photo Snapshot
  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    setCapturedPreview({
      type: 'image',
      url: dataUrl,
    });
  };

  // Start Video Recording
  const handleStartRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setCapturedPreview({
          type: 'video',
          url: videoUrl,
          blob: videoBlob,
          duration: recordingSeconds,
        });
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError(`Erro ao iniciar gravação de vídeo: ${err?.message}`);
    }
  };

  // Stop Video Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    }
  };

  // Accept and Attach Captured Media
  const handleConfirmMedia = () => {
    if (!capturedPreview) return;

    const timestamp = new Date().toISOString();
    const id = `cam-${Date.now()}`;
    const isVid = capturedPreview.type === 'video';

    const newMedia: MediaAttachment = {
      id,
      type: capturedPreview.type,
      url: capturedPreview.url,
      name: isVid ? `video_capturado_${Date.now()}.webm` : `foto_capturada_${Date.now()}.jpg`,
      size: capturedPreview.blob ? capturedPreview.blob.size : Math.round(capturedPreview.url.length * 0.75),
      mimeType: isVid ? 'video/webm' : 'image/jpeg',
      duration: capturedPreview.duration,
      caption: `Capturado via câmera em ${new Date().toLocaleDateString('pt-BR')}`,
      uploadedAt: timestamp,
    };

    onCapture(newMedia);
    handleClose();
  };

  // Discard preview and retake
  const handleRetake = () => {
    setCapturedPreview(null);
    setRecordingSeconds(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-neutral-200">
              Captura Multimídia Instantânea
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport & Controls */}
        <div className="relative bg-black flex items-center justify-center min-h-[360px] max-h-[480px] overflow-hidden">
          {error ? (
            <div className="p-8 text-center max-w-md space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm text-neutral-300">{error}</p>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded-lg text-neutral-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : capturedPreview ? (
            capturedPreview.type === 'video' ? (
              <video
                src={capturedPreview.url}
                controls
                autoPlay
                className="max-h-[480px] w-full object-contain"
              />
            ) : (
              <img
                src={capturedPreview.url}
                alt="Foto Capturada"
                className="max-h-[480px] w-full object-contain"
              />
            )
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[480px]"
              />
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-600/90 text-white px-3 py-1 rounded-md text-xs font-mono font-medium shadow-md">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  GRAVANDO: {Math.floor(recordingSeconds / 60)}:
                  {String(recordingSeconds % 60).padStart(2, '0')}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          {!capturedPreview ? (
            <>
              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  disabled={isRecording}
                  onClick={() => setMode('photo')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'photo'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Tirar Foto
                </button>
                <button
                  type="button"
                  disabled={isRecording}
                  onClick={() => setMode('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'video'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Gravar Vídeo
                </button>
              </div>

              {/* Shutter / Record Button */}
              <div className="flex items-center gap-3">
                {mode === 'photo' ? (
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors shadow-lg active:scale-95"
                  >
                    <Circle className="w-4 h-4 fill-white" />
                    Capturar Foto
                  </button>
                ) : !isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-xs transition-colors shadow-lg active:scale-95"
                  >
                    <Circle className="w-4 h-4 fill-white" />
                    Iniciar Gravação
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="flex items-center gap-2 px-5 py-2 bg-rose-700 hover:bg-rose-600 text-white font-medium rounded-lg text-xs transition-colors shadow-lg animate-pulse active:scale-95"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    Parar Gravação
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Descartar e Tirar Outro
              </button>

              <button
                type="button"
                onClick={handleConfirmMedia}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-md"
              >
                <Check className="w-4 h-4" />
                Anexar ao Compromisso
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
