(() => {
  'use strict';
  const root = document.getElementById('ova');
  const data = JSON.parse(document.getElementById('contenido').textContent);
  const fixed = Number(new URLSearchParams(location.search).get('escena'));
  const embed = Number.isInteger(fixed) && fixed >= 1 && fixed <= data.scenes.length;
  let current = embed ? fixed - 1 : 0;
  let opener = null;
  const viewed = data.scenes.map(() => new Set());
  const answers = {};
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const art = {
    expediente:'<rect class="paper" x="88" y="18" width="144" height="182" rx="9"/><path class="line" d="M112 68h96M112 92h84M112 116h96M112 140h60"/><path class="accent" d="M88 18h65v32H88z"/><circle class="soft" cx="198" cy="163" r="25"/><path class="stroke small" d="m186 164 8 8 17-20"/>',
    balanza:'<path class="stroke" d="M160 33v150M98 55h124M160 32l-17 19h34zM103 187h114"/><path class="stroke small" d="M111 55 82 126h58L111 55Zm98 0-29 71h58l-29-71Z"/><path class="warm" d="M76 126h70q-5 34-35 34t-35-34Zm99 0h70q-5 34-35 34t-35-34Z"/>',
    puerta:'<rect class="paper" x="88" y="27" width="144" height="172" rx="6"/><rect class="warm" x="117" y="48" width="86" height="151"/><circle class="accent" cx="189" cy="127" r="7"/><path class="stroke small" d="M83 199h154M117 49l43-23 43 23"/>',
    tribunal:'<path class="dark" d="m160 18 108 47H52z"/><path class="warm" d="M66 76h188v16H66zM65 171h190v16H65z"/><path class="stroke" d="M87 96v73m48-73v73m49-73v73m49-73v73M51 191h218"/>',
    escudo:'<path class="paper" d="M160 17 248 50v72q-11 54-88 84-77-30-88-84V50z"/><path class="warm" d="M160 42 224 65v52q-5 39-64 64-59-25-64-64V65z"/><path class="stroke" d="m127 112 23 23 47-52"/>',
    documentos:'<rect class="paper" x="79" y="52" width="128" height="142" rx="7" transform="rotate(-9 143 123)"/><rect class="paper" x="118" y="32" width="126" height="151" rx="7"/><path class="line" d="M140 67h79M140 91h67M140 115h79M140 139h49"/><circle class="accent" cx="210" cy="153" r="20"/>',
    telefono:'<rect class="dark" x="111" y="18" width="98" height="185" rx="17"/><rect class="paper" x="121" y="39" width="78" height="135" rx="4"/><path class="line" d="M138 74h46M138 95h37M138 116h45"/><circle class="warm" cx="160" cy="188" r="7"/>'
  };
  const object = name => `<svg class="symbol" viewBox="0 0 320 220" aria-hidden="true"><ellipse cx="160" cy="204" rx="113" ry="9" fill="#c9d1d2"/>${art[name] || art.expediente}</svg>`;

  function close() {
    const overlay = root.querySelector('.overlay');
    if (!overlay) return;
    overlay.remove();
    if (opener && opener.isConnected) {
      opener.setAttribute('aria-expanded', 'false');
      opener.focus({preventScroll:true});
    }
    opener = null;
  }

  function progress(sceneIndex) {
    const p = root.querySelector('.progress');
    if (!p) return;
    const total = data.scenes[sceneIndex].cards.length;
    const count = viewed[sceneIndex].size;
    p.querySelector('progress').value = count;
    p.querySelector('output').textContent = `${count}/${total} · ${Math.round(100 * count / total)} %`;
  }

  function openCard(index, button) {
    close();
    const scene = data.scenes[current];
    const card = scene.cards[index];
    viewed[current].add(index);
    button.classList.add('seen');
    button.querySelector('i').className = 'fas fa-circle-check';
    progress(current);
    if (!['grid','focus'].includes(scene.variant)) {
      root.querySelectorAll('.card').forEach(b => b.setAttribute('aria-expanded', b === button ? 'true' : 'false'));
      const stage = root.querySelector('.stage');
      stage.classList.add('inline-active');
      root.classList.add('inline-open');
      stage.innerHTML = `<article class="inline-reading" tabindex="-1" aria-label="Lectura de la ficha"><div class="inline-head"><span>${index + 1} / ${scene.cards.length}</span><button type="button" aria-label="Cerrar lectura">Cerrar ×</button></div><p class="inline-text">${escape(card.text)}</p></article>`;
      stage.querySelector('button').addEventListener('click', () => {
        stage.innerHTML = object(scene.object);
        stage.classList.remove('inline-active');
        root.classList.remove('inline-open');
        button.setAttribute('aria-expanded','false');
        button.focus({preventScroll:true});
      });
      stage.querySelector('article').focus({preventScroll:true});
      return;
    }
    opener = button;
    button.setAttribute('aria-expanded','true');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<div class="dialog" role="dialog" aria-modal="true" aria-label="Lectura de la ficha" tabindex="-1"><div class="dialog-head"><span><i class="fas fa-circle-check" aria-hidden="true"></i>${index + 1} / ${data.scenes[current].cards.length}</span><button type="button" class="close" aria-label="Cerrar lectura">Cerrar ×</button></div><div class="dialog-body"><p>${escape(card.text)}</p></div><div class="dialog-footer">${escape(card.label)}</div></div>`;
    root.appendChild(overlay);
    overlay.querySelector('.close').addEventListener('click',close);
    overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
    overlay.querySelector('.dialog').focus({preventScroll:true});
  }

  function render() {
    close();
    const scene = data.scenes[current];
    root.className = `variant-${scene.variant}`;
    const cards = scene.cards.map((card, i) => `<button type="button" class="card${viewed[current].has(i) ? ' seen' : ''}" data-card="${i}" aria-expanded="false"><span class="number">${i + 1}</span><span class="label">${escape(card.label)}</span><i class="fas ${viewed[current].has(i) ? 'fa-circle-check' : 'fa-hand-pointer'}" aria-hidden="true"></i></button>`).join('');
    const answer = scene.case ? `<div class="answer"><label for="respuesta">Respuesta (máximo 500 palabras)</label><textarea id="respuesta" aria-describedby="contador"></textarea><output id="contador" aria-live="polite">0/500 palabras</output></div>` : '';
    const nav = embed ? '' : `<nav class="navigation" aria-label="Escenas de esta lección"><button type="button" data-step="-1" ${current === 0 ? 'disabled' : ''}><i class="fas fa-arrow-left" aria-hidden="true"></i> Anterior</button><div class="dots">${data.scenes.map((_,i) => `<button type="button" data-go="${i}" aria-label="Escena ${i+1} de ${data.scenes.length}" ${i===current?'aria-current="step"':''}></button>`).join('')}</div><button type="button" data-step="1" ${current === data.scenes.length - 1 ? 'disabled' : ''}>Siguiente <i class="fas fa-arrow-right" aria-hidden="true"></i></button></nav>`;
    root.innerHTML = `<section class="scene" aria-label="Escena ${current + 1} de ${data.scenes.length}"><div class="stage">${object(scene.object)}</div><div class="cards">${cards}</div>${answer}${scene.cards.length >= 3 ? `<div class="progress"><progress max="${scene.cards.length}" value="0" aria-label="Exploración de la escena"></progress><output aria-live="polite"></output></div>` : ''}</section>${nav}`;
    root.querySelectorAll('[data-card]').forEach(b => b.addEventListener('click', () => openCard(Number(b.dataset.card),b)));
    root.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {current += Number(b.dataset.step);render();}));
    root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {current = Number(b.dataset.go);render();}));
    if (scene.case) {
      const area = root.querySelector('textarea');
      area.value = answers[current] || '';
      area.addEventListener('input', () => {
        const words = area.value.trim().split(/\s+/).filter(Boolean);
        if(words.length > 500) area.value = words.slice(0,500).join(' ');
        answers[current] = area.value;
        root.querySelector('#contador').textContent = `${area.value.trim().split(/\s+/).filter(Boolean).length}/500 palabras`;
      });
    }
    progress(current);
  }

  document.addEventListener('keydown', e => {
    const dialog = root.querySelector('.dialog');
    if (!dialog) {
      if (e.key === 'Escape') {
        const inlineClose = root.querySelector('.inline-head button');
        if (inlineClose) { e.preventDefault(); inlineClose.click(); }
      }
      return;
    }
    if (e.key === 'Escape') {e.preventDefault(); close(); return;}
    if (e.key === 'Tab') {
      const focusables = [...dialog.querySelectorAll('button,[href],input,textarea,[tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
      if (!focusables.length) {e.preventDefault();return;}
      const first=focusables[0], last=focusables[focusables.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  render();
})();
