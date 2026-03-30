const body = document.body;
const progressBar = document.querySelector(".page-progress span");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("load", () => {
  body.classList.remove("is-preload");
  updateProgress();
});

function updateProgress() {
  if (!progressBar) {
    return;
  }

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progressBar.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealElements = Array.from(document.querySelectorAll(".reveal"));
const countTargets = Array.from(document.querySelectorAll("[data-count]"));

function animateCount(element) {
  if (element.dataset.counted === "true") {
    return;
  }

  const target = Number(element.dataset.count);
  if (Number.isNaN(target)) {
    return;
  }

  element.dataset.counted = "true";

  if (prefersReducedMotion) {
    element.textContent = String(target);
    return;
  }

  const duration = 1200;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.hasAttribute("data-count")) {
          animateCount(entry.target);
        }

        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  [...revealElements, ...countTargets].forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
  countTargets.forEach(animateCount);
}

document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
  const buttons = Array.from(tabGroup.querySelectorAll("[data-tab-button]"));
  const panels = Array.from(tabGroup.querySelectorAll("[data-tab-panel]"));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.tabButton;

      buttons.forEach((candidate) => {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.tabPanel === key);
      });
    });
  });
});

document.querySelectorAll("[data-filter-group]").forEach((filterGroup) => {
  const buttons = Array.from(filterGroup.querySelectorAll("[data-filter-button]"));
  const projectGrid = filterGroup.parentElement?.querySelector(".project-grid");
  const items = projectGrid ? Array.from(projectGrid.querySelectorAll("[data-filter-item]")) : [];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filterButton;

      buttons.forEach((candidate) => {
        candidate.classList.toggle("is-active", candidate === button);
      });

      items.forEach((item) => {
        const matches = filter === "all" || item.dataset.filterItem === filter;
        item.classList.toggle("is-hidden", !matches);
      });
    });
  });
});

if (!prefersReducedMotion) {
  document.querySelectorAll("[data-tilt-region]").forEach((region) => {
    const target = region.querySelector("[data-parallax]");
    if (!target) {
      return;
    }

    const resetTilt = () => {
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
    };

    region.addEventListener("pointermove", (event) => {
      const rect = region.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      target.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
    });

    region.addEventListener("pointerleave", resetTilt);
    region.addEventListener("pointercancel", resetTilt);
  });
}
