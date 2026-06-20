/* ===========================================================
   AMA — общий скрипт сайта
   Меню (sticky + мобильное), музыкальный плеер,
   падающие лепестки, кнопка "наверх"
   =========================================================== */

/* ---------- 1. Sticky-меню: фон при прокрутке ---------- */
window.addEventListener('scroll', function () {
  var n = document.getElementById('ama-nav');
  if (!n) return;
  if (window.scrollY > 10) {
    n.classList.add('scrolled');
  } else {
    n.classList.remove('scrolled');
  }
}, { passive: true });

/* ---------- 2. Плавный переход по якорям при загрузке ---------- */
window.addEventListener('load', function () {
  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }
});

/* ---------- 3. Мобильное меню (гамбургер) ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.cmn-toggle-switch');
  var menu = document.getElementById('ama-mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
    });
  }
});

/* ---------- 4. Музыкальный плеер с плейлистом ---------- */
var amaPlaylist = [
  'images/audio/awakening.mp3',
  'images/audio/Falling_Into_The_Sky_1_1.mp3',
  'images/audio/Higher_Than_Before_1.mp3',
  'images/audio/Falling_Into_The_Sky_2.mp3',
  'images/audio/Into_The_Horizon_1.mp3'
];
var amaTrackIndex = 0;
var amaAudio = null;

function amaStopResumeListeners() {
  document.removeEventListener('click', amaTryResume, true);
  document.removeEventListener('pointerdown', amaTryResume, true);
  document.removeEventListener('touchstart', amaTryResume, true);
  document.removeEventListener('keydown', amaTryResume, true);
  document.removeEventListener('scroll', amaTryResume, true);
}

function amaTryResume() {
  amaStopResumeListeners();
  if (!amaAudio) return;
  var btn = document.getElementById('ama-music-toggle');
  var p = amaAudio.play();
  if (p && p.then) {
    p.then(function () {
      if (btn) btn.classList.add('playing');
    }).catch(function () {});
  }
}

document.addEventListener('DOMContentLoaded', function () {
  amaAudio = document.getElementById('ama-bgmusic');
  var btn = document.getElementById('ama-music-toggle');
  if (!amaAudio || !btn) return;

  amaTrackIndex = parseInt(localStorage.getItem('amaTrackIndex'), 10) || 0;
  var savedTime = parseFloat(localStorage.getItem('amaCurrentTime')) || 0;
  var wasPlaying = localStorage.getItem('amaIsPlaying') === '1';
  var amaInitialResumeDone = false;

  amaAudio.src = amaPlaylist[amaTrackIndex];
  amaUpdateActiveTrackUI();

  amaAudio.addEventListener('loadedmetadata', function () {
    if (amaInitialResumeDone) return;
    amaInitialResumeDone = true;
    if (savedTime > 0 && savedTime < amaAudio.duration) {
      amaAudio.currentTime = savedTime;
    }
    if (wasPlaying) {
      amaTryResume();
      document.addEventListener('click', amaTryResume, true);
      document.addEventListener('pointerdown', amaTryResume, true);
      document.addEventListener('touchstart', amaTryResume, true);
      document.addEventListener('keydown', amaTryResume, true);
      document.addEventListener('scroll', amaTryResume, true);
    }
  });

  /* Пытаемся возобновить сразу — на многих переходах между страницами
     одного сайта браузер уже считает домен «разрешённым» для автоплея,
     раз пользователь уже взаимодействовал с ним ранее. */
  if (wasPlaying) {
    amaTryResume();
  }

  amaAudio.addEventListener('ended', function () {
    amaTrackIndex = (amaTrackIndex + 1) % amaPlaylist.length;
    localStorage.setItem('amaTrackIndex', amaTrackIndex);
    localStorage.setItem('amaCurrentTime', '0');
    amaAudio.src = amaPlaylist[amaTrackIndex];
    amaAudio.play();
    amaUpdateActiveTrackUI();
  });

  amaAudio.addEventListener('timeupdate', function () {
    localStorage.setItem('amaCurrentTime', amaAudio.currentTime);
  });

  window.addEventListener('beforeunload', function () {
    localStorage.setItem('amaCurrentTime', amaAudio.currentTime);
    localStorage.setItem('amaTrackIndex', amaTrackIndex);
  });
});

var amaToggleBusy = false;

