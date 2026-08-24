import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageAlt?: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, imageAlt, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="react-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="react-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="react-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>
        <img src={imageSrc} alt={imageAlt || 'Modal Preview'} />
      </div>
    </div>
  );
};
