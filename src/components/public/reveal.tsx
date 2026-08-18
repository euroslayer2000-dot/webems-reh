"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type RevealDirection = "up" | "left" | "right" | "zoom";

const HIDDEN_TRANSFORM: Record<RevealDirection, string> = {
  up: "translateY(32px)",
  left: "translateX(36px)",
  right: "translateX(-36px)",
  zoom: "scale(0.92)",
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"hidden" | "revealing" | "done">("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced-motion preference is only knowable client-side; skipping the
      // animation is the correct one-time reaction to that client-only
      // value, not a derived-state anti-pattern.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("revealing");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Once the entrance transition finishes, drop all inline styles so
  // element-specific hover/transition classes (e.g. hover:-translate-y-1)
  // regain full control instead of fighting an inline `transform`.
  const style: CSSProperties | undefined =
    phase === "done"
      ? undefined
      : {
          opacity: phase === "revealing" ? 1 : 0,
          transform: phase === "revealing" ? "none" : HIDDEN_TRANSFORM[direction],
          transition:
            "opacity 0.7s cubic-bezier(0.215,0.61,0.355,1), transform 0.7s cubic-bezier(0.215,0.61,0.355,1)",
          transitionDelay: `${delay}ms`,
        };

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform") setPhase("done");
      }}
    >
      {children}
    </div>
  );
}
