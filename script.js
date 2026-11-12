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

  const form = document.querySelector('#contactForm');
  if (form) {
    const status = form.querySelector('#formStatus');
    const submit = form.querySelector('[type="submit"]');
    const started = form.querySelector('[name="started"]');
    const fallback = 'Sorry, your message couldn’t be sent. Please try again or email hello@squaberry.co.uk.';
    const stamp = () => { if (started) started.value = String(Math.floor(Date.now() / 1000)); };
    const showStatus = (type, text, focus) => {
      status.className = `form-status field-wide${type ? ` is-${type}` : ''}`;
      status.textContent = text;
      if (focus) status.focus();
    };
    const clearErrors = () => {
      form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
      form.querySelectorAll('.field-error').forEach(node => {
        const field = form.querySelector(`[aria-describedby~="${node.id}"]`);
        if (field) field.setAttribute('aria-describedby', field.getAttribute('aria-describedby').replace(node.id, '').trim());
        node.remove();
      });
    };
    const showErrors = errors => {
      Object.entries(errors || {}).forEach(([name, text]) => {
        const field = form.elements.namedItem(name);
        if (!field || !field.closest) return;
        const note = document.createElement('p');
        note.className = 'field-error';
        note.id = `${field.id}Error`;
        note.textContent = text;
        field.closest('.field').append(note);
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `${field.getAttribute('aria-describedby') || ''} ${note.id}`.trim());
      });
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
    };

    stamp();
    const params = new URLSearchParams(location.search);
    if (params.has('sent')) showStatus('success', 'Thanks — your message is on its way. We’ll reply by email.');
    else if (params.has('error')) showStatus('error', fallback);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      clearErrors();
      submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      showStatus('', 'Sending your message…');
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.ok) {
          form.reset();
          stamp();
          showStatus('success', result.message, true);
        } else {
          showStatus('error', result.message || fallback, !result.errors || !Object.keys(result.errors).length);
          showErrors(result.errors);
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
