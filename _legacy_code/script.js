/* ===================================
   SOLANA NAD+ JAVASCRIPT FUNCTIONALITY
   Clean, Professional, and Accessible
   =================================== */

/* ===================================
   DOCUMENT READY AND INITIALIZATION
   =================================== */

// Wait for DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function () {
  console.log('Solana NAD+ website loaded successfully');

  // Initialize all functionality
  initializeMobileMenu();
  initializeBenefitCardAnimations();
  initializeSmoothScrolling();
  initializeFormHandling();
  initializeAccessibilityFeatures();
  initializeFAQ();
});

/* ===================================
   FAQ ACCORDION FUNCTIONALITY
   =================================== */
function initializeFAQ() {
  const toggles = document.querySelectorAll('.faq-toggle');

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      // Toggle current item
      const content = toggle.nextElementSibling;
      const icon = toggle.querySelector('.icon');

      // Check if currently open
      const isOpen = content.style.height && content.style.height !== '0px';

      // Close all other items (optional - for exclusive accordion)
      document.querySelectorAll('.faq-content').forEach(c => {
        c.style.height = '0px';
        c.previousElementSibling.querySelector('.icon').textContent = '+';
        c.previousElementSibling.querySelector('.icon').classList.remove('rotate-45');
      });

      if (!isOpen) {
        content.style.height = content.scrollHeight + 'px';
        icon.textContent = '+'; // Keep plus but rotate it
        icon.classList.add('rotate-45');
        icon.style.transform = 'rotate(45deg)';
      } else {
        // If clicking currently open item, it catches in the reset above, 
        // but we ensure icon reset here just in case logic changes
        content.style.height = '0px';
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });
}

/* ===================================
   MOBILE NAVIGATION MENU FUNCTIONALITY
   =================================== */

function initializeMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const menuOverlay = document.getElementById('mobile-menu-overlay');
  const menuIcon = document.getElementById('menu-icon');
  const body = document.body;

  if (!menuToggle || !menuOverlay || !menuIcon) return;

  // Toggle Menu
  menuToggle.addEventListener('click', () => {
    const isClosed = menuOverlay.classList.contains('translate-x-full');

    if (isClosed) {
      // Open
      menuOverlay.classList.remove('translate-x-full');
      menuIcon.textContent = '✕';
      body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
      // Close
      menuOverlay.classList.add('translate-x-full');
      menuIcon.textContent = '☰';
      body.style.overflow = '';
    }
  });

  // Close on Link Click
  const navLinks = menuOverlay.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuOverlay.classList.add('translate-x-full');
      menuIcon.textContent = '☰';
      body.style.overflow = '';
    });
  });

  // Close Button Inside Overlay
  const closeButton = document.getElementById('close-menu');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      menuOverlay.classList.add('translate-x-full');
      menuIcon.textContent = '☰';
      body.style.overflow = '';
    });
  }
}

// Legacy functions removed as they are no longer needed
// toggleMobileMenu, openMobileMenu, closeMobileMenu replaced by the logic above

/* ===================================
   BENEFIT CARDS FADE-IN ANIMATION
   =================================== */

function initializeBenefitCardAnimations() {
  // Get all benefit cards
  const benefitCards = document.querySelectorAll('.benefit-card');

  if (benefitCards.length === 0) {
    console.warn('No benefit cards found for animation');
    return;
  }

  // Create intersection observer for fade-in animations
  const observerOptions = {
    threshold: 0.2, // Trigger when 20% of the element is visible
    rootMargin: '0px 0px -50px 0px' // Start animation 50px before element enters viewport
  };

  const benefitCardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay for each card
        const delay = index * 200; // 200ms delay between each card

        setTimeout(() => {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('opacity-100');
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.transition = 'all 0.6s ease-out';
        }, delay);

        // Stop observing this element once animated
        benefitCardObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Start observing all benefit cards
  benefitCards.forEach((card, index) => {
    // Set initial state
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';

    // Add staggered delay styles
    card.style.transitionDelay = `${index * 0.1}s`;

    benefitCardObserver.observe(card);
  });
}

/* ===================================
   SMOOTH SCROLLING ENHANCEMENT
   =================================== */

function initializeSmoothScrolling() {
  // Get all anchor links that point to sections on the same page
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');

      // Skip if it's just "#" or empty
      if (targetId === '#' || targetId === '') {
        return;
      }

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();

        // Calculate offset for fixed header
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - headerHeight - 20; // 20px extra padding

        // Smooth scroll to target
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without jumping
        history.pushState(null, null, targetId);

        // Close mobile menu if open
        if (window.innerWidth < 768) {
          closeMobileMenu();
        }
      }
    });
  });
}

