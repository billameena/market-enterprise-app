import { useState, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
}

interface ProductImagesProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeImage = sortedImages[activeIndex];

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? sortedImages.length - 1 : i - 1));
  }, [sortedImages.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i === sortedImages.length - 1 ? 0 : i + 1));
  }, [sortedImages.length]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const lightboxPrev = useCallback(
    () => setLightboxIndex((i) => (i === 0 ? sortedImages.length - 1 : i - 1)),
    [sortedImages.length],
  );

  const lightboxNext = useCallback(
    () => setLightboxIndex((i) => (i === sortedImages.length - 1 ? 0 : i + 1)),
    [sortedImages.length],
  );

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-surface-100 flex items-center justify-center">
        <span className="text-surface-400 text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative group aspect-square rounded-2xl overflow-hidden bg-surface-50">
        <img
          src={activeImage.url}
          alt={activeImage.altText ?? productName}
          className="w-full h-full object-cover"
        />

        {/* Zoom button */}
        <button
          onClick={() => openLightbox(activeIndex)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Zoom image"
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5 text-surface-700" />
        </button>

        {/* Navigation arrows */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-5 h-5 text-surface-700" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-5 h-5 text-surface-700" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sortedImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex ? 'bg-primary-600 w-4' : 'bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {sortedImages.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-surface-200 hover:border-surface-300'
              }`}
            >
              <img
                src={image.url}
                alt={image.altText ?? `${productName} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 p-2 text-white hover:text-surface-300 transition-colors"
              aria-label="Close lightbox"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            <img
              src={sortedImages[lightboxIndex].url}
              alt={sortedImages[lightboxIndex].altText ?? productName}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />

            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={lightboxPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={lightboxNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                  {lightboxIndex + 1} / {sortedImages.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
