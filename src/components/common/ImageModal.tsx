import React, { useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageAlt?: string;
  images?: string[];
  currentIndex?: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageSrc,
  imageAlt,
  images,
  currentIndex = 0,
  onClose,
  onPrev,
  onNext,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrev, onNext, onClose]);

  if (!isOpen) return null;

  const totalImages = images ? images.length : 1;

  return (
    <div className="react-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="react-modal-content relative max-w-1000 p-0 overflow-hidden rounded-16" onClick={(e) => e.stopPropagation()}>
        <button
          className="react-modal-close bg-white text-dark-1 rounded-full size-40 flex-center shadow-sm"
          onClick={onClose}
          aria-label="Close modal"
          style={{ top: '15px', right: '15px', zIndex: 10 }}
        >
          ✕
        </button>

        <div className="relative bg-black flex-center" style={{ minHeight: '400px', maxHeight: '85vh' }}>
          <img
            src={imageSrc}
            alt={imageAlt || 'Gallery Photo'}
            style={{ maxHeight: '85vh', maxWidth: '100%', objectFit: 'contain' }}
          />

          {images && totalImages > 1 && (
            <>
              <button
                className="absolute left-20 bg-white/80 hover:bg-white text-dark-1 size-50 rounded-full flex-center transition-all shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPrev) onPrev();
                }}
                aria-label="Previous image"
              >
                <i className="icon-arrow-left text-20"></i>
              </button>

              <button
                className="absolute right-20 bg-white/80 hover:bg-white text-dark-1 size-50 rounded-full flex-center transition-all shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNext) onNext();
                }}
                aria-label="Next image"
              >
                <i className="icon-arrow-right text-20"></i>
              </button>

              <div className="absolute bottom-15 bg-black/60 text-white px-20 py-5 rounded-200 text-14 fw-500 backdrop-blur">
                {currentIndex + 1} / {totalImages}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
