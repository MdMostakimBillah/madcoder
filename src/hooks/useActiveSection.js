import { useEffect, useRef, useState } from "react";

/**
 * Returns the id of the section currently in view.
 *
 * `ids` is stabilised via a ref: the effect only re-subscribes when the
 * section list actually changes (by content), not on every render. This
 * means callers can safely pass inline array literals without triggering
 * an infinite teardown/re-setup loop.
 */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  // Stable serialised version so the effect only re-runs when the list
  // changes by value, not when a new array reference is passed.
  const idsKey = ids.join(",");
  const idsRef = useRef(ids);
  useEffect(() => {
    idsRef.current = ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    const currentIds = idsRef.current;
    const targets = currentIds
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return active;
}