function amaToggleMusic() {
  var btn = document.getElementById('ama-music-toggle');
  if (!amaAudio || amaToggleBusy) return;
  if (typeof amaStopResumeListeners === 'function') amaStopResumeListeners();

  if (amaAudio.paused) {
    amaToggleBusy = true;
    var p = amaAudio.play();
    if (p && p.then) {
      p.then(function () {
        btn.classList.add('playing');
        localStorage.setItem('amaIsPlaying', '1');
        amaToggleBusy = false;
      }).catch(function () {
        // Воспроизведение не разрешено браузером в данный момент — оставляем кнопку выключенной
        btn.classList.remove('playing');
        localStorage.setItem('amaIsPlaying', '0');
        amaToggleBusy = false;
      });
    } else {
      btn.classList.add('playing');
      localStorage.setItem('amaIsPlaying', '1');
      amaToggleBusy = false;
    }
  } else {
    amaAudio.pause();
    btn.classList.remove('playing');
    localStorage.setItem('amaIsPlaying', '0');
  }
}

function amaSelectTrack(index) {
  amaTrackIndex = index;
  amaAudio.pause();
  amaAudio.src = amaPlaylist[amaTrackIndex];
  amaAudio.currentTime = 0;
  amaAudio.load();
  amaAudio.play();
  document.getElementById('ama-music-toggle').classList.add('playing');
  localStorage.setItem('amaIsPlaying', '1');
  localStorage.setItem('amaTrackIndex', amaTrackIndex);
  localStorage.setItem('amaCurrentTime', '0');
  amaUpdateActiveTrackUI();
}

function amaUpdateActiveTrackUI() {
  var items = document.querySelectorAll('.ama-track-item');
  for (var i = 0; i < items.length; i++) {
    if (i === amaTrackIndex) {
      items[i].classList.add('active');
    } else {
      items[i].classList.remove('active');
    }
  }
}

/* ---------- 5. Падающие лепестки на фоне баннера ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var wrap = document.getElementById('ama-petals');
  if (!wrap) return;

  var colors = [
    'rgba(255,182,193,0.85)',
    'rgba(255,160,180,0.8)',
    'rgba(255,200,210,0.75)',
    'rgba(255,140,165,0.7)',
    'rgba(255,210,220,0.8)'
  ];
  var heroSection = wrap.closest('section, div.ama-hero');

  function amaFallDist() {
    var h = (heroSection ? heroSection.offsetHeight : wrap.offsetHeight) || 580;
    return (h + 40) + 'px';
  }

  var petals = [];
  for (var i = 0; i < 22; i++) {
    var p = document.createElement('div');
    p.className = 'ama-petal';
    var s = 6 + Math.random() * 8;
    p.style.cssText =
      'left:' + Math.random() * 100 + '%;' +
      'top:-10px;' +
      'width:' + s + 'px;height:' + s + 'px;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'animation-duration:' + (7 + Math.random() * 8) + 's;' +
      'animation-delay:' + Math.random() * 6 + 's;' +
      '--ama-fall-dist:' + amaFallDist() + ';';
    wrap.appendChild(p);
    petals.push(p);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var dist = amaFallDist();
      for (var j = 0; j < petals.length; j++) {
        petals[j].style.setProperty('--ama-fall-dist', dist);
      }
    }, 150);
  });
});

/* ---------- 6. Кнопка "наверх" ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.querySelector('.scrollup');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ---------- 7. Форма подписки в подвале (заглушка) ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Подписка оформлена! (форма пока demo — подключите свой обработчик)');
    form.reset();
  });
});

/* ---------- 8. Apple-style слайдер брендов на главной ---------- */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-brand-slider]').forEach(function (slider) {
    var viewport = slider.querySelector('.brand-slider-viewport');
    var track = slider.querySelector('.brand-slider-track');
    var originalSlides = Array.prototype.slice.call(slider.querySelectorAll('.brand-slide'));
    var prev = slider.querySelector('.brand-slider-prev');
    var next = slider.querySelector('.brand-slider-next');
    var dotsWrap = slider.querySelector('.brand-slider-dots');
    var slideCount = originalSlides.length;
    var slides = [];
    var current = 0;
    var startX = 0;
    var dragX = 0;
    var baseX = 0;
    var isDragging = false;
    var didDrag = false;

    if (!viewport || !track || !slideCount) return;

    var before = document.createDocumentFragment();
    var after = document.createDocumentFragment();
    originalSlides.forEach(function (slide) {
      var cloneBefore = slide.cloneNode(true);
      var cloneAfter = slide.cloneNode(true);
      cloneBefore.classList.add('brand-slide-clone');
      cloneAfter.classList.add('brand-slide-clone');
      before.appendChild(cloneBefore);
      after.appendChild(cloneAfter);
    });
    track.insertBefore(before, track.firstChild);
    track.appendChild(after);
    slides = Array.prototype.slice.call(track.querySelectorAll('.brand-slide'));

    function slideOffset(index) {
      var slide = slides[slideCount + index];
      return (viewport.clientWidth / 2) - (slide.offsetLeft + slide.offsetWidth / 2);
    }

    function setActive(index) {
      current = (index + slideCount) % slideCount;
      baseX = slideOffset(current);
      track.style.transform = 'translate3d(' + baseX + 'px,0,0)';

      slides.forEach(function (slide, i) {
        var isActive = i === slideCount + current;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      if (dotsWrap) {
        dotsWrap.querySelectorAll('.brand-slider-dot').forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
          dot.setAttribute('aria-current', i === current ? 'true' : 'false');
        });
      }
    }

    if (dotsWrap) {
      originalSlides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'brand-slider-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Показать бренд ' + (i + 1));
        dot.addEventListener('click', function () { setActive(i); });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) prev.addEventListener('click', function () { setActive(current - 1); });
    if (next) next.addEventListener('click', function () { setActive(current + 1); });

    viewport.addEventListener('pointerdown', function (e) {
      isDragging = true;
      didDrag = false;
      startX = e.clientX;
      dragX = 0;
      baseX = slideOffset(current);
      slider.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      dragX = e.clientX - startX;
      if (Math.abs(dragX) > 5) didDrag = true;
      track.style.transform = 'translate3d(' + (baseX + dragX) + 'px,0,0)';
    });

    function finishDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      slider.classList.remove('is-dragging');
      if (e && viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);

      var threshold = Math.min(120, slides[slideCount + current].offsetWidth * .18);
      if (dragX < -threshold) {
        setActive(current + 1);
      } else if (dragX > threshold) {
        setActive(current - 1);
      } else {
        setActive(current);
      }
    }

    viewport.addEventListener('pointerup', finishDrag);
    viewport.addEventListener('pointercancel', finishDrag);
    viewport.addEventListener('lostpointercapture', finishDrag);

    slides.forEach(function (slide) {
      slide.addEventListener('click', function (e) {
        if (didDrag) e.preventDefault();
      });
    });

    window.addEventListener('resize', function () { setActive(current); }, { passive: true });
    setActive(0);
  });
});

