import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TARGET_SELECTOR = ".hero, section, footer";

export default function ScrollRevealManager() {
  const location = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(document.querySelectorAll(TARGET_SELECTOR));
    if (!targets.length) {
      return undefined;
    }

    // Never leave content hidden when animations are unsupported or undesirable.
    if (reduceMotion || !window.IntersectionObserver) {
      targets.forEach((target) => {
        target.classList.remove("reveal-on-scroll");
        target.classList.add("is-visible");
      });
      return undefined;
    }

    targets.forEach((target) => {
      target.classList.remove("reveal-on-scroll", "is-visible");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px -4% 0px"
      }
    );

    targets.forEach((target, index) => {
      target.classList.add("reveal-on-scroll");
      target.style.setProperty("--reveal-delay", `${Math.min(index * 40, 220)}ms`);
      observer.observe(target);
    });

    // Mobile browsers can postpone IntersectionObserver while their address bar
    // changes the viewport. This fallback guarantees the page remains usable.
    const visibilityFallback = window.setTimeout(() => {
      targets.forEach((target) => target.classList.add("is-visible"));
    }, 1200);

    return () => {
      window.clearTimeout(visibilityFallback);
      observer.disconnect();
      targets.forEach((target) => {
        target.classList.remove("reveal-on-scroll", "is-visible");
        target.style.removeProperty("--reveal-delay");
      });
    };
  }, [location.pathname]);

  return null;
}
