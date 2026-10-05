import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently in view.
 * The original site never applied its `.active` class on scroll — this does.
 */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (targets.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) setActive(visible[0].target.id);
      },
      {
        // Treat the middle band of the viewport as "in view".
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
