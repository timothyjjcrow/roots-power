// ===== MOBILE NAVIGATION =====
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-link");

// Toggle mobile menu
navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");
});

// Close mobile menu when clicking on links
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  }
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const headerOffset = 100;
      const elementPosition = target.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});

// ===== NAVBAR SCROLL EFFECT =====
// Moved to optimized scroll handler below

// ===== ACTIVE NAVIGATION HIGHLIGHTING =====
// Moved to optimized scroll handler below

// ===== HERO SCROLL INDICATOR =====
const heroScroll = document.querySelector(".hero-scroll");
if (heroScroll) {
  heroScroll.addEventListener("click", () => {
    const servicesSection = document.getElementById("services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// ===== ELECTRIC ANIMATIONS =====
// Lightweight hover effects for service sections
document.querySelectorAll(".service-section").forEach((section) => {
  section.addEventListener("mouseenter", function () {
    // Minimal effect to reduce performance impact
    const placeholder = this.querySelector(".image-placeholder");
    if (placeholder) {
      placeholder.style.borderColor = "var(--electric-green)";
      placeholder.style.transform = "translateY(-3px)";
    }
  });

  section.addEventListener("mouseleave", function () {
    const placeholder = this.querySelector(".image-placeholder");
    if (placeholder) {
      placeholder.style.borderColor = "";
      placeholder.style.transform = "";
    }
  });
});

// Lightweight hover effects for project cards
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.boxShadow = "0 15px 30px rgba(57, 255, 20, 0.12)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.boxShadow = "";
  });
});

