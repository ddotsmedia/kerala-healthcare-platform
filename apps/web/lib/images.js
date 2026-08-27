import Image from 'next/image';

// Blur placeholder SVG (minimal data URI for fast LCP)
const BLUR_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 400 300%27%3E%3Crect fill=%27%23e5e7eb%27 width=%27400%27 height=%27300%27/%3E%3C/svg%3E';

/**
 * Optimized image component with lazy loading, blur placeholder, and WebP support
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Alt text (required for accessibility)
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {boolean} props.priority - Load immediately (above-fold)
 * @param {string} props.sizes - Responsive sizes
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.objectFit - object-fit value (cover, contain, fill)
 * @returns {JSX.Element}
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = undefined,
  className = '',
  objectFit = 'cover',
}) {
  if (!src || !alt) {
    console.warn('OptimizedImage: src and alt are required');
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      sizes={sizes}
      className={`${objectFit === 'cover' ? 'object-cover' : `object-${objectFit}`} ${className}`}
    />
  );
}

/**
 * Responsive image component (full-width, responsive sizes)
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Alt text
 * @param {number} props.width - Original width
 * @param {number} props.height - Original height
 * @param {boolean} props.priority - Load immediately
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function ResponsiveImage({
  src,
  alt,
  width = 1200,
  height = 800,
  priority = false,
  className = '',
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1280px) 80vw, 70vw"
      className={`w-full h-auto ${className}`}
    />
  );
}

/**
 * Avatar component (small, square images)
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Alt text
 * @param {number} props.size - Size in pixels (default 48)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function AvatarImage({
  src,
  alt,
  size = 48,
  className = '',
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={false}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className={`rounded-full object-cover ${className}`}
    />
  );
}

/**
 * Thumbnail component (for cards, grids)
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Alt text
 * @param {boolean} props.priority - Load immediately
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function ThumbnailImage({
  src,
  alt,
  priority = false,
  className = '',
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      priority={priority}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={`w-full h-auto object-cover ${className}`}
    />
  );
}

/**
 * Hero image component (full-width, above-fold)
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Alt text
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function HeroImage({
  src,
  alt,
  className = '',
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      priority={true}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      sizes="100vw"
      className={`w-full h-auto object-cover ${className}`}
    />
  );
}
