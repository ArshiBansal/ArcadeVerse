/**
 * ArcadeVerse - Global Navigation & Mobile Drawer Engine
 * Handles responsive mobile navigation drawer, hamburger button state,
 * ARIA accessibility attributes, and navbar scroll effects.
 */

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-nav-drawer");

  if (!menuBtn || !mobileDrawer) return;

  function openMobileMenu() {
    menuBtn.classList.add("active");
    menuBtn.setAttribute("aria-expanded", "true");
    mobileDrawer.classList.add("open");
    mobileDrawer.setAttribute("aria-hidden", "false");
  }

  function closeMobileMenu() {
    menuBtn.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    mobileDrawer.classList.remove("open");
    mobileDrawer.setAttribute("aria-hidden", "true");
  }

  function toggleMobileMenu() {
    const isOpen = mobileDrawer.classList.contains("open");
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  // Toggle button event
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close when clicking any nav link inside drawer
  const drawerLinks = mobileDrawer.querySelectorAll("a");
  drawerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  // Close on click outside navbar
  document.addEventListener("click", (e) => {
    if (mobileDrawer.classList.contains("open") && navbar && !navbar.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileDrawer.classList.contains("open")) {
      closeMobileMenu();
      menuBtn.focus();
    }
  });

  // Close if window is resized beyond mobile breakpoint
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100 && mobileDrawer.classList.contains("open")) {
      closeMobileMenu();
    }
  }, { passive: true });

  // Smooth navbar squeeze on scroll
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }, { passive: true });
  }

  // Ensure active navbar pill matches the current active page
  const currentPath = (window.location.pathname || "").toLowerCase();
  const isLeaderboard = currentPath.includes("leaderboard.html");

  document.querySelectorAll(".nav-item, .mobile-nav-item").forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    if (!href || href.startsWith("http")) return;

    if (isLeaderboard && href.includes("leaderboard.html")) {
      link.classList.add("active");
    } else if (!isLeaderboard && href.includes("index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
