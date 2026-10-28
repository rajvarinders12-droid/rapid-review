/* ============================================================
   RAPID REVIEW — Master Interactive Script (Clean & Fast)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. SCROLL REVEALS
     ============================================================ */
  const revealElements = document.querySelectorAll('.rv');
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    revealElements.forEach((el) => observer.observe(el));
  }


  /* ============================================================
     2. CUSTOM MAGNETIC CURSOR (Desktop Only)
     ============================================================ */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let followerX = mouseX;
    let followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.45;
      cursorY += (mouseY - cursorY) * 0.45;
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;

      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      if (follower) {
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    document.querySelectorAll('.hoverable, a, button, input, .case-card, .service-card, .pricing-card, .path-card, .pillar-card').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hover');
        const label = el.getAttribute('data-label') || 'Go';
        cursor.setAttribute('data-label', label);
        if (follower) follower.style.opacity = '0';
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hover');
        cursor.removeAttribute('data-label');
        if (follower) follower.style.opacity = '1';
      });
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      if (follower) follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      if (follower) follower.style.opacity = '1';
    });
  }


  /* ============================================================
     3. HALFTONE CANVAS IN HERO (Lightweight, GPU-efficient & Fast)
     ============================================================ */
  const canvas = document.getElementById('halftone');
  if (canvas && window.innerWidth >= 768) {
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let mx = -9999, my = -9999;
    let time = 0;
    let isVisible = true;
    let isRunning = false;
    let idleTimer = 180;
    const gap = 32; // Generous 32px spacing: 85% fewer dots, silky 60fps

    const resizeCanvas = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const heroSection = canvas.parentElement;
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
        idleTimer = 150;
        if (!isRunning && isVisible && window.scrollY < 200) {
          isRunning = true;
          requestAnimationFrame(drawCanvas);
        }
      }, { passive: true });

      heroSection.addEventListener('mouseleave', () => {
        mx = -9999;
        my = -9999;
      });
    }

    const canvasObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !isRunning && window.scrollY < 200) {
        isRunning = true;
        idleTimer = 120;
        requestAnimationFrame(drawCanvas);
      } else if (!isVisible) {
        isRunning = false;
      }
    }, { threshold: 0.05 });
    canvasObserver.observe(canvas);

    let lastDraw = 0;
    const drawCanvas = (now) => {
      if (!isVisible || window.scrollY > 250) {
        isRunning = false;
        return;
      }

      // Throttle to 30 FPS to reduce CPU consumption by 50%+
      if (now - lastDraw < 33) {
        if (isRunning) requestAnimationFrame(drawCanvas);
        return;
      }
      lastDraw = now;

      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Batched rendering: 2 fill calls instead of thousands!
      ctx.beginPath();
      let hasActive = false;
      const activeDots = [];

      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          const wave = Math.sin(x * 0.006 + time) * Math.cos(y * 0.007 - time * 0.8) * 0.5;
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.hypot(dx, dy);

          if (dist < 150) {
            activeDots.push({ x, y, r: 2.8 + (1 - dist / 150) * 3 });
            hasActive = true;
          } else {
            const radius = Math.max(0.7, (wave * 0.5 + 0.5) * 1.8);
            ctx.moveTo(x + radius, y);
            ctx.arc(x, y, radius, 0, Math.PI * 2);
          }
        }
      }
      ctx.fillStyle = 'rgba(125, 151, 168, 0.2)';
      ctx.fill();

      if (hasActive) {
        ctx.beginPath();
        for (let i = 0; i < activeDots.length; i++) {
          const p = activeDots[i];
          ctx.moveTo(p.x + p.r, p.y);
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.fill();
      }

      if (idleTimer > 0) {
        idleTimer--;
        requestAnimationFrame(drawCanvas);
      } else {
        isRunning = false;
      }
    };

    isRunning = true;
    requestAnimationFrame(drawCanvas);
  }


  /* ============================================================
     4. NAVBAR & SCROLL MANAGER (Throttled & 100% Native Zero-Lag)
     ============================================================ */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const checkNavbarScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 25) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  function toggleMobileMenu(forceState) {
    if (!mobileDrawer || !navToggle) return;
    const shouldOpen = forceState !== undefined ? forceState : !mobileDrawer.classList.contains('open');
    mobileDrawer.classList.toggle('open', shouldOpen);
    navToggle.classList.toggle('open', shouldOpen);
    if (navbar) navbar.classList.toggle('drawer-open', shouldOpen);
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => toggleMobileMenu());
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      toggleMobileMenu(false);
    }
  });


  /* ============================================================
     SMOOTH ANCHOR NAVIGATION (Native & Hardware-Accelerated)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 70;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 14;

        window.scrollTo({
          top: Math.max(0, targetPos),
          behavior: 'smooth'
        });

        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          toggleMobileMenu(false);
        }
      }
    });
  });


  /* ============================================================
     5. MANIFESTO WORD ILLUMINATION ON SCROLL
     ============================================================ */
  const manifestoText = document.getElementById('manifestoText');
  let updateWords = null;

  if (manifestoText) {
    const raw = manifestoText.textContent.trim();
    const words = raw.split(/\s+/);
    manifestoText.innerHTML = words.map(w => {
      const isAccent = ['5-star', 'genuine', 'trust', 'social', 'vip', 'loyalty', 'sales', 'growth'].some(k => w.toLowerCase().includes(k));
      return `<span class="word ${isAccent ? 'accent-target' : ''}">${w} </span>`;
    }).join('');

    const wordSpans = manifestoText.querySelectorAll('.word');

    updateWords = () => {
      const rect = manifestoText.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (windowH * 0.75 - rect.top) / (rect.height + windowH * 0.3)));
      const activeCount = Math.floor(progress * wordSpans.length);

      wordSpans.forEach((span, idx) => {
        if (idx <= activeCount) {
          if (span.classList.contains('accent-target')) {
            span.classList.add('lit-accent');
          } else {
            span.classList.add('lit');
          }
        } else {
          span.classList.remove('lit');
          span.classList.remove('lit-accent');
        }
      });
    };
  }

  /* Single Throttled Scroll Listener (Zero Lag, 120Hz/60Hz smooth) */
  let scrollTicking = false;
  const onPageScroll = () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        checkNavbarScroll();
        if (updateWords) updateWords();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  };

  checkNavbarScroll();
  if (updateWords) updateWords();
  window.addEventListener('scroll', onPageScroll, { passive: true });


  /* ============================================================
     6. PHONE FUNNEL SIMULATOR
     ============================================================ */
  const starButtons = document.querySelectorAll('.sim-star-btn');
  const simResultBox = document.getElementById('simResultBox');

  const updateSimulator = (rating) => {
    starButtons.forEach((btn, index) => {
      if (index < rating) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (!simResultBox) return;

    if (rating >= 4) {
      simResultBox.className = 'sim-flow-result google-route';
      simResultBox.innerHTML = `
        <h6 style="color:var(--emerald);">★ 5-Star Reviews: Google Maps, Amazon, Trustpilot & Facebook</h6>
        <p>Happy customer publishes public 5-star reviews in 5 seconds, boosting your sales and ranking.</p>
      `;
    } else {
      simResultBox.className = 'sim-flow-result support-route';
      simResultBox.innerHTML = `
        <h6 style="color:var(--cyan);">💬 1-on-1 VIP Support Connected</h6>
        <p>Customer connects directly to your private WhatsApp for fast, personal care that builds brand loyalty.</p>
      `;
    }
  };

  starButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const rating = parseInt(btn.getAttribute('data-rating') || '5', 10);
      updateSimulator(rating);
    });
  });
  updateSimulator(5);


  /* ============================================================
     7. ROI CALCULATOR
     ============================================================ */
  const rangeRevenue = document.getElementById('rangeRevenue');
  const rangeRating = document.getElementById('rangeRating');
  const valRevenue = document.getElementById('valRevenue');
  const valRating = document.getElementById('valRating');
  const roiLiftNum = document.getElementById('roiLiftNum');
  const roiConvRate = document.getElementById('roiConvRate');
  const roiExtraOrders = document.getElementById('roiExtraOrders');

  function calculateROI() {
    if (!rangeRevenue || !rangeRating) return;

    const rev = parseFloat(rangeRevenue.value);
    const rating = parseFloat(rangeRating.value);
    const targetRating = 4.6;

    if (valRevenue) valRevenue.textContent = `₹${(rev / 100).toFixed(1)} Lakhs/mo`;
    if (valRating) valRating.textContent = `${rating.toFixed(1)} ★`;

    const starDelta = Math.max(0.2, targetRating - rating);
    const liftPercentage = Math.min(54, Math.round(starDelta * 22 + 8));

    const extraRevenue = Math.round((rev * 1000) * (liftPercentage / 100));
    const extraOrdersApprox = Math.round(extraRevenue / 1800);

    if (roiLiftNum) roiLiftNum.textContent = `+₹${(extraRevenue / 100000).toFixed(2)} Lakhs`;
    if (roiConvRate) roiConvRate.textContent = `+${liftPercentage}%`;
    if (roiExtraOrders) roiExtraOrders.textContent = `~${extraOrdersApprox} more orders`;
  }

  if (rangeRevenue && rangeRating) {
    rangeRevenue.addEventListener('input', calculateROI);
    rangeRating.addEventListener('input', calculateROI);
    calculateROI();
  }


  /* ============================================================
     8. CONTACT FORM -> WHATSAPP
     ============================================================ */
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const brandName = document.getElementById('brandName')?.value || 'Our Brand';
      const platform = document.getElementById('platformSelect')?.value || 'All 4 Platforms';
      const phone = document.getElementById('clientPhone')?.value || '';

      const message = `Hello Rapid Review Team,\n\nI would like to start a Reputation Campaign for *${brandName}*.\n- Platform: ${platform}\n- WhatsApp Contact: ${phone}\n\nPlease share campaign timeline and proposal.`;

      const waUrl = `https://wa.me/917341138757?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    });
  }

});
