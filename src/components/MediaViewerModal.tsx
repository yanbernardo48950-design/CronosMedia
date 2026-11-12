import React, { useState } from 'react';
import { MediaAttachment } from '../types';
import { X, ChevronLeft, ChevronRight, Download, Trash2, Calendar, FileText, Maximize2 } from 'lucide-react';

interface MediaViewerModalProps {
  mediaList: MediaAttachment[];
  initialIndex: number;
  onClose: () => void;
  onDeleteMedia?: (mediaId: string) => void;
  onUpdateCaption?: (mediaId: string, caption: string) => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  mediaList,
  initialIndex,
  onClose,
  onDeleteMedia,
  onUpdateCaption,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isEditingCaption, setIsEditingCaption] = useState(false);

  const currentMedia = mediaList[currentIndex];
  if (!currentMedia) return null;

  const [captionDraft, setCaptionDraft] = useState(currentMedia.caption || '');

  const hasNext = currentIndex < mediaList.length - 1;
  const hasPrev = currentIndex > 0;

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentIndex((prev) => prev - 1);
      setCaptionDraft(mediaList[currentIndex - 1].caption || '');
      setIsEditingCaption(false);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
      setCaptionDraft(mediaList[currentIndex + 1].caption || '');
      setIsEditingCaption(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSaveCaption = () => {
    if (onUpdateCaption) {
      onUpdateCaption(currentMedia.id, captionDraft);
    }
    setIsEditingCaption(false);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentMedia.url;
    a.download = currentMedia.name || 'arquivo-multimidia';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl text-neutral-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
              {currentMedia.type === 'video' ? 'Vídeo' : 'Fotografia'}
            </span>
            <h3 className="text-sm font-medium truncate max-w-md text-neutral-200">
              {currentMedia.name}
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              ({currentIndex + 1} de {mediaList.length})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              title="Baixar arquivo"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            {onDeleteMedia && (
              <button
                onClick={() => {
                  if (confirm('Deseja excluir este anexo multimídia?')) {
                    onDeleteMedia(currentMedia.id);
                    if (mediaList.length <= 1) {
                      onClose();
                    } else if (currentIndex >= mediaList.length - 1) {
                      setCurrentIndex((prev) => Math.max(0, prev - 1));
                    }
                  }
                }}
                title="Excluir anexo"
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              title="Fechar visualizador"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Content Body */}
        <div className="relative flex-1 flex items-center justify-center bg-black min-h-[340px] max-h-[60vh] overflow-hidden">
          {currentMedia.type === 'video' ? (
            <video
              key={currentMedia.url}
              controls
              autoPlay
              playsInline
              className="max-h-[60vh] w-auto max-w-full object-contain focus:outline-none"
            >
              <source src={currentMedia.url} type={currentMedia.mimeType || 'video/mp4'} />
              Seu navegador não suporta a tag de vídeo HTML5.
            </video>
          ) : (
            <img
              src={currentMedia.url}
              alt={currentMedia.caption || currentMedia.name}
              className="max-h-[60vh] w-auto max-w-full object-contain select-none"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Navigation Arrows */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              aria-label="Item anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors shadow-lg border border-neutral-700/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={handleNext}
              aria-label="Próximo item"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors shadow-lg border border-neutral-700/50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Details and Caption Footer */}
        <div className="px-5 py-3.5 bg-neutral-950/90 border-t border-neutral-800 text-xs text-neutral-400 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {new Date(currentMedia.uploadedAt).toLocaleString('pt-BR')}
              </span>
              <span>·</span>
              <span className="font-mono">{formatFileSize(currentMedia.size)}</span>
              {currentMedia.duration && (
                <>
                  <span>·</span>
                  <span className="font-mono">Duração: ~{currentMedia.duration}s</span>
                </>
              )}
            </div>

            {!isEditingCaption && onUpdateCaption && (
              <button
                onClick={() => {
                  setCaptionDraft(currentMedia.caption || '');
                  setIsEditingCaption(true);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {currentMedia.caption ? 'Editar legenda' : '+ Adicionar legenda técnica'}
              </button>
            )}
          </div>

          {/* Caption Display or Edit */}
          {isEditingCaption ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={captionDraft}
                onChange={(e) => setCaptionDraft(e.target.value)}
                placeholder="Insira uma legenda descritiva da foto/vídeo..."
                className="flex-1 px-3 py-1.5 text-xs rounded bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                onClick={handleSaveCaption}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded transition-colors text-xs whitespace-nowrap"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsEditingCaption(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors text-xs whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>
          ) : (
            currentMedia.caption && (
              <p className="text-neutral-300 italic text-xs pt-0.5 border-t border-neutral-800/60">
                "{currentMedia.caption}"
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};
