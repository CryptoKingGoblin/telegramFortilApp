//document.getElementById("root").innerHTML = "<h1>📲 Mini-App Telegram</h1><p>Bienvenue dans la WebApp</p>";

/*
  Telegram Mini App — Menu principal
  Fichier: index.js
  Design: moderne, fluide, responsive, sans dépendances externes
*/

(() => {
  'use strict';

  const tg = window.Telegram ? window.Telegram.WebApp : null;

  // ———————————————————————————
  // THEME & STYLES
  // ———————————————————————————
  const theme = () => ({
    bg: cssVar('bg_color', '#0e0f12'),
    text: cssVar('text_color', '#e5e7eb'),
    hint: cssVar('hint_color', '#9ca3af'),
    link: cssVar('link_color', '#60a5fa'),
    btn: cssVar('button_color', '#3b82f6'),
    btnText: cssVar('button_text_color', '#ffffff'),
    secondaryBg: cssVar('secondary_bg_color', '#171a21'),
    accent: cssVar('accent_text_color', '#93c5fd'),
  });

  function cssVar(key, fallback) {
    if (!tg || !tg.themeParams) return fallback;
    const v = tg.themeParams[key];
    return v ? v : fallback;
  }

  function injectStyles() {
    const t = theme();
    const style = document.createElement('style');
    style.id = 'miniapp-styles';
    style.textContent = `
      :root{
        --bg: ${t.bg};
        --fg: ${t.text};
        --muted: ${t.hint};
        --link: ${t.link};
        --primary: ${t.btn};
        --on-primary: ${t.btnText};
        --surface: ${t.secondaryBg};
        --accent: ${t.accent};
        --radius: 18px;
        --shadow: 0 10px 30px rgba(0,0,0,.25);
      }
      *{box-sizing:border-box}
      html,body{height:100%}
      body{margin:0;font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial;
           background: radial-gradient(1200px 800px at 80% -10%, rgba(147,197,253,.10), transparent),
                       radial-gradient(1000px 600px at -10% 110%, rgba(96,165,250,.12), transparent),
                       var(--bg);
           color:var(--fg); -webkit-font-smoothing:antialiased;}
      .container{min-height:100%; padding:18px 16px 80px; max-width:820px; margin:0 auto;}
      header{display:flex; align-items:center; gap:12px; margin:6px 2px 18px;}
      .avatar{width:40px;height:40px;border-radius:50%; background:linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
              display:grid; place-items:center; box-shadow:var(--shadow)}
      .avatar span{font-size:18px}
      .title{font-size:22px; font-weight:700; letter-spacing:.2px}
      .subtitle{color:var(--muted); font-size:14px}

      .searchbar{display:flex; gap:10px; margin:8px 2px 22px}
      .searchbar input{flex:1; padding:12px 14px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04);
                       border-radius:14px; outline:0; color:var(--fg)}
      .searchbar button{padding:12px 14px; border-radius:14px; border:0; background:var(--primary); color:var(--on-primary);
                        font-weight:600; box-shadow:var(--shadow); cursor:pointer}

      .grid{display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px}
      @media(min-width:560px){ .grid{grid-template-columns:repeat(3, minmax(0,1fr));} }

      .card{position:relative; overflow:hidden; border-radius:var(--radius); padding:16px; cursor:pointer;
            background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
            border:1px solid rgba(255,255,255,.10); box-shadow:var(--shadow); transform:translateZ(0)}
      .card::after{content:""; position:absolute; inset:auto -30% -30% auto; width:120px; height:120px;
                   background:radial-gradient(circle at center, rgba(147,197,253,.35), transparent 60%);
                   filter:blur(10px); transform:rotate(25deg)}
      .card:hover{transform:translateY(-2px)}
      .card:active{transform:translateY(0) scale(.99)}
      .card .icon{font-size:28px;}
      .card h3{margin:10px 0 4px; font-size:16px}
      .card p{margin:0; font-size:13px; color:var(--muted)}

      .pill{position:absolute; top:10px; right:10px; font-size:11px; padding:6px 8px; border-radius:999px;
            background:rgba(147,197,253,.16); border:1px solid rgba(147,197,253,.35); color:var(--accent);}

      .section{margin-top:26px}
      .section h4{margin:0 2px 10px; font-size:13px; color:var(--muted); text-transform:uppercase; letter-spacing:.12em}

      .toast{position:fixed; left:50%; bottom:18px; transform:translateX(-50%);
             background:rgba(15,17,23,.92); border:1px solid rgba(255,255,255,.10); color:#fff;
             padding:12px 14px; border-radius:12px; box-shadow:var(--shadow); opacity:0; pointer-events:none;
             transition:opacity .28s ease}
      .toast.show{opacity:1}

      .hidden{display:none}

      .fade-in{animation:fade .35s ease both}
      @keyframes fade{from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:none}}

      .ripple{position:absolute; border-radius:50%; transform:scale(0); animation:ripple .6s linear; background:rgba(255,255,255,.35)}
      @keyframes ripple{to{transform:scale(14); opacity:0}}
    `;
    document.head.appendChild(style);
  }

  // ———————————————————————————
  // UI BUILDERS
  // ———————————————————————————
  const MENU = [
    { id: 'dashboard', emoji: '📊', title: 'Dashboard', subtitle: 'Vue d’ensemble & KPIs', badge: 'Live' },
    { id: 'prospects', emoji: '🧭', title: 'Prospects', subtitle: 'Explorer de nouvelles pistes' },
    { id: 'clients', emoji: '🤝', title: 'Clients', subtitle: 'Suivi & relations' },
    { id: 'pipeline', emoji: '🗂️', title: 'Pipeline', subtitle: 'Opportunités en cours' },
    { id: 'tasks', emoji: '✅', title: 'Tâches', subtitle: 'Priorités du jour' },
    { id: 'settings', emoji: '⚙️', title: 'Paramètres', subtitle: 'Personnalisation' },
  ];

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => node.dataset[dk] = dv);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.substring(2), v);
      else if (k === 'html') node.innerHTML = v;
      else if (v !== undefined && v !== null) node.setAttribute(k, v);
    });
    children.forEach(c => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  }

  function ripple(e) {
    const card = e.currentTarget;
    const old = card.querySelector('.ripple');
    if (old) old.remove();
    const circle = document.createElement('span');
    const diameter = Math.max(card.clientWidth, card.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - card.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - card.getBoundingClientRect().top - radius}px`;
    circle.className = 'ripple';
    card.appendChild(circle);
  }

  function toast(message, ms = 1400) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = el('div', { class: 'toast' });
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), ms);
  }

  function build() {
    document.body.innerHTML = '';
    injectStyles();

    const name = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? tg.initDataUnsafe.user.first_name : 'toi';

    const root = el('div', { class: 'container fade-in' }, [
      el('header', {}, [
        el('div', { class: 'avatar' }, [ el('span', {}, [document.createTextNode('✨')]) ]),
        el('div', {}, [
          el('div', { class: 'title' }, [ document.createTextNode('Menu principal') ]),
          el('div', { class: 'subtitle' }, [ document.createTextNode(`Bienvenue, ${name} !`) ])
        ])
      ]),

      el('div', { class: 'searchbar' }, [
        el('input', { type: 'search', placeholder: 'Rechercher une section…', oninput: onSearch }),
        el('button', { onclick: () => toast('Recherche rapide à venir') }, [ document.createTextNode('Rechercher') ])
      ]),

      el('section', { class: 'section' }, [
        el('h4', {}, [ document.createTextNode('Navigation') ]),
        el('div', { class: 'grid', id: 'grid' }, MENU.map(item => card(item)))
      ])
    ]);

    document.body.appendChild(root);

    if (tg) {
      // Telegram WebApp integrations
      try { tg.expand(); } catch {}
      try { tg.setHeaderColor('secondary_bg_color'); } catch {}
      try { tg.setBackgroundColor('bg_color'); } catch {}

      tg.onEvent('themeChanged', () => {
        const old = document.getElementById('miniapp-styles');
        if (old) old.remove();
        injectStyles();
      });

      // Configure MainButton
      tg.MainButton.setParams({ text: 'Continuer', color: theme().btn, text_color: theme().btnText, is_active: false });
      tg.MainButton.onClick(() => {
        const selected = document.querySelector('.card[data-selected="true"]');
        if (!selected) return;
        const id = selected.dataset.id;
        pushAction({type:'open_section', id});
      });

      // Back button for subsection navigation
      tg.BackButton.hide();
      tg.BackButton.onClick(() => renderHome());
    } else {
      // Browser fallback notice
      setTimeout(() => toast('Aperçu hors Telegram — certaines intégrations sont simulées'), 350);
    }
  }

  function onSearch(e) {
    const q = (e.target.value || '').toLowerCase();
    document.querySelectorAll('.card').forEach(c => {
      const text = (c.dataset.search || '').toLowerCase();
      c.style.display = text.includes(q) ? '' : 'none';
    });
  }

  function card(item) {
    const c = el('div', {
      class: 'card',
      dataset: { id: item.id, search: `${item.title} ${item.subtitle}` },
      onclick: (ev) => {
        ripple(ev);
        selectCard(c);
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
      }
    }, [
      el('div', { class: 'pill' }, [ document.createTextNode(item.badge || 'Section') ]),
      el('div', { class: 'icon' }, [ document.createTextNode(item.emoji) ]),
      el('h3', {}, [ document.createTextNode(item.title) ]),
      el('p', {}, [ document.createTextNode(item.subtitle) ])
    ]);
    return c;
  }

  function selectCard(card) {
    document.querySelectorAll('.card').forEach(c => c.dataset.selected = 'false');
    card.dataset.selected = 'true';
    if (tg) tg.MainButton.show().enable();
  }

  function renderHome() {
    // Return to home state from a subview
    const grid = document.getElementById('grid');
    if (!grid) return;
    grid.innerHTML = '';
    MENU.forEach(item => grid.appendChild(card(item)));
    if (tg) { tg.BackButton.hide(); tg.MainButton.setParams({ text: 'Continuer' }); }
  }

  function renderSection(id) {
    const s = MENU.find(x => x.id === id) || { title: 'Section', emoji: '✨' };
    const grid = document.getElementById('grid');
    if (!grid) return;
    grid.innerHTML = '';

    grid.appendChild(el('div', { class: 'card', onclick: () => pushAction({type:'action', id, action:'primary'}) }, [
      el('div', { class: 'icon' }, [ document.createTextNode('🚀') ]),
      el('h3', {}, [ document.createTextNode(`${s.title} — Action principale`) ]),
      el('p', {}, [ document.createTextNode('Lancer l’action par défaut de cette section') ])
    ]));

    grid.appendChild(el('div', { class: 'card', onclick: () => pushAction({type:'action', id, action:'browse'}) }, [
      el('div', { class: 'icon' }, [ document.createTextNode('🔎') ]),
      el('h3', {}, [ document.createTextNode('Parcourir') ]),
      el('p', {}, [ document.createTextNode('Filtrer, trier, explorer les éléments') ])
    ]));

    grid.appendChild(el('div', { class: 'card', onclick: () => pushAction({type:'action', id, action:'create'}) }, [
      el('div', { class: 'icon' }, [ document.createTextNode('➕') ]),
      el('h3', {}, [ document.createTextNode('Créer un élément') ]),
      el('p', {}, [ document.createTextNode('Ajouter rapidement un nouvel élément') ])
    ]));

    if (tg) {
      tg.BackButton.show();
      tg.MainButton.setParams({ text: `Ouvrir ${s.title}` }).show().enable();
    }
  }

  // Push an action to the bot or simulate in browser
  function pushAction(payload) {
    if (tg && typeof tg.sendData === 'function') {
      tg.sendData(JSON.stringify(payload));
    } else {
      toast(`Payload envoyé: ${JSON.stringify(payload)}`);
    }
    // If opening section, render subsection locally too for UX
    if (payload.type === 'open_section') {
      renderSection(payload.id);
    }
  }

  // Entry
  window.addEventListener('DOMContentLoaded', () => {
    build();
  });

})();

