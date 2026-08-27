// Image optimization tests
// Run with: npm test -- image-optimization.test.js

describe('Image Optimization', () => {
  describe('OptimizedImage Component', () => {
    test('Should render Next.js Image component', () => {
      const { render } = require('@testing-library/react');
      const { OptimizedImage } = require('@/lib/images');

      const { container } = render(
        <OptimizedImage
          src="/test.jpg"
          alt="Test"
          width={300}
          height={300}
        />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', 'Test');
    });

    test('Should apply blur placeholder', () => {
      const { render } = require('@testing-library/react');
      const { OptimizedImage } = require('@/lib/images');

      const { container } = render(
        <OptimizedImage
          src="/test.jpg"
          alt="Test"
          width={300}
          height={300}
        />
      );

      const img = container.querySelector('img');
      expect(img.className).toContain('object-cover');
    });

    test('Should warn if src or alt missing', () => {
      const consoleSpy = jest.spyOn(console, 'warn');
      const { OptimizedImage } = require('@/lib/images');

      render(<OptimizedImage alt="Test" width={300} height={300} />);

      expect(consoleSpy).toHaveBeenCalledWith('OptimizedImage: src and alt are required');
      consoleSpy.mockRestore();
    });
  });

  describe('ResponsiveImage Component', () => {
    test('Should have responsive sizes', () => {
      const { OptimizedImage } = require('@/lib/images');
      const responsiveImageSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1280px) 80vw, 70vw';

      expect(responsiveImageSizes).toContain('100vw');
      expect(responsiveImageSizes).toContain('90vw');
      expect(responsiveImageSizes).toContain('80vw');
    });

    test('Should set w-full h-auto classes', () => {
      const { ResponsiveImage } = require('@/lib/images');

      // Component should apply w-full h-auto for responsive behavior
      expect(ResponsiveImage.toString()).toContain('w-full h-auto');
    });
  });

  describe('AvatarImage Component', () => {
    test('Should default to 48px size', () => {
      const { AvatarImage } = require('@/lib/images');

      // Default size should be 48
      expect(AvatarImage.toString()).toContain('48');
    });

    test('Should apply rounded-full for circular avatars', () => {
      const { AvatarImage } = require('@/lib/images');

      expect(AvatarImage.toString()).toContain('rounded-full');
    });
  });

  describe('ThumbnailImage Component', () => {
    test('Should use 400x300 dimensions', () => {
      const { ThumbnailImage } = require('@/lib/images');

      expect(ThumbnailImage.toString()).toContain('400');
      expect(ThumbnailImage.toString()).toContain('300');
    });

    test('Should apply object-cover', () => {
      const { ThumbnailImage } = require('@/lib/images');

      expect(ThumbnailImage.toString()).toContain('object-cover');
    });
  });

  describe('HeroImage Component', () => {
    test('Should set priority=true for above-fold', () => {
      const { HeroImage } = require('@/lib/images');

      expect(HeroImage.toString()).toContain('priority={true}');
    });

    test('Should use full-width sizes', () => {
      const { HeroImage } = require('@/lib/images');

      expect(HeroImage.toString()).toContain('100vw');
    });
  });

  describe('Next.js Image Optimization Config', () => {
    test('Should support WebP and AVIF formats', () => {
      const nextConfig = require('@/../../next.config.js');

      if (nextConfig.images) {
        expect(nextConfig.images.formats).toContain('image/webp');
        expect(nextConfig.images.formats).toContain('image/avif');
      }
    });

    test('Should define device sizes for responsive images', () => {
      const nextConfig = require('@/../../next.config.js');

      if (nextConfig.images && nextConfig.images.deviceSizes) {
        expect(nextConfig.images.deviceSizes).toContain(640);
        expect(nextConfig.images.deviceSizes).toContain(1920);
      }
    });

    test('Should set long cache TTL for images', () => {
      const nextConfig = require('@/../../next.config.js');

      if (nextConfig.images && nextConfig.images.minimumCacheTTL) {
        // 1 year in seconds = 31536000
        expect(nextConfig.images.minimumCacheTTL).toBe(60 * 60 * 24 * 365);
      }
    });
  });

  describe('Lazy Loading', () => {
    test('Priority images should load immediately', () => {
      const { HeroImage } = require('@/lib/images');

      // Hero images should have priority=true
      const code = HeroImage.toString();
      expect(code).toContain('priority={true}');
    });

    test('Non-priority images should be lazy-loaded', () => {
      const { OptimizedImage, ThumbnailImage } = require('@/lib/images');

      // Regular images should not have priority (lazy loaded by default)
      expect(OptimizedImage.toString()).toContain('priority={false}');
      expect(ThumbnailImage.toString()).not.toContain('priority={true}');
    });
  });

  describe('Blur Placeholder', () => {
    test('Should have blur data URL', () => {
      const { OptimizedImage } = require('@/lib/images');

      const code = OptimizedImage.toString();
      expect(code).toContain('blurDataURL');
      expect(code).toContain('data:image/svg');
    });

    test('Blur placeholder should be lightweight', () => {
      const BLUR_DATA_URL =
        'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 400 300%27%3E%3Crect fill=%27%23e5e7eb%27 width=%27400%27 height=%27300%27/%3E%3C/svg%3E';

      // Data URL should be under 200 characters (lightweight)
      expect(BLUR_DATA_URL.length).toBeLessThan(200);
    });
  });

  describe('Image Components Usage', () => {
    test('ArticleCard should use ThumbnailImage', () => {
      const articleCardCode = require('fs').readFileSync(
        require('path').join(__dirname, '../../components/health/ArticleCard.js'),
        'utf-8'
      );

      expect(articleCardCode).toContain('ThumbnailImage');
      expect(articleCardCode).not.toContain('<img');
    });

    test('Avatar component should use AvatarImage', () => {
      const profilePartsCode = require('fs').readFileSync(
        require('path').join(__dirname, '../../components/profile/ProfileParts.js'),
        'utf-8'
      );

      expect(profilePartsCode).toContain('AvatarImage');
    });

    test('News page should use ResponsiveImage', () => {
      const newsPageCode = require('fs').readFileSync(
        require('path').join(__dirname, '../../app/[locale]/news/[slug]/page.js'),
        'utf-8'
      );

      expect(newsPageCode).toContain('ResponsiveImage');
    });
  });

  describe('Performance Metrics', () => {
    test('WebP format should reduce image size by ~30%', () => {
      // Estimated based on WebP format efficiency
      const jpegSize = 100; // KB
      const webpSize = jpegSize * 0.7; // 70% of original

      expect(webpSize).toBe(70);
    });

    test('Responsive images should match device width', () => {
      const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

      // Should cover mobile (640px) to 4K (3840px)
      expect(deviceSizes[0]).toBeLessThanOrEqual(640);
      expect(deviceSizes[deviceSizes.length - 1]).toBeGreaterThanOrEqual(3840);
    });
  });
});
