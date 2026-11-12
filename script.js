(() => {
  'use strict';
  const menu = document.querySelector('#menuButton');
  const nav = document.querySelector('#navigation');
  if (menu && nav) {
    const closeMenu = () => {
      menu.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      menu.querySelector('b').textContent = '+';
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      menu.querySelector('b').textContent = open ? '−' : '+';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menu.focus();
      }
    });
  }

  const tabs = [...document.querySelectorAll('.process-tab')];
  const chooseTab = index => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseTab(index));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      chooseTab(next);
      tabs[next].focus();
    });
  });

  // Contact form: FormSubmit (formsubmit.co) emails each submission to the address in the form's action.
  // With JS we post to its AJAX endpoint and show the result inline; without JS the form posts
  // normally and FormSubmit redirects back to the _next URL (contact.html?sent=1).
  const form = document.querySelector('#contactForm');
  if (form) {
    const status = form.querySelector('#formStatus');
    const submit = form.querySelector('[type="submit"]');
    const success = 'Thanks — your message has been sent. We’ll reply by email.';
    const fallback = 'Sorry, your message couldn’t be sent. Please try again or email hello@squaberry.co.uk.';
    const showStatus = (type, text, focus) => {
      status.className = 'form-status field-wide' + (type ? ` is-${type}` : '');
      status.textContent = text;
      if (focus) status.focus();
    };

    if (new URLSearchParams(location.search).has('sent')) showStatus('success', success);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      showStatus('', 'Sending your message…');
      try {
        const response = await fetch(form.dataset.ajaxAction, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok && String(result.success) === 'true') {
          form.reset();
          showStatus('success', success, true);
        } else {
          showStatus('error', fallback, true);
        }
      } catch {
        showStatus('error', fallback, true);
      } finally {
        submit.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach(node => {
    node.textContent = new Date().getFullYear();
  });
})();