// ===== CONTACT FORM HANDLING =====
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Check if EmailJS is available and configured
    if (
      typeof emailjs !== "undefined" &&
      window.emailjsUserID &&
      window.emailjsServiceID &&
      window.emailjsTemplateID
    ) {
      // EmailJS is configured - send email
      sendEmailWithEmailJS();
    } else {
      // EmailJS not configured - fallback to mailto
      sendEmailWithMailto();
    }
  });

  // Initialize EmailJS only if IDs are configured
  function initializeEmailJS() {
    // Replace these with your actual EmailJS IDs
    window.emailjsUserID = "YOUR_EMAILJS_USER_ID"; // Replace with your EmailJS user ID
    window.emailjsServiceID = "YOUR_SERVICE_ID"; // Replace with your EmailJS service ID
    window.emailjsTemplateID = "YOUR_TEMPLATE_ID"; // Replace with your EmailJS template ID

    // Only initialize if we have valid IDs (not the placeholder text)
    if (
      typeof emailjs !== "undefined" &&
      window.emailjsUserID &&
      window.emailjsUserID !== "YOUR_EMAILJS_USER_ID"
    ) {
      try {
        emailjs.init(window.emailjsUserID);
        console.log("EmailJS initialized successfully");
      } catch (error) {
        console.error("EmailJS initialization failed:", error);
      }
    }
  }

  // EmailJS sending function
  function sendEmailWithEmailJS() {
    showFormLoading();

    const formData = new FormData(contactForm);

    // Prepare template parameters for EmailJS
    const templateParams = {
      from_firstName: formData.get("firstName"),
      from_lastName: formData.get("lastName"),
      from_email: formData.get("email"),
      from_phone: formData.get("phone") || "Not provided",
      service_type: formData.get("service"),
      message: formData.get("message"),
      to_email: "rj@rootspower.com", // Your business email
    };

    // Send email using EmailJS
    emailjs
      .send(window.emailjsServiceID, window.emailjsTemplateID, templateParams)
      .then(function (response) {
        console.log("Email sent successfully!", response.status, response.text);
        showFormSuccess();
        contactForm.reset();
      })
      .catch(function (error) {
        console.error("Failed to send email:", error);
        showFormError();
      });
  }

  // Fallback mailto function (original functionality)
  function sendEmailWithMailto() {
    const formData = new FormData(contactForm);
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const service = formData.get("service");
    const message = formData.get("message");

    // Create email subject and body
    const subject = `New Project Inquiry from ${firstName} ${lastName}`;
    const body = `
Service Type: ${service}
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || "Not provided"}

Message:
${message}
        `.trim();

    // Create mailto link
    const mailtoLink = `mailto:rj@rootspower.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success feedback
    showFormSuccess();

    // Reset form
    contactForm.reset();
  }

  // Initialize EmailJS when the script loads
  initializeEmailJS();
}

// Form loading state
function showFormLoading() {
  const submitBtn = document.querySelector(".contact-form .btn-primary");
  const originalText = submitBtn.innerHTML;

  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled = true;
  submitBtn.style.background = "linear-gradient(135deg, #666, #999)";

  // Store original text for later restoration
  submitBtn.setAttribute("data-original-text", originalText);
}

// Form success feedback
function showFormSuccess() {
  const submitBtn = document.querySelector(".contact-form .btn-primary");
  const originalText = submitBtn.getAttribute("data-original-text");

  submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
  submitBtn.style.background = "linear-gradient(135deg, #00ff41, #39ff14)";
  submitBtn.disabled = false;

  setTimeout(() => {
    submitBtn.innerHTML = originalText;
    submitBtn.style.background = "";
  }, 3000);
}

// Form error feedback
function showFormError() {
  const submitBtn = document.querySelector(".contact-form .btn-primary");
  const originalText = submitBtn.getAttribute("data-original-text");

  submitBtn.innerHTML =
    '<i class="fas fa-exclamation-triangle"></i> Error - Try Again';
  submitBtn.style.background = "linear-gradient(135deg, #ff4444, #cc0000)";
  submitBtn.disabled = false;

  setTimeout(() => {
    submitBtn.innerHTML = originalText;
    submitBtn.style.background = "";
  }, 4000);
}

// ===== OPTIMIZED SCROLL MANAGEMENT =====
let ticking = false;
let isScrolling = false;
let scrollTimeout;
let lastScrollTop = 0;
let scrollDirection = "up";

function updateNavbar() {
  const navbar = document.querySelector(".navbar");
  const currentScrollTop = window.scrollY;

  // Determine scroll direction
  if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
    // Scrolling down & past threshold - hide navbar
    scrollDirection = "down";
    navbar.style.transform = "translateY(-100%)";
  } else if (currentScrollTop < lastScrollTop || currentScrollTop <= 100) {
    // Scrolling up or at top - show navbar
    scrollDirection = "up";
    navbar.style.transform = "translateY(0)";
  }

  // Update navbar background based on scroll position
  if (currentScrollTop > 50) {
    navbar.style.background = "rgba(10, 10, 10, 0.98)";
    navbar.style.backdropFilter = "blur(30px)";
    navbar.style.borderBottom = "1px solid rgba(57, 255, 20, 0.3)";
  } else {
    navbar.style.background = "rgba(10, 10, 10, 0.95)";
    navbar.style.backdropFilter = "blur(20px)";
    navbar.style.borderBottom = "1px solid rgba(57, 255, 20, 0.2)";
  }

  lastScrollTop = currentScrollTop;
}

function updateActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 150;
    const sectionHeight = section.clientHeight;

    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
}

// Single scroll handler with throttling
function handleScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateNavbar();
      updateActiveNav();
      ticking = false;
    });
    ticking = true;
  }

  // Track scrolling state for particles
  isScrolling = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 150);
}

// Single optimized scroll listener
window.addEventListener("scroll", handleScroll, { passive: true });

// ===== SIMPLIFIED SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px",
};

const animatedElements = new Set();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !animatedElements.has(entry.target)) {
      // Use requestAnimationFrame for smooth animations
      requestAnimationFrame(() => {
        entry.target.style.transition =
          "opacity 0.6s ease, transform 0.6s ease";
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";

        animatedElements.add(entry.target);
        observer.unobserve(entry.target);
      });
    }
  });
}, observerOptions);

// Setup optimized animations
document
  .querySelectorAll(
    ".service-section, .project-showcase, .about-feature, .contact-item, .service-showcase"
  )
  .forEach((el) => {
    // Initial state
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "none";

    observer.observe(el);
  });

// ===== DYNAMIC ELECTRIC PARTICLES =====
function createElectricParticle() {
  // Don't create particles while scrolling or if too many exist
  if (
    isScrolling ||
    document.querySelectorAll(".electric-particle").length > 3
  ) {
    return;
  }

  const particle = document.createElement("div");
  particle.className = "electric-particle";

  // Random position
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;

  particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 1px;
        height: 1px;
        background: #39ff14;
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        animation: sparkle 1.5s ease-in-out;
        will-change: transform, opacity;
    `;

  document.body.appendChild(particle);

  // Remove particle after animation
  setTimeout(() => {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
  }, 1500);
}

