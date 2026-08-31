import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  blurSrc?: string;
  aspectRatio?: string;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = '/assets/img/placeholder.jpg',
  blurSrc,
  aspectRatio,
  className = '',
  style = {},
  wrapperClassName = '',
  wrapperStyle = {},
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsError(true);
    if (onError) onError(e);
  };

  const imageSrc = isError ? fallbackSrc : (src || fallbackSrc);
  const blurImageSource = blurSrc || imageSrc;

  return (
    <div
      className={`lazy-image-wrapper ${wrapperClassName}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        aspectRatio: aspectRatio || undefined,
        backgroundColor: '#122223',
        borderRadius: style.borderRadius || wrapperStyle.borderRadius || undefined,
        ...wrapperStyle,
      }}
    >
      {/* Blurred image placeholder layer while loading */}
      {!isLoaded && (
        <div
          className="lazy-image-blur-layer"
          style={{
            position: 'absolute',
            top: -10,
            left: -10,
            right: -10,
            bottom: -10,
            zIndex: 1,
            backgroundImage: `url(${blurImageSource})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(16px) brightness(0.9)',
            transform: 'scale(1.15)',
            opacity: 0.9,
            transition: 'opacity 0.5s ease-in-out',
          }}
        >
          {/* Shimmer light pass animation */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)',
              backgroundSize: '200% 100%',
              animation: 'lazyShimmer 1.8s infinite linear',
            }}
          />
        </div>
      )}

      {/* Target High-Res Image */}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          position: 'relative',
          zIndex: 2,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          ...style,
        }}
        {...props}
      />
    </div>
  );
};
