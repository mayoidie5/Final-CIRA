import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Previous Button */}
      {images.length > 1 && onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={48} />
        </button>
      )}

      {/* Image */}
      <div className="max-w-5xl max-h-full flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>

      {/* Next Button */}
      {images.length > 1 && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={48} />
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-lg">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};
