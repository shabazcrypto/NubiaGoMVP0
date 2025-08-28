import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import {
  Mobile,
  Desktop,
  TabletAndUp,
  Responsive,
  useBreakpoint,
  useBreakpointUp,
  useBreakpointDown,
  useBreakpointBetween,
  useMediaQuery,
  usePixelRatio,
  useReducedMotion,
  useViewportSize,
  withResponsive,
} from '../responsive';
import { MobileOptimizationProvider } from '@/components/providers/mobile-optimization-provider';

describe('Responsive Utilities', () => {
  // Helper component to test hooks
  const TestHook = ({ callback }: { callback: () => any }) => {
    const result = callback();
    return <div data-testid="test-hook">{JSON.stringify(result)}</div>;
  };

  // Wrapper to provide MobileOptimizationProvider context
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <MobileOptimizationProvider>
        {ui}
      </MobileOptimizationProvider>
    );
  };

  // Mock window.matchMedia
  const createMatchMedia = (matches: boolean) => {
    return (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
  };

  describe('useMediaQuery', () => {
    it('returns true when media query matches', () => {
      window.matchMedia = jest.fn().mockImplementation(createMatchMedia(true));
      
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(result.current).toBe(true);
    });

    it('returns false when media query does not match', () => {
      window.matchMedia = jest.fn().mockImplementation(createMatchMedia(false));
      
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(result.current).toBe(false);
    });
  });

  describe('useBreakpoint', () => {
    it('returns the current breakpoint', () => {
      // Mock viewport to be mobile
      window.innerWidth = 375;
      
      const { result } = renderHook(() => useBreakpoint(), {
        wrapper: MobileOptimizationProvider,
      });
      
      expect(['xs', 'sm']).toContain(result.current);
    });
  });

  describe('useBreakpointUp', () => {
    it('returns true when viewport is at or above breakpoint', () => {
      // Set viewport to tablet
      window.innerWidth = 768;
      
      const { result } = renderHook(() => useBreakpointUp('md'), {
        wrapper: MobileOptimizationProvider,
      });
      
      expect(result.current).toBe(true);
    });
  });

  describe('useBreakpointDown', () => {
    it('returns true when viewport is at or below breakpoint', () => {
      // Set viewport to mobile
      window.innerWidth = 400;
      
      const { result } = renderHook(() => useBreakpointDown('sm'), {
        wrapper: MobileOptimizationProvider,
      });
      
      expect(result.current).toBe(true);
    });
  });

  describe('useBreakpointBetween', () => {
    it('returns true when viewport is between breakpoints', () => {
      // Set viewport to tablet
      window.innerWidth = 900;
      
      const { result } = renderHook(() => useBreakpointBetween('sm', 'lg'), {
        wrapper: MobileOptimizationProvider,
      });
      
      expect(result.current).toBe(true);
    });
  });

  describe('usePixelRatio', () => {
    it('returns the device pixel ratio', () => {
      // Mock device pixel ratio
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true,
      });
      
      const { result } = renderHook(() => usePixelRatio());
      expect(result.current).toBe(2);
    });
  });

  describe('useReducedMotion', () => {
    it('detects reduced motion preference', () => {
      window.matchMedia = jest.fn().mockImplementation(createMatchMedia(true));
      
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(true);
    });
  });

  describe('useViewportSize', () => {
    it('returns the current viewport size', () => {
      window.innerWidth = 1024;
      window.innerHeight = 768;
      
      const { result } = renderHook(() => useViewportSize());
      
      expect(result.current).toEqual({
        width: 1024,
        height: 768,
      });
    });
  });

  describe('Responsive Components', () => {
    it('renders Mobile component only on mobile', () => {
      // Set viewport to mobile
      window.innerWidth = 375;
      
      renderWithProvider(
        <div>
          <Mobile>
            <div data-testid="mobile-content">Mobile Only</div>
          </Mobile>
          <Desktop>
            <div data-testid="desktop-content">Desktop Only</div>
          </Desktop>
        </div>
      );
      
      expect(screen.getByTestId('mobile-content')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-content')).not.toBeInTheDocument();
    });

    it('renders Desktop component only on desktop', () => {
      // Set viewport to desktop
      window.innerWidth = 1280;
      
      renderWithProvider(
        <div>
          <Mobile>
            <div data-testid="mobile-content">Mobile Only</div>
          </Mobile>
          <Desktop>
            <div data-testid="desktop-content">Desktop Only</div>
          </Desktop>
        </div>
      );
      
      expect(screen.queryByTestId('mobile-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('desktop-content')).toBeInTheDocument();
    });

    it('renders Responsive component with correct breakpoint content', () => {
      // Set viewport to tablet
      window.innerWidth = 800;
      
      renderWithProvider(
        <Responsive
          mobile={<div data-testid="mobile">Mobile</div>}
          tablet={<div data-testid="tablet">Tablet</div>}
          desktop={<div data-testid="desktop">Desktop</div>}
        >
          <div data-testid="default">Default</div>
        </Responsive>
      );
      
      expect(screen.queryByTestId('mobile')).not.toBeInTheDocument();
      expect(screen.getByTestId('tablet')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop')).not.toBeInTheDocument();
      expect(screen.queryByTestId('default')).not.toBeInTheDocument();
    });
  });

  describe('withResponsive HOC', () => {
    it('injects responsive props into wrapped component', () => {
      const TestComponent = withResponsive(({ isMobile, isTablet, isDesktop }: any) => (
        <div>
          {isMobile && <div data-testid="is-mobile">Mobile</div>}
          {isTablet && <div data-testid="is-tablet">Tablet</div>}
          {isDesktop && <div data-testid="is-desktop">Desktop</div>}
        </div>
      ));
      
      // Set viewport to tablet
      window.innerWidth = 800;
      
      renderWithProvider(<TestComponent />);
      
      expect(screen.queryByTestId('is-mobile')).not.toBeInTheDocument();
      expect(screen.getByTestId('is-tablet')).toBeInTheDocument();
      expect(screen.queryByTestId('is-desktop')).not.toBeInTheDocument();
    });
  });

  describe('TabletAndUp Component', () => {
    it('renders children on tablet and desktop', () => {
      // Set viewport to tablet
      window.innerWidth = 768;
      
      renderWithProvider(
        <TabletAndUp>
          <div data-testid="tablet-content">Tablet and Up</div>
        </TabletAndUp>
      );
      
      expect(screen.getByTestId('tablet-content')).toBeInTheDocument();
    });

    it('does not render children on mobile', () => {
      // Set viewport to mobile
      window.innerWidth = 375;
      
      renderWithProvider(
        <TabletAndUp>
          <div data-testid="tablet-content">Tablet and Up</div>
        </TabletAndUp>
      );
      
      expect(screen.queryByTestId('tablet-content')).not.toBeInTheDocument();
    });
  });
});
