/* ============================================
   Scroll & Load Animations
   Ampersand-style interactions
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // --- Scroll-triggered animations ---
  const animTargets = document.querySelectorAll(
    ".section-heading, .about-card, .stat-item, .method-step, .insight-card",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const parent = entry.target.parentElement;
          const siblings = parent
            ? Array.from(parent.children).filter((c) =>
                c.classList.contains(entry.target.classList[0]),
              )
            : [];
          const idx = siblings.indexOf(entry.target);
          const delay = idx >= 0 ? idx * 120 : 0;

          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  animTargets.forEach((el) => observer.observe(el));

  // --- Subtle parallax on hero visual ---
  const fvVisual = document.querySelector(".fv-visual");
  if (fvVisual) {
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        if (scrollY < vh) {
          const progress = scrollY / vh;
          fvVisual.style.transform = `translate(-50%, calc(-50% + ${progress * 40}px))`;
          fvVisual.style.opacity = 1 - progress * 0.5;
        }
      },
      { passive: true },
    );
  }

  // --- Smooth scroll for side menu links ---
  document.querySelectorAll(".fv-side-menu a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});
