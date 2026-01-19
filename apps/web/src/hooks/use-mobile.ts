import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile viewport.
 *
 * SSR Behavior:
 * - Returns `false` during SSR and initial hydration (safe default for desktop-first)
 * - Updates to actual value after client hydration
 * - This may cause a brief flash on mobile devices during hydration
 *
 * For components where mobile/desktop matters critically for initial render,
 * consider using CSS media queries or `<ClientOnly>` wrapper instead.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Return false during SSR (undefined state) - safe default for desktop-first design
  return !!isMobile;
}
