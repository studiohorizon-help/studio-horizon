(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('animate' in document.documentElement)) return;
  const groups = [
    ['title', '.hero h1, .section > h2, .section > .row-heading, .section > .section-heading, .work-heading'],
    ['row', '.intent-grid > a, .service'],
    ['image', '.featured-image, .concept-grid > article'],
    ['step', '.hero-bottom, .process li, .lab-grid > article, .contact-note'],
    ['graphic', '.brand-mark']
  ];
  const states = [];
  for (const [kind, selector] of groups) {
    document.querySelectorAll(selector).forEach((target, order) => {
      if (target.matches('h1, h2')) {
        const text = document.createElement('span');
        text.className = 'motion-text';
        while (target.firstChild) text.appendChild(target.firstChild);
        target.appendChild(text);
      }
      target.dataset.motion = kind;
      states.push({ target, kind, order, animations: [], focused: false });
    });
  }
  let frame = 0;
  let rebuild = true;
  let printing = false;
  let mobileLayout = window.innerWidth <= 760;
  const cancel = state => {
    state.animations.forEach(animation => animation.cancel());
    state.animations = [];
  };
  function createAnimations(state) {
    const mobile = window.innerWidth <= 760;
    const direction = state.order % 2 === 0 ? -1 : 1;
    const distance = mobile ? 26 : 50;
    state.animations = Array.from(state.target.children, (child, index) => {
      let from = { opacity: 0.12, transform: `translateY(${distance}px)` };
      let to = { opacity: 1, transform: 'translate(0, 0)' };
      switch (state.kind) {
        case 'title':
          from = {
            opacity: 0.08,
            transform: `translateY(${mobile ? 32 : 58}px) skewY(${mobile ? 0 : 1.5}deg)`,
            clipPath: 'inset(0 0 65% 0)'
          };
          to.clipPath = 'inset(0)';
          break;
        case 'row':
          from.transform = `translateX(${direction * (mobile ? 18 : 44)}px)`;
          // Keep the text steady in scale; the arrow supplies a small accent.
          if (child.matches('a, b')) {
            from.transform = `translateX(${direction * 16}px) rotate(${direction * 30}deg)`;
          }
          break;
        case 'image':
          if (child.matches('img, figure')) {
            from = {
              opacity: 0.2,
              transform: `translateY(${mobile ? 16 : 24}px) scale(.95)`,
              clipPath: state.order % 2 === 0
                ? 'inset(0 24% 0 24%)' : 'inset(0 0 0 45%)'
            };
            to.clipPath = 'inset(0)';
          } else {
            from.transform = `translateY(${mobile ? 12 : 20}px)`;
          }
          break;
        case 'step':
          if (state.target.matches('.process li')) {
            from.transform = `translateY(${mobile ? 24 : 42}px) rotate(${direction * (mobile ? 0 : 1)}deg)`;
          } else if (state.target.matches('.lab-grid > article')) {
            from.transform = `translateX(${direction * (mobile ? 18 : 38)}px)`;
          } else {
            from.transform = `translateY(${mobile ? 16 : 28}px) scale(.98)`;
          }
          break;
        case 'graphic': {
          // Preserve the middle bar's existing skew while the H assembles.
          const skew = index === 2 ? ' skewY(-18deg)' : '';
          from = { opacity: 0.08, transform: `translateY(${(index % 2 ? -1 : 1) * (mobile ? 26 : 64)}px)${skew}` };
          to = { opacity: 1, transform: `translateY(0)${skew}` };
          break;
        }
      }
      // Stagger inside the same scroll interval: every child still ends at centre.
      const hold = Math.min(index, 3) * (mobile ? 0.025 : 0.055);
      const keyframes = hold > 0
        ? [{ ...from, offset: 0 }, { ...from, offset: hold }, { ...to, offset: 1 }]
        : [{ ...from, offset: 0 }, { ...to, offset: 1 }];
      const animation = child.animate(keyframes, {
        duration: 1000, fill: 'both', easing: 'cubic-bezier(.22,.61,.36,1)'
      });
      animation.pause();
      return animation;
    });
  }
  function render() {
    frame = 0;
    if (reducedMotion.matches || printing) {
      states.forEach(cancel);
      rebuild = true;
      return;
    }
    // Read resting positions before any animation writes. The targets never move.
    const height = window.innerHeight;
    const start = height * 2 / 3;
    const end = height / 2;
    const atBottom = window.scrollY + height >= document.documentElement.scrollHeight - 2;
    const tops = states.map(state => state.target.getBoundingClientRect().top);
    states.forEach((state, index) => {
      if (rebuild) cancel(state);
      if (!state.animations.length) createAnimations(state);
      const top = tops[index];
      // 0 at the lower-third boundary, 1 at the centre, independent of speed.
      let progress = Math.max(0, Math.min(1, (start - top) / (start - end)));
      if (state.focused || state.target.contains(document.activeElement)) progress = 1;
      // The final section cannot always reach centre: keep end-of-page content readable.
      if (atBottom && top < height) progress = 1;
      state.animations.forEach(animation => { animation.currentTime = progress * 1000; });
    });
    rebuild = false;
  }
  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(render);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    const nextMobileLayout = window.innerWidth <= 760;
    if (nextMobileLayout !== mobileLayout) rebuild = true;
    mobileLayout = nextMobileLayout;
    schedule();
  });
  window.addEventListener('load', schedule);
  document.addEventListener('load', schedule, true);
  document.fonts?.ready.then(schedule);
  reducedMotion.addEventListener('change', schedule);
  document.addEventListener('focusin', event => {
    states.forEach(state => { if (state.target.contains(event.target)) state.focused = true; });
    schedule();
  });
  window.addEventListener('beforeprint', () => { printing = true; states.forEach(cancel); });
  window.addEventListener('afterprint', () => { printing = false; rebuild = true; schedule(); });
  schedule();
})();
