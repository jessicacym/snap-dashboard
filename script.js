/* ============================================
   Scroll & Load Animations
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // --- Hero load animations ---
  const heroElements = document.querySelectorAll(
    ".anim-clip, .anim-fade, .anim-reveal",
  );
  setTimeout(() => {
    heroElements.forEach((el) => el.classList.add("visible"));
  }, 200);

  // --- Scroll-triggered animations ---
  const scrollElements = document.querySelectorAll(".scroll-anim");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -60px 0px",
    },
  );

  scrollElements.forEach((el) => observer.observe(el));

  // --- Subtle parallax on hero ---
  const hero = document.querySelector(".hero");
  const heroViz = document.querySelector(".hero-viz");

  if (hero && heroViz) {
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        if (scrollY < heroHeight) {
          const progress = scrollY / heroHeight;
          heroViz.style.transform = `translateY(${progress * 30}px)`;
        }
      },
      { passive: true },
    );
  }
});
