import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TARGET_SELECTOR = ".hero, section, footer";

export default function ScrollRevealManager() {
  const location = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return undefined;
    }

    const targets = Array.from(document.querySelectorAll(TARGET_SELECTOR));
    if (!targets.length) {
      return undefined;
    }

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
        threshold: 0.14,
        rootMargin: "0px 0px -10% 0px"
      }
    );

      targets.forEach((target, index) => {
        target.classList.add("reveal-on-scroll");
        target.style.setProperty("--reveal-delay", `${Math.min(index * 40, 220)}ms`);
        observer.observe(target);
      });

    return () => {
      observer.disconnect();
      targets.forEach((target) => {
        target.style.removeProperty("--reveal-delay");
      });
    };
  }, [location.pathname]);

  return null;
}
