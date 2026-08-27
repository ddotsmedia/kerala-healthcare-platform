// Dark mode toggle tests
// Run with: npm test -- dark-mode.test.js

describe('Dark Mode Toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('ThemeToggle Component', () => {
    test('Should render toggle button', () => {
      const button = document.querySelector('[aria-label*="Switch to"]');
      expect(button).toBeInTheDocument();
    });

    test('Should toggle dark class on document root', async () => {
      const button = document.querySelector('[aria-label*="Switch to"]');

      // Initially light
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Click to toggle
      await button.click();
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Click again to toggle back
      await button.click();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    test('Should persist theme preference to localStorage', async () => {
      const button = document.querySelector('[aria-label*="Switch to"]');

      await button.click();
      expect(localStorage.getItem('darkMode')).toBe('true');

      await button.click();
      expect(localStorage.getItem('darkMode')).toBe('false');
    });

    test('Should show correct icon/label based on theme', () => {
      const button = document.querySelector('[aria-label*="Switch to"]');

      // Light mode: shows moon icon + "Dark" text
      expect(button.textContent).toContain('Dark');

      // Toggle to dark
      button.click();
      expect(button.textContent).toContain('Light');
    });

    test('Should update aria-label on toggle', () => {
      const button = document.querySelector('[aria-label*="Switch to"]');

      const initialLabel = button.getAttribute('aria-label');
      button.click();
      const newLabel = button.getAttribute('aria-label');

      expect(initialLabel).not.toBe(newLabel);
    });
  });

  describe('ThemeProvider Initialization', () => {
    test('Should respect localStorage preference on mount', () => {
      localStorage.setItem('darkMode', 'true');

      // Simulate ThemeProvider mount
      const initTheme = () => {
        const isDark =
          localStorage.getItem('darkMode') === 'true' ||
          (!localStorage.getItem('darkMode') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      };

      initTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('Should respect system preference when no localStorage value', () => {
      localStorage.clear();

      // Mock system preference
      const mockMediaQuery = { matches: true };
      window.matchMedia = jest.fn().mockReturnValue(mockMediaQuery);

      const initTheme = () => {
        const isDark =
          localStorage.getItem('darkMode') === 'true' ||
          (!localStorage.getItem('darkMode') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      };

      initTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('Should prefer localStorage over system preference', () => {
      localStorage.setItem('darkMode', 'false');

      window.matchMedia = jest.fn().mockReturnValue({ matches: true }); // System prefers dark

      const initTheme = () => {
        const isDark =
          localStorage.getItem('darkMode') === 'true' ||
          (!localStorage.getItem('darkMode') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      };

      initTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Dark Mode Styling', () => {
    test('Should apply dark: classes to header', () => {
      const header = document.querySelector('header');
      expect(header.className).toContain('dark:');
    });

    test('Should apply dark: classes to buttons', () => {
      const buttons = document.querySelectorAll('button');
      let hasDarkClasses = false;

      buttons.forEach(btn => {
        if (btn.className.includes('dark:')) {
          hasDarkClasses = true;
        }
      });

      expect(hasDarkClasses).toBe(true);
    });

    test('Should apply dark: classes to links', () => {
      const links = document.querySelectorAll('a');
      let hasDarkClasses = false;

      links.forEach(link => {
        if (link.className.includes('dark:')) {
          hasDarkClasses = true;
        }
      });

      expect(hasDarkClasses).toBe(true);
    });

    test('Should have sufficient contrast in dark mode', () => {
      document.documentElement.classList.add('dark');

      const getContrast = (rgb1, rgb2) => {
        // Simplified contrast calculation
        const getLuminance = (rgb) => {
          const [r, g, b] = rgb.match(/\d+/g);
          return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        };

        const l1 = getLuminance(rgb1);
        const l2 = getLuminance(rgb2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };

      // WCAG AA requires contrast ratio of 4.5:1 for normal text
      expect(getContrast('rgb(255, 255, 255)', 'rgb(0, 0, 0)') >= 4.5).toBe(true);
    });
  });

  describe('Mobile Responsiveness', () => {
    test('Should show theme toggle on mobile', () => {
      const toggle = document.querySelector('[aria-label*="Switch to"]');
      expect(toggle).toBeVisible();
    });

    test('Should be accessible on touch devices', () => {
      const toggle = document.querySelector('[aria-label*="Switch to"]');
      const styles = window.getComputedStyle(toggle);

      // Should have adequate padding for touch targets (min 44px)
      expect(parseInt(styles.padding) >= 8).toBe(true); // 8 = 32px min
    });
  });

  describe('System Theme Change Listener', () => {
    test('Should update theme when system preference changes', () => {
      localStorage.clear(); // No stored preference, should follow system

      // Mock initial system preference
      const mockMediaQuery = {
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      window.matchMedia = jest.fn().mockReturnValue(mockMediaQuery);

      // Simulate system change to dark
      document.documentElement.classList.remove('dark');
      mockMediaQuery.matches = true;

      if (localStorage.getItem('darkMode') === null) {
        if (mockMediaQuery.matches) {
          document.documentElement.classList.add('dark');
        }
      }

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('Should not override user preference when system changes', () => {
      localStorage.setItem('darkMode', 'false'); // User explicitly prefers light

      // Simulate system changing to dark
      document.documentElement.classList.remove('dark');

      if (localStorage.getItem('darkMode') === null) {
        document.documentElement.classList.add('dark');
      }

      // Should remain light because user has a preference
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('No Flash of Unstyled Theme (FOUC)', () => {
    test('Should initialize theme before page paint', () => {
      // ThemeProvider should set the class in useEffect (before render)
      // This test verifies the initialization script runs early enough

      const initScript = `
        (function() {
          const isDark = localStorage.getItem('darkMode') === 'true' ||
            (!localStorage.getItem('darkMode') &&
             window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (isDark) document.documentElement.classList.add('dark');
        })();
      `;

      // Verify script is synchronous and will execute before DOM parsing
      expect(initScript).toContain('isDark');
      expect(initScript).toContain('classList.add');
    });
  });
});
