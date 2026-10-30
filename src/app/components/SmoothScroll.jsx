"use client";

import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }) {
  const lenisRef = useRef();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const isFirstMount = useRef(true);

  // Sync Lenis scroll events with GSAP ScrollTrigger
  useLenis(() => {
    ScrollTrigger.update();
  });

  // Ensure browser native scroll restoration does not fight with Lenis virtual scroll
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Expose lenis globally for modals and programmatic scroll
    const exposeTimer = setTimeout(() => {
      const lenis = lenisRef.current?.lenis;
      if (lenis) {
        window.__lenis = lenis;
      }
    }, 100);

    return () => {
      gsap.ticker.remove(update);
      clearTimeout(exposeTimer);
      if (window.__lenis) {
        window.__lenis = null;
      }
    };
  }, []);

  // Re-expose lenis on every render in case ref changed
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (lenis) {
      window.__lenis = lenis;
    }
  });

  // Handle route change: scroll to top or scroll to hash
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;

      // Handle initial hash on first load (e.g. user visits /#contact directly)
      if (window.location.hash) {
        const hash = window.location.hash;
        const timer = setTimeout(() => {
          const lenis = lenisRef.current?.lenis || window.__lenis;
          const targetEl = document.querySelector(hash);
          if (targetEl && lenis) {
            lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
          } else if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 400);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Only act when pathname actually changed
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    const lenis = lenisRef.current?.lenis || window.__lenis;
    if (!lenis) return;

    // Clear GSAP scroll memory to prevent stale trigger recalculations across pages
    ScrollTrigger.clearScrollMemory();

    if (window.location.hash) {
      const hash = window.location.hash;
      const timer = setTimeout(() => {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      lenis.scrollTo(0, { immediate: true });
      // Staggered layout measurements to ensure accurate bounds as React settles
      const t1 = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 100);
      const t2 = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [pathname]);

  // Keep Lenis scroll limit and ScrollTrigger synchronized with dynamic DOM height changes
  useEffect(() => {
    if (typeof window === "undefined" || !document.body) return;

    let rafId = null;
    const resizeObserver = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const activeLenis = lenisRef.current?.lenis || window.__lenis;
        if (activeLenis) {
          activeLenis.resize();
          ScrollTrigger.refresh();
        }
      });
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  // Global handler for in-page smooth anchor clicks
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const isCurrentPageHash = href.startsWith("#");
      const isHomeHashFromHome = pathname === "/" && href.startsWith("/#");

      if (isCurrentPageHash || isHomeHashFromHome) {
        const hash = href.startsWith("/#") ? href.slice(1) : href;
        if (hash.length > 1) {
          const targetEl = document.querySelector(hash);
          if (targetEl) {
            e.preventDefault();
            const lenis = lenisRef.current?.lenis || window.__lenis;
            if (lenis) {
              lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
            } else {
              targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            history.pushState(null, "", hash);
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { passive: false });
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  // Disable smooth scroll for admin pages
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      ref={lenisRef}
      autoRaf={false}
      options={{
        lerp: 0.09,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothTouch: false,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}
