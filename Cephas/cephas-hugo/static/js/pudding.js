/**
 * Pudding.js — Scroll-triggered animations for Cephas
 * Uses IntersectionObserver for performant scroll detection.
 * No dependencies.
 *
 * RULE: Academic papers keep clean prose. Everything else gets scrollytelling.
 */

(function () {
  "use strict";

  // =========================================================================
  // Detect if this is an academic paper page (excluded from auto-wrap)
  // =========================================================================
  function isAcademicPage() {
    var path = window.location.pathname;
    // Skip academic paper sections entirely
    if (path.indexOf("/academic") !== -1) return true;
    if (path.indexOf("/academics") !== -1) return true;
    // Also skip if body has paper-layout class (manual override)
    if (document.body.classList.contains("paper-layout")) return true;
    // Check front matter via data attribute (set by template)
    if (document.body.getAttribute("data-pudding") === "off") return true;
    return false;
  }

  // =========================================================================
  // Scroll Reveal — fade/slide elements into view
  // =========================================================================
  function initReveal() {
    var elements = document.querySelectorAll(".pudding-reveal");
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Once visible, stop observing (one-shot animation)
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // =========================================================================
  // Progress Bar — reading progress indicator
  // =========================================================================
  function initProgress() {
    var bar = document.querySelector(".pudding-progress__bar");
    if (!bar) return;

    function updateProgress() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(progress, 100) + "%";
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // =========================================================================
  // Chapter Dots — highlight active section
  // =========================================================================
  function initChapters() {
    var dots = document.querySelectorAll(".pudding-chapter-dot");
    var sections = document.querySelectorAll(".pudding-section[data-chapter]");
    if (!dots.length || !sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var chapter = entry.target.getAttribute("data-chapter");
            dots.forEach(function (dot) {
              dot.classList.toggle(
                "is-active",
                dot.getAttribute("data-chapter") === chapter
              );
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Click to scroll
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = document.querySelector(
          '.pudding-section[data-chapter="' + dot.getAttribute("data-chapter") + '"]'
        );
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // =========================================================================
  // Auto-wrap non-paper content in reveal animations
  // =========================================================================
  function autoWrapContent() {
    // Academic papers keep clean prose — no animations
    if (isAcademicPage()) return;

    var article = document.querySelector("article .content, .post-content, main article");
    if (!article) return;

    // Wrap each h2/h3 in a reveal
    var headings = article.querySelectorAll("h2, h3");
    headings.forEach(function (heading, index) {
      if (heading.closest(".pudding-section, .pudding-reveal, .pudding-callout")) return;
      heading.classList.add("pudding-reveal");
      if (index % 3 === 1) heading.classList.add("pudding-reveal--left");
      if (index % 3 === 2) heading.classList.add("pudding-reveal--right");
    });

    // Wrap blockquotes
    var quotes = article.querySelectorAll("blockquote");
    quotes.forEach(function (quote) {
      if (quote.closest(".pudding-quote, .pudding-callout")) return;
      quote.classList.add("pudding-reveal", "pudding-reveal--scale");
    });

    // Wrap tables
    var tables = article.querySelectorAll("table");
    tables.forEach(function (table) {
      if (table.closest(".pudding-reveal")) return;
      table.classList.add("pudding-reveal");
    });

    // Wrap code blocks
    var codeBlocks = article.querySelectorAll("pre");
    codeBlocks.forEach(function (block) {
      if (block.closest(".pudding-reveal")) return;
      block.classList.add("pudding-reveal");
    });

    // Stagger paragraphs in pudding-section containers
    var sectionParas = article.querySelectorAll(".pudding-section p");
    sectionParas.forEach(function (p, i) {
      if (p.closest(".pudding-reveal, .pudding-callout, .pudding-stat")) return;
      p.classList.add("pudding-reveal");
      p.style.transitionDelay = (i % 4) * 0.1 + "s";
    });
  }

  // =========================================================================
  // Smooth scroll for anchor links
  // =========================================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var target = document.querySelector(this.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // =========================================================================
  // Init all on DOM ready
  // =========================================================================
  function init() {
    autoWrapContent();
    initReveal();
    initProgress();
    initChapters();
    initSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