/* ===================================
   FORM HANDLING
   =================================== */

function initializeFormHandling() {
  // Newsletter form handling
  const newsletterForm = document.querySelector('footer form');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleNewsletterSubmission(this);
    });
  }

  // FAQ form enhancements
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const summary = item.querySelector('summary');
    if (summary) {
      summary.addEventListener('click', function () {
        // Add smooth transition for FAQ opening/closing
        setTimeout(() => {
          if (item.hasAttribute('open')) {
            item.style.maxHeight = item.scrollHeight + 'px';
          }
        }, 10);
      });
    }
  });
}

// Handle newsletter form submission
function handleNewsletterSubmission(form) {
  const emailInput = form.querySelector('input[type="email"]');
  const submitButton = form.querySelector('button');

  if (!emailInput || !submitButton) {
    console.error('Newsletter form elements not found');
    return;
  }

  const email = emailInput.value.trim();

  // Basic email validation
  if (!isValidEmail(email)) {
    showFormMessage('Please enter a valid email address.', 'error');
    emailInput.focus();
    return;
  }

  // Show loading state
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Subscribing...';
  submitButton.disabled = true;

  // Simulate API call (replace with actual implementation)
  setTimeout(() => {
    // Reset form
    emailInput.value = '';
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;

    // Show success message
    showFormMessage('Thank you for subscribing! Check your email for confirmation.', 'success');
  }, 1500);
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show form messages
function showFormMessage(message, type) {
  // Remove existing messages
  const existingMessage = document.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message element
  const messageElement = document.createElement('div');
  messageElement.className = `form-message ${type === 'error' ? 'text-red-600' : 'text-green-600'} text-sm mt-2 p-2 rounded`;
  messageElement.textContent = message;

  // Insert message after the form
  const form = document.querySelector('footer form');
  if (form && form.parentNode) {
    form.parentNode.insertBefore(messageElement, form.nextSibling);

    // Remove message after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  }
}

/* ===================================
   ACCESSIBILITY FEATURES
   =================================== */

function initializeAccessibilityFeatures() {
  // Add skip link for keyboard navigation
  // addSkipLink(); // Removed per user request

  // Enhance keyboard navigation
  enhanceKeyboardNavigation();

  // Add ARIA labels where needed
  addAriaLabels();

  // Handle focus management
  manageFocus();
}

// Add skip to main content link
function addSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#hero';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to main content';

  document.body.insertBefore(skipLink, document.body.firstChild);
}

// Enhance keyboard navigation
function enhanceKeyboardNavigation() {
  // Handle Enter key on summary elements (for better FAQ accessibility)
  const summaries = document.querySelectorAll('summary');
  summaries.forEach(summary => {
    summary.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Trap focus in mobile menu when open
  const menu = document.getElementById('menu');
  if (menu) {
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        closeMobileMenu();
        document.getElementById('menu-toggle')?.focus();
      }
    });
  }
}

// Add ARIA labels for better accessibility
function addAriaLabels() {
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  // Add role and aria-label to benefit cards
  const benefitCards = document.querySelectorAll('.benefit-card');
  benefitCards.forEach((card, index) => {
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Benefit ${index + 1}`);
  });
}

// Manage focus for better accessibility
function manageFocus() {
  // When mobile menu opens, focus on first link
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function () {
      setTimeout(() => {
        if (!menu.classList.contains('hidden')) {
          const firstLink = menu.querySelector('a');
          if (firstLink) {
            firstLink.focus();
          }
        }
      }, 100);
    });
  }
}

/* ===================================
   PERFORMANCE OPTIMIZATIONS
   =================================== */

// Debounce function for performance optimization
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

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* ===================================
   ERROR HANDLING AND LOGGING
   =================================== */

// Global error handler
window.addEventListener('error', function (e) {
  console.error('JavaScript error occurred:', e.error);
  // In production, you might want to send this to an error tracking service
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function (e) {
  console.error('Unhandled promise rejection:', e.reason);
  // In production, you might want to send this to an error tracking service
});

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Get element's offset from top of page
function getOffsetTop(element) {
  let offsetTop = 0;
  while (element) {
    offsetTop += element.offsetTop;
    element = element.offsetParent;
  }
  return offsetTop;
}

/* ===================================
   ANIMATION STYLES (Added via JavaScript)
   =================================== */

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

/* ===================================
   CONSOLE WELCOME MESSAGE
   =================================== */

console.log(`
%c🧬 Solana NAD+ Website
%cBuilt with professional standards for optimal performance and accessibility.
%cFor support: support@solanad.com
`,
  'color: #4a7c59; font-size: 16px; font-weight: bold;',
  'color: #334155; font-size: 12px;',
  'color: #4a7c59; font-size: 12px;'
);