/* ---------- 9. Лайтбокс для галереи брендов ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var lb = document.createElement('div');
  lb.id = 'ama-lightbox';
  lb.innerHTML = '<button id="ama-lightbox-close" aria-label="Закрыть">&#215;</button><img id="ama-lightbox-img" src="" alt=""><div id="ama-lightbox-caption"></div>';
  document.body.appendChild(lb);

  var lbImg = document.getElementById('ama-lightbox-img');
  var lbCap = document.getElementById('ama-lightbox-caption');

  document.querySelectorAll('.brand-gallery-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var img = item.querySelector('img');
      lbImg.src = img.src;
      lbCap.textContent = img.alt || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('ama-lightbox-close').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
});

/* ---------- 10. Scroll Reveal ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(function (el) { io.observe(el); });
});

/* ---------- 11. Лепестки на page-hero-full ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var wrap = document.querySelector('.page-hero-petals');
  if (!wrap) return;

  var colors = [
    'rgba(255,182,193,0.85)', 'rgba(255,160,180,0.8)',
    'rgba(255,200,210,0.75)', 'rgba(255,140,165,0.7)', 'rgba(255,210,220,0.8)'
  ];

  for (var i = 0; i < 18; i++) {
    var p = document.createElement('div');
    p.className = 'ama-petal';
    var s = 5 + Math.random() * 7;
    p.style.cssText =
      'left:' + Math.random() * 100 + '%;top:-10px;' +
      'width:' + s + 'px;height:' + s + 'px;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'animation-duration:' + (6 + Math.random() * 7) + 's;' +
      'animation-delay:' + Math.random() * 5 + 's;' +
      '--ama-fall-dist:340px;';
    wrap.appendChild(p);
  }
});

/* ===========================================================
   КОПИРОВАНИЕ EMAIL В БУФЕР ОБМЕНА
   (на случай если у пользователя не настроен почтовый клиент
   и mailto: ссылки не открываются)
   =========================================================== */
function amaCopyEmail(email, btn) {
  function showCopied() {
    if (!btn) return;
    var original = btn.getAttribute('data-original-text') || btn.textContent;
    btn.setAttribute('data-original-text', original);
    btn.textContent = 'Email скопирован!';
    btn.classList.add('is-copied');
    clearTimeout(btn._amaCopyTimeout);
    btn._amaCopyTimeout = setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove('is-copied');
    }, 2000);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(showCopied).catch(function () {
      amaFallbackCopy(email);
      showCopied();
    });
  } else {
    amaFallbackCopy(email);
    showCopied();
  }
}

function amaFallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}