// Add optimized sparkle animation CSS
const sparkleCSS = `
@keyframes sparkle {
    0% { opacity: 0; transform: scale(0) translate3d(0, 0, 0); }
    50% { opacity: 0.6; transform: scale(1) translate3d(0, 0, 0); }
    100% { opacity: 0; transform: scale(0) translate3d(0, 0, 0); }
}
`;

const style = document.createElement("style");
style.textContent = sparkleCSS;
document.head.appendChild(style);

// Create particles much less frequently for better performance
setInterval(createElectricParticle, 8000);

// ===== HERO IMAGE ELECTRIC GLOW ENHANCEMENT =====
// Animation effects disabled for hero image
/*
const heroImage = document.querySelector(".hero-img");
if (heroImage) {
  heroImage.addEventListener("mouseenter", function () {
    const electricGlow = this.parentElement.querySelector(".electric-glow");
    if (electricGlow) {
      electricGlow.style.opacity = "0.8";
      electricGlow.style.animation = "rotate 2s linear infinite";
    }
  });

  heroImage.addEventListener("mouseleave", function () {
    const electricGlow = this.parentElement.querySelector(".electric-glow");
    if (electricGlow) {
      electricGlow.style.opacity = "0.5";
      electricGlow.style.animation = "rotate 4s linear infinite";
    }
  });
}
*/

// ===== LOADING SCREEN (Optional) =====
window.addEventListener("load", function () {
  // Add loaded class to body for any CSS animations
  document.body.classList.add("loaded");

  // Animate hero content
  const heroContent = document.querySelector(".hero-content");
  const heroImage = document.querySelector(".hero-image");

  if (heroContent) {
    heroContent.style.opacity = "0";
    heroContent.style.transform = "translateY(30px)";

    setTimeout(() => {
      heroContent.style.transition = "all 0.8s ease";
      heroContent.style.opacity = "1";
      heroContent.style.transform = "translateY(0)";
    }, 200);
  }

  if (heroImage) {
    heroImage.style.opacity = "0";
    heroImage.style.transform = "translateX(30px)";

    setTimeout(() => {
      heroImage.style.transition = "all 0.8s ease";
      heroImage.style.opacity = "1";
      heroImage.style.transform = "translateX(0)";
    }, 400);
  }
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce function for general use
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== ELECTRIC TYPING EFFECT FOR TITLES =====
function electricTypeEffect(element, text, speed = 80) {
  // Start with element visible but empty
  element.style.opacity = "1";
  element.textContent = "";
  let i = 0;

  // Add electric cursor effect
  const cursor = document.createElement("span");
  cursor.style.cssText = `
    color: #39ff14;
    animation: electric-cursor 0.8s infinite;
    font-weight: 900;
  `;
  cursor.textContent = "|";

  // Add cursor animation
  const cursorCSS = `
    @keyframes electric-cursor {
      0%, 50% { opacity: 1; text-shadow: 0 0 10px #39ff14; }
      51%, 100% { opacity: 0; }
    }
  `;

  if (!document.getElementById("cursor-style")) {
    const cursorStyle = document.createElement("style");
    cursorStyle.id = "cursor-style";
    cursorStyle.textContent = cursorCSS;
    document.head.appendChild(cursorStyle);
  }

  element.appendChild(cursor);

  const typeInterval = setInterval(() => {
    if (i < text.length) {
      // Remove cursor temporarily
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }

      // Add next character
      element.textContent += text.charAt(i);
      i++;

      // Add cursor back
      element.appendChild(cursor);

      // Add random electric flicker effect
      if (Math.random() > 0.7) {
        element.style.textShadow =
          "0 0 20px #39ff14, 0 0 40px #39ff14, 0 0 60px #39ff14";

        // Create electric spark effect
        createElectricSpark(element);

        setTimeout(() => {
          element.style.textShadow = "0 0 50px rgba(57, 255, 20, 0.5)";
        }, 100);
      }
    } else {
      clearInterval(typeInterval);
      // Remove cursor after typing is complete
      setTimeout(() => {
        if (cursor.parentNode) {
          cursor.parentNode.removeChild(cursor);
        }
      }, 1000);
    }
  }, speed);
}

// Create electric spark effect around text
function createElectricSpark(element) {
  const rect = element.getBoundingClientRect();

  for (let i = 0; i < 1; i++) {
    const spark = document.createElement("div");
    spark.style.cssText = `
      position: fixed;
      left: ${rect.left + Math.random() * rect.width}px;
      top: ${rect.top + Math.random() * rect.height}px;
      width: 2px;
      height: 2px;
      background: #39ff14;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 0 6px #39ff14;
      animation: spark-fade 0.6s ease-out forwards;
    `;

    document.body.appendChild(spark);

    setTimeout(() => {
      if (spark.parentNode) {
        spark.parentNode.removeChild(spark);
      }
    }, 600);
  }
}

// Add spark animation CSS
const sparkCSS = `
@keyframes spark-fade {
  0% { 
    opacity: 1; 
    transform: scale(1) translate(0, 0);
  }
  100% { 
    opacity: 0; 
    transform: scale(0) translate(${Math.random() * 40 - 20}px, ${
  Math.random() * 40 - 20
}px);
  }
}
`;

if (!document.getElementById("spark-style")) {
  const sparkStyle = document.createElement("style");
  sparkStyle.id = "spark-style";
  sparkStyle.textContent = sparkCSS;
  document.head.appendChild(sparkStyle);
}

// ===== EASTER EGG: KONAMI CODE =====
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];
let konamiIndex = 0;

