/**
 * Pudding.js — Scroll-triggered animations for Cephas
 * Uses IntersectionObserver for performant scroll detection.
 * No dependencies.
 */

(function () {
  "use strict";

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
  // Auto-wrap letter content in reveal animations
  // =========================================================================
  function autoWrapContent() {
    // Only auto-wrap on letter pages (not papers)
    var body = document.body;
    if (body.classList.contains("paper-layout")) return;

    // Wrap each h2 section in a reveal
    var article = document.querySelector("article .content, .post-content, main article");
    if (!article) return;

    var headings = article.querySelectorAll("h2, h3");
    headings.forEach(function (heading, index) {
      // Don't wrap if already in a pudding element
      if (heading.closest(".pudding-section, .pudding-reveal")) return;

      heading.classList.add("pudding-reveal");
      // Alternate animation directions
      if (index % 3 === 1) heading.classList.add("pudding-reveal--left");
      if (index % 3 === 2) heading.classList.add("pudding-reveal--right");
    });

    // Wrap blockquotes as pudding quotes
    var quotes = article.querySelectorAll("blockquote");
    quotes.forEach(function (quote) {
      if (quote.closest(".pudding-quote")) return;
      quote.classList.add("pudding-reveal", "pudding-reveal--scale");
    });

    // Wrap tables in reveal
    var tables = article.querySelectorAll("table");
    tables.forEach(function (table) {
      table.classList.add("pudding-reveal");
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
