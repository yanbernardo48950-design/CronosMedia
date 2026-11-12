import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Link as LinkIcon, Image, Video, Trash2, Eye, Plus } from 'lucide-react';
import { MediaAttachment } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';

interface MediaUploadDropzoneProps {
  media: MediaAttachment[];
  onChange: (updated: MediaAttachment[]) => void;
  onPreviewMedia?: (mediaList: MediaAttachment[], index: number) => void;
}

export const MediaUploadDropzone: React.FC<MediaUploadDropzoneProps> = ({
  media,
  onChange,
  onPreviewMedia,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) {
        alert(`Arquivo "${file.name}" não é uma imagem ou vídeo suportado.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newAttachment: MediaAttachment = {
          id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: isVideo ? 'video' : 'image',
          url,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          caption: '',
          uploadedAt: new Date().toISOString(),
        };

        onChange([...media, newAttachment]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const isVid = urlType === 'video' || urlInput.match(/\.(mp4|webm|mov|ogg)$/i) !== null;
    const newAttachment: MediaAttachment = {
      id: `url-${Date.now()}`,
      type: isVid ? 'video' : 'image',
      url: urlInput.trim(),
      name: urlInput.split('/').pop() || (isVid ? 'video_externo.mp4' : 'imagem_externa.jpg'),
      caption: 'Importado via URL direta',
      uploadedAt: new Date().toISOString(),
    };

    onChange([...media, newAttachment]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveMedia = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(media.filter((m) => m.id !== id));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Dropzone container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border border-dashed transition-all p-6 text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-600'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
            <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Clique para selecionar fotos e vídeos
            </span>{' '}
            ou arraste e solte arquivos aqui
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Suporta JPG, PNG, WEBP, MP4, WEBM e MOV · Sem limites rígidos
          </p>
        </div>
      </div>

      {/* Auxiliary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCameraModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-500" />
            Câmera / Gravar Vídeo
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium shadow-xs"
          >
            <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
            Adicionar via URL
          </button>
        </div>

        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          {media.length} anexo{media.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={urlType}
              onChange={(e) => setUrlType(e.target.value as any)}
              className="text-xs px-2 py-1.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="image">Imagem (Foto)</option>
              <option value="video">Vídeo (MP4/WebM)</option>
            </select>
            <input
              type="url"
              placeholder="https://exemplo.com/midia.jpg ou .mp4"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Grid of Attached Media Items */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {media.map((item, index) => {
            const isVideo = item.type === 'video';
            return (
              <div
                key={item.id}
                onClick={() => onPreviewMedia && onPreviewMedia(media, index)}
                className="group relative rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden cursor-pointer hover:shadow-md transition-all"
              >
                {/* Media Thumbnail */}
                <div className="relative aspect-video bg-neutral-950 flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <>
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Video className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Type Badge */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                    {isVideo ? <Video className="w-2.5 h-2.5" /> : <Image className="w-2.5 h-2.5" />}
                    {isVideo ? 'Vídeo' : 'Foto'}
                  </span>

                  {/* Quick Delete */}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveMedia(item.id, e)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors opacity-90 group-hover:opacity-100"
                    title="Remover anexo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info strip */}
                <div className="p-2 text-left">
                  <p className="text-xs font-medium truncate text-neutral-800 dark:text-neutral-200">
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                    <span>{formatFileSize(item.size)}</span>
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                      <Eye className="w-2.5 h-2.5" />
                      Visualizar
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          onCapture={(newMedia) => {
            onChange([...media, newMedia]);
            setShowCameraModal(false);
          }}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
};