document.addEventListener("keydown", function (e) {
  if (e.code === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      // Easter egg: Super electric mode
      document.body.style.animation = "electric-overload 2s ease-in-out";
      document.querySelectorAll(".lightning-bolt").forEach((bolt) => {
        bolt.style.animation = "lightning 0.1s infinite";
      });

      setTimeout(() => {
        document.body.style.animation = "";
        document.querySelectorAll(".lightning-bolt").forEach((bolt) => {
          bolt.style.animation = "lightning 4s infinite";
        });
      }, 2000);

      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

// Add electric overload animation
const overloadCSS = `
@keyframes electric-overload {
    0% { filter: brightness(1); }
    25% { filter: brightness(1.5) hue-rotate(90deg); }
    50% { filter: brightness(2) hue-rotate(180deg); }
    75% { filter: brightness(1.5) hue-rotate(270deg); }
    100% { filter: brightness(1); }
}
`;

const overloadStyle = document.createElement("style");
overloadStyle.textContent = overloadCSS;
document.head.appendChild(overloadStyle);

// ===== INITIALIZE EVERYTHING =====
document.addEventListener("DOMContentLoaded", function () {
  console.log("⚡ Roots Power Website Loaded ⚡");
  console.log("🔌 All systems are electric! 🔌");

  // Hide the main title immediately to prevent flash of content before typing
  const mainTitle = document.querySelector(".title-main");
  if (mainTitle) {
    const originalText = mainTitle.textContent;
    // Hide the text immediately
    mainTitle.style.opacity = "0";
    mainTitle.textContent = "";

    // Start typing effect after a short delay for page layout
    setTimeout(() => {
      electricTypeEffect(mainTitle, originalText, 100);
    }, 300);
  }

  // Preload critical images
  const criticalImages = [
    "roots_power_images_hq/logo/RootsPowerColorStacked_BLK_SM_HQ.jpg",
    "roots_power_images_hq/home_page/IMG_4068_HQ.png",
  ];

  criticalImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  // Initialize all carousels
  const carousels = document.querySelectorAll(".image-carousel");
  carousels.forEach((carousel) => {
    new ServiceCarousel(carousel); // Instance is attached to element in constructor
  });

  // Handle window resize to maintain proper carousel positioning
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      carousels.forEach((carousel) => {
        const instance = carousel.carouselInstance; // Access instance from element
        if (instance) {
          instance.goToSlide(instance.currentSlide);
        }
      });
    }, 250);
  });

  // Initialize project galleries
  new ProjectGallery();
});

// ===== IMAGE CAROUSEL FUNCTIONALITY =====
class ServiceCarousel {
  constructor(carouselElement) {
    this.carousel = carouselElement;
    this.container = carouselElement.querySelector(".carousel-container");
    this.slides = carouselElement.querySelectorAll(".carousel-slide");
    this.dots = carouselElement.querySelectorAll(".dot");
    this.currentSlide = 0;
    this.isDown = false;
    this.startX = 0;
    this.currentX = 0;
    this.initialTransform = 0;
    this.isDragging = false;
    this.dragThreshold = 50; // Reduced threshold for more responsive dragging
    this.autoPlayInterval = null;
    this.autoPlayDelay = 6000;
    this.rafId = null; // Added for requestAnimationFrame

    // Attach instance to element for resize handler
    carouselElement.carouselInstance = this;

    this.init();
  }

