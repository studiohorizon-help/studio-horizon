    (() => {
      const menuButton = document.querySelector('.menu-button');
      const nav = document.querySelector('.nav-links');

      if (!menuButton || !nav) return;

      const closeMenu = () => {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', '메뉴 열기');
      };

      menuButton.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
      });

      nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
          closeMenu();
          menuButton.focus();
        }
      });

      window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
        if (event.matches) closeMenu();
      });
    })();
