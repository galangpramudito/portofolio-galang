"use client";

import { useState, useEffect, memo, useCallback } from "react";

const navItems = [
  { id: "home", label: "Home", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { id: "about", label: "About", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { id: "skills", label: "Skills", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
  { id: "projects", label: "Work", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  { id: "certificates", label: "Certificates", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
  { id: "contact", label: "Contact", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> }
];

export const DynamicIsland = memo(function DynamicIsland({ activeSection }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isExpanded) setIsExpanded(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isExpanded]);

  const scrollToSection = useCallback((e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById(targetId);
    if (el) {
      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(el, { offset: -20, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setIsExpanded(false);
    }
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none">
      <nav
        role="navigation"
        aria-label="Main navigation"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setIsExpanded(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setIsExpanded(false);
        }}
        onClick={(e) => {
          setIsExpanded((v) => !v);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setIsExpanded(false);
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded((v) => !v);
          }
        }}
        style={{ willChange: isExpanded ? "width, height" : "auto" }}
        className={`bg-[#0a0a0a]/95 backdrop-blur-2xl pointer-events-auto cursor-pointer relative flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent ${isExpanded
            ? "w-[340px] sm:w-[400px] md:w-[520px] h-16 sm:h-[68px] md:h-20 rounded-full border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-gradient-to-b from-white/[0.06] to-transparent"
            : "w-28 sm:w-32 h-10 sm:h-11 rounded-full border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-gradient-to-b from-white/[0.04] to-transparent hover:border-white/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)]"
          }`}
      >
        {/* Collapsed state - pill */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100 delay-150"
            }`}
        >
          <div className="flex flex-row items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] border border-white/10" />
          </div>
          <span className="text-white text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase opacity-90">Menu</span>
        </div>

        {/* Expanded state - nav items */}
        <div
          className={`absolute inset-0 flex items-center justify-between px-3 sm:px-4 md:px-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? "opacity-100 scale-100 delay-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
            }`}
        >
          {navItems.map((item, idx) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={activeSection === item.id ? "page" : undefined}
              style={{ transitionDelay: isExpanded ? `${idx * 40}ms` : "0ms" }}
              className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/70"
            >
              {/* Active Background Pill */}
              <div
                className={`absolute inset-0.5 sm:inset-1 rounded-[20px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${activeSection === item.id ? "bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" : "bg-transparent group-hover:bg-white/[0.06]"
                  }`}
              />

              {/* Active underline indicator */}
              <div
                className={`absolute bottom-[6px] sm:bottom-2 left-1/2 -translate-x-1/2 h-0.5 sm:h-[3px] rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${activeSection === item.id ? "w-4 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-0 group-hover:w-2 bg-white/40"
                  }`}
              />

              {/* Icon */}
              <div
                className={`relative z-10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] mb-1 ${activeSection === item.id ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "text-gray-400 group-hover:text-white"
                  }`}
                aria-hidden="true"
              >
                {item.svg}
              </div>

              {/* Label text below icon - outside island */}
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none z-50 transform group-hover:translate-y-0 translate-y-1">
                <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/15 rounded-full px-4 py-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
                  <p className="text-white text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap">{item.label}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

      </nav>
    </div>
  );
});