  init() {
    if (this.slides.length <= 1) return;

    // Add touch event listeners
    this.container.addEventListener("touchstart", this.handleStart.bind(this), {
      passive: false,
    });
    this.container.addEventListener("touchmove", this.handleMove.bind(this), {
      passive: false,
    });
    this.container.addEventListener("touchend", this.handleEnd.bind(this));

    // Add mouse event listeners for dragging
    this.container.addEventListener("mousedown", this.handleStart.bind(this));
    this.container.addEventListener("mousemove", this.handleMove.bind(this));
    this.container.addEventListener("mouseup", this.handleEnd.bind(this));
    this.container.addEventListener("mouseleave", this.handleEnd.bind(this));

    // Prevent default drag behavior on images
    this.container.addEventListener("dragstart", (e) => e.preventDefault());

    // Add dot click listeners
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSlide(index));
    });

    // Start auto-play
    this.startAutoPlay();

    // Pause auto-play on hover
    this.carousel.addEventListener("mouseenter", () => this.stopAutoPlay());
    this.carousel.addEventListener("mouseleave", () => this.startAutoPlay());
  }

  handleStart(e) {
    this.isDown = true;
    this.isDragging = false;
    this.startX = this.getX(e);
    this.currentX = this.startX;
    this.initialTransform = this.currentSlide * -100;
    this.container.style.transition = "none";
    this.stopAutoPlay();
    cancelAnimationFrame(this.rafId); // Cancel any existing animation frame

    // Add active cursor style
    this.container.style.cursor = "grabbing";
  }

  handleMove(e) {
    if (!this.isDown) return;

    e.preventDefault();
    this.currentX = this.getX(e);
    const diffX = this.currentX - this.startX;

    // Mark as dragging if moved beyond small threshold
    if (Math.abs(diffX) > 5) {
      this.isDragging = true;
    }

    if (this.isDragging) {
      // Calculate drag percentage with smoother sensitivity
      const dragPercentage = (diffX / this.container.offsetWidth) * 100;
      const newTransform = this.initialTransform + dragPercentage;

      // Add resistance at edges
      let resistanceFactor = 1;
      if (
        (this.currentSlide === 0 && diffX > 0) ||
        (this.currentSlide === this.slides.length - 1 && diffX < 0)
      ) {
        resistanceFactor = 0.3; // Add resistance at edges
      }

      // this.container.style.transform = `translateX(${
      //   newTransform * resistanceFactor
      // }%)`; // Original direct update
      cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        this.container.style.transform = `translateX(${
          newTransform * resistanceFactor
        }%)`;
      });
    }
  }

  handleEnd(e) {
    if (!this.isDown) return;
    cancelAnimationFrame(this.rafId); // Ensure final state is not overridden by a pending rAF

    this.isDown = false;
    this.container.style.cursor = "grab";

    if (this.isDragging) {
      const diffX = this.currentX - this.startX;
      const slideWidth = this.container.offsetWidth;
      const dragDistance = Math.abs(diffX);
      const dragPercentage = dragDistance / slideWidth;

      // More sensitive threshold - trigger on smaller drags or faster swipes
      if (dragPercentage > 0.15 || dragDistance > this.dragThreshold) {
        if (diffX > 0 && this.currentSlide > 0) {
          this.prevSlide();
        } else if (diffX < 0 && this.currentSlide < this.slides.length - 1) {
          this.nextSlide();
        } else {
          this.goToSlide(this.currentSlide); // Snap back
        }
      } else {
        this.goToSlide(this.currentSlide); // Snap back
      }
    }

    // Re-enable transition
    this.container.style.transition =
      "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

    // Restart auto-play after a delay
    setTimeout(() => {
      if (!this.carousel.matches(":hover")) {
        this.startAutoPlay();
      }
    }, 2000);

    this.isDragging = false;
  }

  getX(e) {
    return e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  }

  goToSlide(index) {
    if (index < 0 || index >= this.slides.length) return;

    this.currentSlide = index;
    this.container.style.transform = `translateX(-${index * 100}%)`;
    this.updateDots();
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex =
      this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.currentSlide);
    });
  }

  startAutoPlay() {
    if (this.slides.length <= 1) return;

    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

// ===== PROJECT & SERVICE GALLERY FUNCTIONALITY =====
class ProjectGallery {
  constructor() {
    this.init();
  }

  init() {
    // Initialize all project galleries
    document.querySelectorAll(".project-gallery").forEach((gallery) => {
      this.setupGallery(gallery);
    });

    // Initialize all service galleries
    document.querySelectorAll(".service-gallery").forEach((gallery) => {
      this.setupServiceGallery(gallery);
    });
  }

  setupGallery(gallery) {
    const mainImg = gallery.querySelector(".gallery-main-img");
    const thumbnails = gallery.querySelectorAll(".thumbnail");

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", () => {
        thumbnails.forEach((thumb) => thumb.classList.remove("active"));
        thumbnail.classList.add("active");

        const newImageSrc = thumbnail.dataset.image;

        // Preload image before changing src and starting transition
        mainImg.style.opacity = "0"; // Start fade out immediately or use a placeholder
        const tempImage = new Image();
        tempImage.onload = () => {
          mainImg.src = newImageSrc;
          mainImg.style.transition = "opacity 0.2s ease-in-out"; // Ensure transition is set
          mainImg.style.opacity = "1"; // Fade in the new image
        };
        tempImage.onerror = () => {
          // Handle image loading error, e.g., show a fallback or keep old image
          mainImg.style.opacity = "1"; // Revert opacity if new image fails
          console.error("Error loading gallery image:", newImageSrc);
        };
        tempImage.src = newImageSrc;
      });

      // Add keyboard navigation
      thumbnail.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          thumbnail.click();
        }
      });

      // Make thumbnails focusable
      thumbnail.setAttribute("tabindex", "0");
    });

    // Add keyboard navigation for arrow keys
    gallery.addEventListener("keydown", (e) => {
      const activeThumbnail = gallery.querySelector(".thumbnail.active");
      const allThumbnails = Array.from(thumbnails);
      const currentIndex = allThumbnails.indexOf(activeThumbnail);

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        allThumbnails[currentIndex - 1].click();
        allThumbnails[currentIndex - 1].focus();
      } else if (
        e.key === "ArrowRight" &&
        currentIndex < allThumbnails.length - 1
      ) {
        e.preventDefault();
        allThumbnails[currentIndex + 1].click();
        allThumbnails[currentIndex + 1].focus();
      }
    });
  }

  setupServiceGallery(gallery) {
    const mainImg = gallery.querySelector(".service-gallery-main-img");
    const thumbnails = gallery.querySelectorAll(".service-thumbnail");

    if (gallery.classList.contains("single-image") || thumbnails.length === 0) {
      return;
    }

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", () => {
        thumbnails.forEach((thumb) => thumb.classList.remove("active"));
        thumbnail.classList.add("active");

        const newImageSrc = thumbnail.dataset.image;

        // Preload image before changing src and starting transition
        mainImg.style.opacity = "0"; // Start fade out immediately or use a placeholder
        const tempImage = new Image();
        tempImage.onload = () => {
          mainImg.src = newImageSrc;
          mainImg.style.transition = "opacity 0.2s ease-in-out"; // Ensure transition is set
          mainImg.style.opacity = "1"; // Fade in the new image
        };
        tempImage.onerror = () => {
          // Handle image loading error
          mainImg.style.opacity = "1";
          console.error("Error loading service gallery image:", newImageSrc);
        };
        tempImage.src = newImageSrc;
      });

      // Add keyboard navigation
      thumbnail.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          thumbnail.click();
        }
      });

      // Make thumbnails focusable
      thumbnail.setAttribute("tabindex", "0");
    });

    // Add keyboard navigation for arrow keys
    gallery.addEventListener("keydown", (e) => {
      const activeThumbnail = gallery.querySelector(
        ".service-thumbnail.active"
      );
      const allThumbnails = Array.from(thumbnails);
      const currentIndex = allThumbnails.indexOf(activeThumbnail);

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        allThumbnails[currentIndex - 1].click();
        allThumbnails[currentIndex - 1].focus();
      } else if (
        e.key === "ArrowRight" &&
        currentIndex < allThumbnails.length - 1
      ) {
        e.preventDefault();
        allThumbnails[currentIndex + 1].click();
        allThumbnails[currentIndex + 1].focus();
      }
    });
  }
}
