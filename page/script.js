// ============================================
// OMNI Landing Page — Interactions
// ============================================

// --- AI Animation (Semantic Distillation) ---
function initAIAnimation() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles = [], signalPulses = [];
  
  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.size = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.processed = false;
    }
    update() {
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = centerX - this.x;
      const dy = centerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Attraction to center (distillation)
      if (dist < 300) {
        this.vx += dx * 0.001;
        this.vy += dy * 0.001;
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        if (dist < 20) {
          this.reset();
          if (Math.random() > 0.7) createSignal();
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.reset();
      }
    }
    draw() {
      ctx.fillStyle = `rgba(168, 85, 247, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function createSignal() {
    signalPulses.push({
      x: width / 2,
      y: height / 2,
      r: 0,
      alpha: 0.8,
      color: Math.random() > 0.5 ? '#22d3ee' : '#a855f7'
    });
  }

  for (let i = 0; i < 150; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw central glow
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, 100);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    signalPulses.forEach((s, i) => {
      s.r += 4;
      s.alpha *= 0.97;
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (s.alpha < 0.01) signalPulses.splice(i, 1);
    });

    requestAnimationFrame(animate);
  }
  
  animate();
}

// --- Copy to Clipboard ---
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        const original = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      }
    });
  });
}

// --- Scroll Reveal (Intersection Observer) ---
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-children').forEach(el => {
    observer.observe(el);
  });
}

// --- Navbar Scroll Effect ---
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const check = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', check, { passive: true });
  check();
}

// --- Smooth Scroll ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Update the DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initScrollReveal();
  initNavbarScroll();
  initAIAnimation(); // Replaced initStarfield with AI animation
  initSmoothScroll();
});
