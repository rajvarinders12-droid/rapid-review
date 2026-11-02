/* ============================================================
   RAPID REVIEW — Master Interactive Script (Clean & Fast)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. SCROLL REVEALS (Smooth Bidirectional Fade-In & Fade-Out)
     ============================================================ */
  const revealElements = document.querySelectorAll('.rv');
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          entry.target.classList.remove('is-hidden');
        } else {
          // Smoothly fade out when out of view
          entry.target.classList.remove('is-revealed');
          entry.target.classList.add('is-hidden');
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
     3. HALFTONE CANVAS IN HERO (Axuvo Signature 1:1 Halftone)
     ============================================================ */
  function initHalftone(canvasId, mouseReactive) {
    const cv = document.getElementById(canvasId);
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let mx = -999, my = -999, t = 0, visible = true, running = true;
    const isMobile = window.innerWidth < 760;
    const gap = isMobile ? 18 : 14;

    function size() {
      W = cv.offsetWidth;
      H = cv.offsetHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size, { passive: true });

    if (mouseReactive && !isMobile) {
      const heroParent = cv.parentElement;
      if (heroParent) {
        heroParent.addEventListener('mousemove', e => {
          const r = cv.getBoundingClientRect();
          mx = e.clientX - r.left;
          my = e.clientY - r.top;
        }, { passive: true });
        heroParent.addEventListener('mouseleave', () => { mx = -999; my = -999; });
      }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        if (visible && !running) { running = true; draw(); }
      }, { threshold: .01 }).observe(cv);
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw() {
      if (!visible) { running = false; return; }
      t += .008;
      ctx.clearRect(0, 0, W, H);
      for (let y = gap / 2; y < H; y += gap) {
        for (let x = gap / 2; x < W; x += gap) {
          let v = Math.sin(x * .006 + t * 1.4) * Math.cos(y * .008 - t) * .5
               + Math.sin((x + y) * .004 + t * .7) * .5;
          v = (v + 1) / 2;
          if (mx > -500) {
            const d = Math.hypot(x - mx, y - my);
            v += Math.max(0, 1 - d / 220) * .9;
          }
          v = Math.min(1, Math.max(0, v));
          const r = v * v * (gap * .46);
          if (r < .4) continue;
          const blue = Math.sin(x * .002 + t * .5) > 0.55;
          ctx.fillStyle = blue ? `rgba(125,151,168,${.25 + v * .6})` : `rgba(233,229,218,${.12 + v * .75})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (reduced) { running = false; return; }
      requestAnimationFrame(draw);
    }
    draw();
  }
  initHalftone('halftone', true);


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

  const mobileDrawerClose = document.getElementById('mobileDrawerClose');

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

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', () => toggleMobileMenu(false));
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
     6. PHONE FUNNEL SIMULATOR (100% Positive Growth-Oriented)
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
        <h6 style="color:var(--emerald);">★ 5-Star Reviews Published Instantly</h6>
        <p>Customer publishes a verified 5-star review across Google Maps, Amazon, Trustpilot & Facebook in seconds, lifting your rankings and sales.</p>
      `;
    } else {
      simResultBox.className = 'sim-flow-result support-route';
      simResultBox.innerHTML = `
        <h6 style="color:var(--cyan);">✦ Proactive Brand Care & Engagement</h6>
        <p>Your team engages the customer proactively, creating high satisfaction, turning them into a happy reviewer and loyal repeat buyer.</p>
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
     7. ACCORDION FAQ (Smooth Fluid Expand & Collapse)
     ============================================================ */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const summary = item.querySelector('.faq-summary');
    if (summary) {
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = item.classList.contains('active');

        // Close all other items with smooth transition
        faqItems.forEach((other) => {
          if (other !== item && other.classList.contains('active')) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-summary');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle clicked item
        if (isActive) {
          item.classList.remove('active');
          summary.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          summary.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });


  /* ============================================================
     8. ROI CALCULATOR
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
     8. CONTACT FORM -> WHATSAPP (with Custom Platform Support)
     ============================================================ */
  const leadForm = document.getElementById('leadForm');
  const platformSelect = document.getElementById('platformSelect');
  const customPlatformGroup = document.getElementById('customPlatformGroup');
  const customPlatformInput = document.getElementById('customPlatformInput');

  if (platformSelect && customPlatformGroup) {
    platformSelect.addEventListener('change', () => {
      if (platformSelect.value === 'custom') {
        customPlatformGroup.style.display = 'flex';
        if (customPlatformInput) customPlatformInput.focus();
      } else {
        customPlatformGroup.style.display = 'none';
      }
    });
  }

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const brandName = document.getElementById('brandName')?.value || 'Our Brand';
      let platform = platformSelect?.value || 'All 4 Platforms';
      if (platform === 'custom') {
        platform = customPlatformInput?.value?.trim() || 'Custom / Other Platforms';
      }
      const phone = document.getElementById('clientPhone')?.value || '';

      const message = `Hello Rapid Review Team,\n\nI would like to start a Reputation Campaign for *${brandName}*.\n- Platform: ${platform}\n- WhatsApp Contact: ${phone}\n\nPlease share campaign timeline and proposal.`;

      const waUrl = `https://wa.me/917341138757?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    });
  }


  /* ============================================================
     9. ABOUT RAPID REVIEW: VIDEO LIGHTBOX
     ============================================================ */
  const videoModal = document.getElementById('videoModal');
  const openVideoModalBtn = document.getElementById('openVideoModalBtn');
  const closeVideoModalBtn = document.getElementById('closeVideoModalBtn');
  const modalVideoIframe = document.getElementById('modalVideoIframe');

  function openVideoModal() {
    if (!videoModal || !modalVideoIframe) return;
    const videoSrc = modalVideoIframe.getAttribute('data-src');
    if (videoSrc) {
      modalVideoIframe.src = videoSrc;
    }
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal || !modalVideoIframe) return;
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    // Clear iframe src to stop video playback and audio immediately
    modalVideoIframe.src = '';
    document.body.style.overflow = '';
  }

  if (openVideoModalBtn) {
    openVideoModalBtn.addEventListener('click', openVideoModal);
  }

  if (closeVideoModalBtn) {
    closeVideoModalBtn.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('open')) {
      closeVideoModal();
    }
  });


  /* ============================================================
     10. NEWSPAPER FEATURE HORIZONTAL SCROLL & IMAGE LIGHTBOX MODAL
     ============================================================ */
  const newsTrack = document.getElementById('newspaperScroll');
  const newsLeft = document.getElementById('newsScrollLeft');
  const newsRight = document.getElementById('newsScrollRight');

  if (newsTrack && newsLeft && newsRight) {
    newsLeft.addEventListener('click', () => {
      newsTrack.scrollBy({ left: -360, behavior: 'smooth' });
    });
    newsRight.addEventListener('click', () => {
      newsTrack.scrollBy({ left: 360, behavior: 'smooth' });
    });
  }

  // Newspaper Image Lightbox Modal
  const imageModal = document.getElementById('imageModal');
  const closeImageModalBtn = document.getElementById('closeImageModalBtn');
  const imageModalImg = document.getElementById('imageModalImg');
  const imageModalTitle = document.getElementById('imageModalTitle');
  const newspaperCards = document.querySelectorAll('.newspaper-card');

  function openImageModal(imgSrc, title) {
    if (!imageModal || !imageModalImg) return;
    imageModalImg.src = imgSrc;
    imageModalImg.alt = title || 'Newspaper Coverage';
    if (imageModalTitle) {
      imageModalTitle.textContent = title || 'Press & Newspaper Coverage';
    }
    imageModal.classList.add('open');
    imageModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeImageModal() {
    if (!imageModal || !imageModalImg) return;
    imageModal.classList.remove('open');
    imageModal.setAttribute('aria-hidden', 'true');
    imageModalImg.src = '';
    document.body.style.overflow = '';
  }

  if (newspaperCards.length) {
    newspaperCards.forEach((card) => {
      card.addEventListener('click', () => {
        const imgSrc = card.getAttribute('data-img');
        const title = card.getAttribute('data-title');
        if (imgSrc) {
          openImageModal(imgSrc, title);
        }
      });
      // Keyboard accessibility
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const imgSrc = card.getAttribute('data-img');
          const title = card.getAttribute('data-title');
          if (imgSrc) openImageModal(imgSrc, title);
        }
      });
    });
  }

  if (closeImageModalBtn) {
    closeImageModalBtn.addEventListener('click', closeImageModal);
  }

  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        closeImageModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && imageModal && imageModal.classList.contains('open')) {
      closeImageModal();
    }
  });

});
