// 모모케어 라이트박스 — vanilla JS + native <dialog>
// img.zoomable 자동 발동. ESC·focus trap·외부 클릭 = native dialog.showModal() 자동
(function () {
  'use strict';

  function init() {
    const triggers = Array.from(document.querySelectorAll('img.zoomable'));
    if (triggers.length === 0) return;

    // 라이트박스 dialog 신설 (한 번만)
    const dlg = document.createElement('dialog');
    dlg.className = 'mc-lightbox';
    dlg.setAttribute('aria-label', '이미지 확대 보기');
    dlg.innerHTML = `
      <button class="mc-lb-close" type="button" aria-label="닫기">✕</button>
      <button class="mc-lb-prev" type="button" aria-label="이전 이미지">‹</button>
      <button class="mc-lb-next" type="button" aria-label="다음 이미지">›</button>
      <figure>
        <img alt="">
        <figcaption></figcaption>
      </figure>
    `;
    document.body.appendChild(dlg);

    const lbImg = dlg.querySelector('img');
    const lbCap = dlg.querySelector('figcaption');
    const btnClose = dlg.querySelector('.mc-lb-close');
    const btnPrev = dlg.querySelector('.mc-lb-prev');
    const btnNext = dlg.querySelector('.mc-lb-next');

    let currentIdx = 0;

    function show(idx) {
      currentIdx = (idx + triggers.length) % triggers.length;
      const src = triggers[currentIdx].getAttribute('src');
      const alt = triggers[currentIdx].getAttribute('alt') || '';
      const cap = triggers[currentIdx].getAttribute('data-caption') || alt;
      lbImg.setAttribute('src', src);
      lbImg.setAttribute('alt', alt);
      lbCap.textContent = cap;
    }

    function open(idx) {
      show(idx);
      if (typeof dlg.showModal === 'function') {
        dlg.showModal();
      } else {
        dlg.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
    }

    function close() {
      if (typeof dlg.close === 'function') {
        dlg.close();
      } else {
        dlg.removeAttribute('open');
      }
      document.body.style.overflow = '';
      // 트리거에 focus 복귀
      triggers[currentIdx].focus();
    }

    // 클릭 핸들러
    triggers.forEach((img, idx) => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', '이미지 확대: ' + (img.getAttribute('alt') || ''));
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(idx));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(idx);
        }
      });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => show(currentIdx - 1));
    btnNext.addEventListener('click', () => show(currentIdx + 1));

    // backdrop 클릭 = 닫기
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) close();
    });

    // 키 네비 (ESC는 native dialog가 자동 처리)
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        show(currentIdx - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        show(currentIdx + 1);
      }
    });

    // close 이벤트 시 body overflow 복구
    dlg.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
