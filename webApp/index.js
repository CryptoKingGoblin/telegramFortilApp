/*
  Telegram Mini App — Astronomie
  Fichier: index.js (tout-en-un)
  Thème: Nuit étoilée, élégant, orienté observation
  Fonctionnalités:
   - Menu principal (Calendrier, Événements, Constellations, Observations, Paramètres)
   - Calendrier des événements (données démo) avec mise en évidence des jours
   - Liste des événements à venir + filtres simples
   - Section "Culture Constellations" avec fiches détaillées
   - Intégrations Telegram: MainButton, BackButton, HapticFeedback, theme change, sendData
*/

(() => {
  'use strict';

  const tg = window.Telegram ? window.Telegram.WebApp : null;

  // ——————————————————————————————————————————————————————
  // DÉMO — Données embarquées (prototypes, dates indicatives)
  // ——————————————————————————————————————————————————————
  const EVENTS = [
    { id:'e1', date:'2025-09-22', title:"Équinoxe d'automne", type:'Saison', visibility:'Global', description:"Le jour et la nuit ont une durée quasi égale sur Terre. Moment idéal pour équilibrer vos routines d’observation.", demo:true },
    { id:'e2', date:'2025-10-22', title:'Maximum des Orionides', type:'Pluie d’étoiles', visibility:'Hémisphère Nord', description:"Pluie issue de la comète Halley. Idéal après minuit, loin des lumières urbaines.", peak:true, demo:true },
    { id:'e3', date:'2025-11-05', title:'Taurides — Pic attendu', type:'Pluie d’étoiles', visibility:'Global', description:"Pluie lente avec bolides occasionnels. Observation confortable au début de nuit.", demo:true },
    { id:'e4', date:'2025-12-04', title:'Conjonction Vénus–Jupiter', type:'Conjonction', visibility:'Hémisphère Nord', description:"Alignement apparent spectaculaire à l’aube. Jumelles recommandées.", demo:true },
    { id:'e5', date:'2025-12-14', title:'Géminides — Maximum', type:'Pluie d’étoiles', visibility:'Global', description:"L’une des meilleures pluies de l’année. Jusqu’à 100 météores/heure dans de bonnes conditions.", peak:true, demo:true },
    { id:'e6', date:'2026-01-04', title:'Quadrantides — Maximum', type:'Pluie d’étoiles', visibility:'Hémisphère Nord', description:"Fenêtre courte mais intense avant l’aube.", demo:true },
    { id:'e7', date:'2025-09-07', date_to:'2025-09-10', title:'Opposition de Neptune (fenêtre)', type:'Opposition', visibility:'Global', description:"Neptune au plus près de la Terre. Observation au télescope.", demo:true },
    { id:'e8', date:'2025-11-18', title:'Conjonction Lune–Mars', type:'Conjonction', visibility:'Global', description:"La Lune voisine Mars en début de matinée. Joli duo au-dessus de l’horizon.", demo:true }
  ];

  const CONSTELLATIONS = [
    { id:'c_orion', name:'Orion', latin:'Orion', hemisphere:'Nord', best_months:['Déc','Jan','Fév'], brightest:'Rigel (β Ori)', story:"Chasseur légendaire de la mythologie grecque. Facile à repérer grâce à sa ceinture (Alnitak, Alnilam, Mintaka)." },
    { id:'c_cassiopeia', name:'Cassiopée', latin:'Cassiopeia', hemisphere:'Nord', best_months:['Sep','Oct','Nov'], brightest:'Schedar (α Cas)', story:"La reine vaniteuse, forme un W caractéristique opposé à la Grande Ourse." },
    { id:'c_ursa_major', name:'Grande Ourse', latin:'Ursa Major', hemisphere:'Nord', best_months:['Mar','Avr','Mai'], brightest:'Alioth (ε UMa)', story:"Inclut l’astérisme de la Grande Casserole, boussole pour trouver l’étoile polaire." },
    { id:'c_scorpius', name:'Scorpion', latin:'Scorpius', hemisphere:'Sud', best_months:['Juin','Juil','Août'], brightest:'Antares (α Sco)', story:"Le scorpion qui terrassa Orion. Magnifique région riche en nébuleuses." },
    { id:'c_cygnus', name:'Cygne', latin:'Cygnus', hemisphere:'Nord', best_months:['Juil','Août','Sep'], brightest:'Deneb (α Cyg)', story:"La Croix du Nord, traversée par la Voie lactée. Contient le Triangle d’été avec Véga et Altaïr." },
    { id:'c_lyra', name:'Lyre', latin:'Lyra', hemisphere:'Nord', best_months:['Juin','Juil','Août'], brightest:'Véga (α Lyr)', story:"La lyre d’Orphée. Héberge la nébuleuse de l’Anneau (M57)." },
    { id:'c_taurus', name:'Taureau', latin:'Taurus', hemisphere:'Nord', best_months:['Nov','Déc','Jan'], brightest:'Aldébaran (α Tau)', story:"Inclut les amas des Hyades et des Pléiades (M45)." },
    { id:'c_sagittarius', name:'Sagittaire', latin:'Sagittarius', hemisphere:'Sud', best_months:['Juin','Juil','Août'], brightest:'Kaus Australis (ε Sgr)', story:"Le Centaure archer pointant vers le centre galactique." },
    { id:'c_andromeda', name:'Andromède', latin:'Andromeda', hemisphere:'Nord', best_months:['Sep','Oct','Nov'], brightest:'Alpheratz (α And)', story:"Abrite M31, la galaxie d’Andromède, visible à l’œil nu sous bon ciel." }
  ];

  const MENU = [
    { id:'calendar', emoji:'📅', title:'Calendrier', subtitle:'Mois à venir' },
    { id:'events', emoji:'🌠', title:'Événements', subtitle:'Liste & filtres' },
    { id:'constellations', emoji:'✨', title:'Constellations', subtitle:'Culture & fiches' },
    { id:'observing', emoji:'🔭', title:'Observations', subtitle:'Conseils & checklists' },
    { id:'settings', emoji:'⚙️', title:'Paramètres', subtitle:'Thème & préférences' },
  ];

  // ——————————————————————————————————————————————————————
  // UTILITAIRES
  // ——————————————————————————————————————————————————————
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function cssVar(key, fallback) { return (tg && tg.themeParams && tg.themeParams[key]) || fallback; }

  function theme() {
    return {
      bg: cssVar('bg_color', '#070a13'),
      text: cssVar('text_color', '#e6edf3'),
      hint: cssVar('hint_color', '#9fb3c8'),
      link: cssVar('link_color', '#8ab4ff'),
      btn: cssVar('button_color', '#3b82f6'),
      btnText: cssVar('button_text_color', '#ffffff'),
      surface: cssVar('secondary_bg_color', '#0c111b'),
      accent: cssVar('accent_text_color', '#a5b4fc'),
    };
  }

  function fmtDate(iso) {
    try { return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('fr-FR', { weekday:'short', day:'2-digit', month:'short', year:'numeric' }); }
    catch { return iso; }
  }

  function todayISO() {
    const d = new Date();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function sortByDateAsc(a,b) { return new Date(a.date) - new Date(b.date); }

  function daysInMonth(y, m /* 0-11 */) { return new Date(y, m+1, 0).getDate(); }

  function sameDay(a,b){ const da=new Date(a), db=new Date(b); return da.getFullYear()===db.getFullYear() && da.getMonth()===db.getMonth() && da.getDate()===db.getDate(); }

  function clamp(n,min,max){ return Math.min(Math.max(n,min),max); }

  // ——————————————————————————————————————————————————————
  // STYLES
  // ——————————————————————————————————————————————————————
  function injectStyles(){
    const t = theme();
    const style = document.createElement('style');
    style.id = 'astro-styles';
    style.textContent = `
      :root{
        --bg: ${t.bg};
        --fg: ${t.text};
        --muted: ${t.hint};
        --link: ${t.link};
        --primary: ${t.btn};
        --on-primary: ${t.btnText};
        --surface: ${t.surface};
        --accent: ${t.accent};
        --radius: 18px;
        --shadow: 0 12px 40px rgba(0,0,0,.35);
      }
      *{box-sizing:border-box}
      html,body{height:100%}
      body{margin:0; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial; color:var(--fg); background:var(--bg); overflow-x:hidden;}

      /* Fond cosmique */
      .space{position:fixed; inset:0; pointer-events:none; z-index:-1; background:
        radial-gradient(1200px 800px at 80% -10%, rgba(99,102,241,.15), transparent 60%),
        radial-gradient(900px 600px at -10% 110%, rgba(59,130,246,.18), transparent 60%),
        linear-gradient(180deg, rgba(2,6,23,.0), rgba(2,6,23,.8) 40%, rgba(2,6,23,1) 70%);
      }
      .stars{position:absolute; inset:0; overflow:hidden}
      .stars span{position:absolute; display:block; width:2px; height:2px; background:rgba(255,255,255,.9); border-radius:50%; opacity:.85; animation:twinkle 3s infinite ease-in-out;}
      @keyframes twinkle{ 0%,100%{opacity:.2; transform:scale(.9)} 50%{opacity:1; transform:scale(1.15)} }

      .container{min-height:100%; padding:18px 16px 90px; max-width:920px; margin:0 auto;}
      header{display:flex; align-items:center; gap:12px; margin:6px 2px 18px;}
      .logo{width:44px;height:44px;border-radius:50%; display:grid; place-items:center; background:linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.02)); box-shadow:var(--shadow)}
      .logo span{font-size:20px}
      .title{font-size:22px; font-weight:800; letter-spacing:.2px}
      .subtitle{color:var(--muted); font-size:14px}

      .banner{position:relative; padding:14px 16px; border-radius:16px; margin:10px 2px 18px; background:
        linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
        border:1px solid rgba(255,255,255,.08); box-shadow:var(--shadow)}
      .banner b{color:var(--accent)}

      .searchbar{display:flex; gap:10px; margin:10px 2px 22px}
      .searchbar input{flex:1; padding:12px 14px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04);
                       border-radius:14px; outline:0; color:var(--fg)}
      .searchbar button{padding:12px 14px; border-radius:14px; border:0; background:var(--primary); color:var(--on-primary);
                        font-weight:700; box-shadow:var(--shadow); cursor:pointer}

      .grid{display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px}
      @media(min-width:620px){ .grid{grid-template-columns:repeat(3, minmax(0,1fr));} }

      .card{position:relative; overflow:hidden; border-radius:var(--radius); padding:16px; cursor:pointer;
            background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
            border:1px solid rgba(255,255,255,.10); box-shadow:var(--shadow); transform:translateZ(0)}
      .card::after{content:""; position:absolute; inset:auto -30% -30% auto; width:130px; height:130px;
                   background:radial-gradient(circle at center, rgba(165,180,252,.35), transparent 60%);
                   filter:blur(10px); transform:rotate(25deg)}
      .card:hover{transform:translateY(-2px)}
      .card:active{transform:translateY(0) scale(.99)}
      .card .icon{font-size:28px}
      .card h3{margin:10px 0 4px; font-size:16px}
      .card p{margin:0; font-size:13px; color:var(--muted)}

      .section{margin-top:26px}
      .section h4{margin:0 2px 10px; font-size:13px; color:var(--muted); text-transform:uppercase; letter-spacing:.12em}

      .pill{position:absolute; top:10px; right:10px; font-size:11px; padding:6px 8px; border-radius:999px;
            background:rgba(165,180,252,.16); border:1px solid rgba(165,180,252,.35); color:var(--accent);}

      .toast{position:fixed; left:50%; bottom:18px; transform:translateX(-50%);
             background:rgba(7,10,19,.96); border:1px solid rgba(255,255,255,.10); color:#fff;
             padding:12px 14px; border-radius:12px; box-shadow:var(--shadow); opacity:0; pointer-events:none;
             transition:opacity .28s ease}
      .toast.show{opacity:1}

      .hidden{display:none}
      .fade-in{animation:fade .35s ease both}
      @keyframes fade{from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:none}}

      .ripple{position:absolute; border-radius:50%; transform:scale(0); animation:ripple .6s linear; background:rgba(255,255,255,.35)}
      @keyframes ripple{to{transform:scale(14); opacity:0}}

      /* Calendrier */
      .month{background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.08);
             border-radius:16px; padding:12px; margin-bottom:14px}
      .month h5{margin:0 0 8px; font-size:14px; color:var(--accent)}
      .cal{display:grid; grid-template-columns:repeat(7, 1fr); gap:6px}
      .dow{font-size:11px; color:var(--muted); text-align:center; padding-bottom:4px}
      .day{position:relative; padding:10px 0; text-align:center; border-radius:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06)}
      .day.muted{opacity:.45}
      .day.today{outline:2px solid rgba(99,102,241,.65)}
      .dot{position:absolute; left:50%; bottom:6px; transform:translateX(-50%); width:6px; height:6px; border-radius:50%; background:#a5b4fc}

      /* Événements list */
      .event{display:flex; gap:12px; padding:12px; border-radius:14px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); margin-bottom:10px}
      .event .when{min-width:92px; text-align:center}
      .event .when .d{font-size:18px; font-weight:800}
      .event .when .m{font-size:11px; color:var(--muted)}
      .event .meta h3{margin:0 0 4px; font-size:15px}
      .tag{font-size:11px; padding:4px 8px; border-radius:999px; background:rgba(99,102,241,.15); border:1px solid rgba(99,102,241,.35); color:#c7d2fe; display:inline-block; margin-right:6px}

      /* Fiches constellations */
      .const-card{position:relative; overflow:hidden; border-radius:16px; padding:14px; margin-bottom:12px; border:1px solid rgba(255,255,255,.08); background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))}
      .const-name{font-weight:800}
      .mini-sky{height:120px; border-radius:12px; margin-top:8px; position:relative; background:radial-gradient(600px 300px at 80% -20%, rgba(99,102,241,.15), transparent), rgba(255,255,255,.03)}
      .mini-sky .star{position:absolute; width:3px; height:3px; border-radius:50%; background:#fff}
      .mini-sky .link{position:absolute; height:2px; background:rgba(255,255,255,.35); transform-origin:left center}

      /* Observations */
      .check{display:flex; gap:10px; align-items:flex-start; padding:10px; border:1px solid rgba(255,255,255,.08); border-radius:12px; margin-bottom:10px}
    `;
    document.head.appendChild(style);
  }

  // ——————————————————————————————————————————————————————
  // STARFIELD décoratif
  // ——————————————————————————————————————————————————————
  function mountSpace(){
    const wrap = document.createElement('div');
    wrap.className = 'space';
    const stars = document.createElement('div');
    stars.className = 'stars';
    const N = 120;
    for (let i=0;i<N;i++){
      const s = document.createElement('span');
      s.style.left = Math.random()*100 + '%';
      s.style.top = Math.random()*100 + '%';
      s.style.animationDelay = (Math.random()*3).toFixed(2)+'s';
      s.style.opacity = (0.3 + Math.random()*0.7).toFixed(2);
      stars.appendChild(s);
    }
    wrap.appendChild(stars);
    document.body.appendChild(wrap);
  }

  // ——————————————————————————————————————————————————————
  // UI helpers
  // ——————————————————————————————————————————————————————
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

  function toast(message, ms = 1500) {
    let t = document.querySelector('.toast');
    if (!t) { t = el('div', { class: 'toast' }); document.body.appendChild(t); }
    t.textContent = message; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), ms);
  }

  // ——————————————————————————————————————————————————————
  // CONSTRUCTION PRINCIPALE
  // ——————————————————————————————————————————————————————
  function build(){
    document.body.innerHTML = '';
    injectStyles();
    mountSpace();

    const name = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? tg.initDataUnsafe.user.first_name : 'astronome';

    const root = el('div', { class:'container fade-in' }, [
      el('header', {}, [
        el('div', { class:'logo' }, [ el('span', {}, [ document.createTextNode('🌌') ]) ]),
        el('div', {}, [
          el('div', { class:'title' }, [ document.createTextNode('AstroMini — Observatoire') ]),
          el('div', { class:'subtitle' }, [ document.createTextNode(`Bienvenue, ${name} !`) ])
        ])
      ]),

      el('div', { class:'banner' }, [
        el('div', { }, [
          el('div', { }, [ document.createTextNode('Données démo: les dates et contenus sont fournis à titre d’exemple pour ce prototype.') ]),
          el('div', { class:'subtitle' }, [ document.createTextNode('Conseil: éloignez-vous des lumières, laissez vos yeux s’adapter ~20 min.') ])
        ])
      ]),

      el('div', { class:'searchbar' }, [
        el('input', { type:'search', placeholder:'Rechercher (événement, constellation, type)…', oninput: onGlobalSearch }),
        el('button', { onclick: () => toast('Recherche globale à venir') }, [ document.createTextNode('Rechercher') ])
      ]),

      el('section', { class:'section' }, [
        el('h4', {}, [ document.createTextNode('Navigation') ]),
        el('div', { class:'grid', id:'grid' }, MENU.map(item => menuCard(item)))
      ]),

      el('section', { class:'section' }, [
        el('h4', {}, [ document.createTextNode('À venir (aperçu rapide)') ]),
        el('div', { id:'upcomingPreview' }, upcomingPreview(4))
      ])
    ]);

    document.body.appendChild(root);

    if (tg) {
      try { tg.expand(); tg.setHeaderColor('secondary_bg_color'); tg.setBackgroundColor('bg_color'); } catch {}
      tg.onEvent('themeChanged', () => { const old = document.getElementById('astro-styles'); if (old) old.remove(); injectStyles(); });

      tg.MainButton.setParams({ text:'Ouvrir', color: theme().btn, text_color: theme().btnText, is_active:false });
      tg.MainButton.onClick(() => {
        const selected = document.querySelector('.card[data-selected="true"]');
        if (!selected) return;
        const id = selected.dataset.id;
        openSection(id);
        sendData({ type:'open_section', id });
      });

      tg.BackButton.hide();
      tg.BackButton.onClick(() => { renderHome(); });
    } else {
      setTimeout(() => toast('Aperçu hors Telegram — intégrations simulées'), 350);
    }
  }

  function onGlobalSearch(e){
    const q = (e.target.value||'').toLowerCase().trim();
    $$('#grid .card').forEach(c => { const t = (c.dataset.search||'').toLowerCase(); c.style.display = t.includes(q)? '' : 'none'; });
    // Bonus: filtre l’aperçu des événements
    const box = $('#upcomingPreview');
    if (box){ box.innerHTML = ''; (upcomingPreview(6, q)||[]).forEach(n => box.appendChild(n)); }
  }

  function menuCard(item){
    const c = el('div', {
      class:'card',
      dataset:{ id:item.id, search:`${item.title} ${item.subtitle}` },
      onclick:(ev)=>{ ripple(ev); selectCard(c); if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); }
    }, [
      el('div', { class:'pill' }, [ document.createTextNode('Section') ]),
      el('div', { class:'icon' }, [ document.createTextNode(item.emoji) ]),
      el('h3', {}, [ document.createTextNode(item.title) ]),
      el('p', {}, [ document.createTextNode(item.subtitle) ])
    ]);
    return c;
  }

  function selectCard(card){
    $$('#grid .card').forEach(c => c.dataset.selected = 'false');
    card.dataset.selected = 'true';
    if (tg) tg.MainButton.show().enable();
  }

  function renderHome(){
    const grid = $('#grid'); if (!grid) return;
    grid.innerHTML = ''; MENU.forEach(item => grid.appendChild(menuCard(item)));
    if (tg){ tg.BackButton.hide(); tg.MainButton.setParams({ text:'Ouvrir' }); }
    const prev = $('#upcomingPreview'); if (prev){ prev.innerHTML=''; upcomingPreview(4).forEach(n => prev.appendChild(n)); }
  }

  // ——————————————————————————————————————————————————————
  // SECTIONS
  // ——————————————————————————————————————————————————————
  function openSection(id){
    if (id==='calendar') renderCalendar();
    else if (id==='events') renderEvents();
    else if (id==='constellations') renderConstellations();
    else if (id==='observing') renderObserving();
    else if (id==='settings') renderSettings();
  }

  // — Calendrier
  function renderCalendar(){
    const grid = $('#grid'); if (!grid) return; grid.innerHTML='';
    sectionHeader('Calendrier astral', '📅', 'Survolez les prochains mois — les jours marqués contiennent des événements.');

    const wrap = el('div', {});
    const base = new Date();
    for (let m=0; m<3; m++){
      const d = new Date(base.getFullYear(), base.getMonth()+m, 1);
      wrap.appendChild(monthView(d));
    }
    grid.appendChild(wrap);

    if (tg){ tg.BackButton.show(); tg.MainButton.hide(); }
  }

  function monthView(firstDay){
    const y = firstDay.getFullYear(); const m = firstDay.getMonth();
    const monthNames = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
    const dowNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

    const box = el('div', { class:'month' });
    box.appendChild(el('h5', {}, [ document.createTextNode(`${monthNames[m]} ${y}`) ]));

    const cal = el('div', { class:'cal' });
    // DOW header
    dowNames.forEach(d => cal.appendChild(el('div', { class:'dow' }, [ document.createTextNode(d) ])));

    // Compute leading blanks (Mon=0)
    const first = new Date(y,m,1); let lead = (first.getDay()+6)%7; // JS Sun=0 -> Mon=0
    const days = daysInMonth(y,m);

    // days grid (6 rows x 7 cols max)
    for (let i=0;i<lead;i++) cal.appendChild(el('div', { class:'day muted' }, [ document.createTextNode('') ]));
    for (let d=1; d<=days; d++){
      const iso = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const hasEvent = EVENTS.some(ev => sameDay(ev.date, iso));
      const day = el('div', { class:`day ${iso===todayISO()?'today':''}`, dataset:{ iso }, onclick:(ev)=>{ ripple(ev); openDay(iso); }}, [ document.createTextNode(String(d)) ]);
      if (hasEvent) day.appendChild(el('span', { class:'dot' }));
      cal.appendChild(day);
    }
    // trailing cells to complete grid (optional)

    box.appendChild(cal);
    return box;
  }

  function openDay(iso){
    const grid = $('#grid'); if (!grid) return; grid.innerHTML='';
    sectionHeader(`Événements du ${fmtDate(iso)}`, '🌠', 'Sélectionnez un événement pour plus de détails.');

    const list = EVENTS.filter(e => sameDay(e.date, iso)).sort(sortByDateAsc);
    if (!list.length){ grid.appendChild(el('div', { class:'subtitle' }, [ document.createTextNode('Aucun événement ce jour.') ])); return; }
    list.forEach(e => grid.appendChild(eventCard(e)));

    if (tg){ tg.BackButton.show(); tg.MainButton.hide(); }
  }

  // — Événements
  function renderEvents(){
    const grid = $('#grid'); if (!grid) return; grid.innerHTML='';
    sectionHeader('Événements à venir', '🌠', 'Filtrez par type ou visibilité. Données démo.');

    const controls = el('div', { class:'searchbar' }, [
      el('input', { type:'search', id:'eventSearch', placeholder:'Filtrer par mot-clé / type / visibilité…', oninput: filterEvents }),
      el('button', { onclick: ()=> toast('Alerte à venir') }, [ document.createTextNode('Alerte') ])
    ]);
    grid.appendChild(controls);

    const wrap = el('div', { id:'eventList' }); grid.appendChild(wrap);
    updateEventList();
    if (tg){ tg.BackButton.show(); tg.MainButton.hide(); }
  }

  function filterEvents(){ updateEventList(); }

  function updateEventList(){
    const q = ( $('#eventSearch')?.value || '' ).toLowerCase();
    const wrap = $('#eventList'); if (!wrap) return; wrap.innerHTML = '';
    const now = new Date(todayISO());
    EVENTS.filter(e => new Date(e.date) >= now)
      .filter(e => !q || `${e.title} ${e.type} ${e.visibility}`.toLowerCase().includes(q))
      .sort(sortByDateAsc)
      .forEach(e => wrap.appendChild(eventCard(e)));
  }

  function eventCard(e){
    const d = new Date(e.date);
    const mnames = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    const when = el('div', { class:'when' }, [
      el('div', { class:'d' }, [ document.createTextNode(String(d.getDate()).padStart(2,'0')) ]),
      el('div', { class:'m' }, [ document.createTextNode(`${mnames[d.getMonth()]} ${d.getFullYear()}`) ])
    ]);

    const tags = el('div', {}, [
      el('span', { class:'tag' }, [ document.createTextNode(e.type) ]),
      el('span', { class:'tag' }, [ document.createTextNode(e.visibility) ]),
      e.peak ? el('span', { class:'tag' }, [ document.createTextNode('Maximum') ]) : ''
    ].filter(Boolean));

    const card = el('div', {
      class:'event',
      onclick:(ev)=>{ ripple(ev); openEvent(e); sendData({ type:'open_event', id:e.id }); if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium'); }
    }, [ when, el('div', { class:'meta' }, [ el('h3', {}, [ document.createTextNode(e.title) ]), tags, el('div', { class:'subtitle' }, [ document.createTextNode(e.description) ]) ]) ]);

    return card;
  }

  function openEvent(e){
    const grid = $('#grid'); if (!grid) return; grid.innerHTML='';
    sectionHeader(e.title, '🌠', fmtDate(e.date));

    const box = el('div', { class:'card' }, [
      el('div', { class:'icon' }, [ document.createTextNode('🗓️') ]),
      el('h3', {}, [ document.createTextNode(`${fmtDate(e.date)} — ${e.type}`) ]),
      el('p', {}, [ document.createTextNode(e.description) ]),
      el('p', { class:'subtitle' }, [ document.createTextNode(`Visibilité: ${e.visibility}`) ]),
      e.demo ? el('p', { class:'subtitle' }, [ document.createTextNode('Note: données de démonstration.') ]) : ''
    ]);
    grid.appendChild(box);

    if (tg){ tg.BackButton.show(); tg.MainButton.setParams({ text:'Ajouter rappel' }).show().enable(); tg.MainButton.onClick(() => sendData({ type:'set_reminder', id:e.id })); }
  }

  // — Constellations
  function renderConstellations(){
    const grid = $('#grid'); if (!grid) return; grid.innerHTML='';
    sectionHeader('Culture constellations', '✨', 'Parcourez et ouvrez une fiche détaillée.');

    const controls = el('div', { class:'searchbar' }, [
      el('input', { type:'search', id:'constSearch', placeholder:'Nom, latin, hémisphère…', oninput:updateConstList }),
      el('button', { onclick: ()=> toast('Mode carte à venir') }, [ document.createTextNode('Carte') ])
    ]);
    grid.appendChild(controls);

    const list = el('div', { id:'constList' }); grid.appendChild(list);
    updateConstList();

    if (tg){ tg.BackButton.show(); tg.MainButton.hide(); }
  }

  function updateConstList(){
    const q = ($('#constSearch')?.value||'').toLowerCase();
    const list = $('#constList'); if (!list) return; list.innerHTML='';
    CONSTELLATIONS.filter(c => !q || `${c.name} ${c.latin} ${c.hemisphere}`.toLowerCase().includes(q))
      .forEach(c => list.appendChild(constellationCard(c)));
  }

  function constellationCard(c){
    const card = el('div', { class:'const-card', onclick:(ev)=>{ ripple(ev); openConstellation(c); sendData({ type:'open_constellation', id:c.id }); if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); } }, [
      el('div', {}, [ el('span', { class:'const-name' }, [ document.createTextNode(c.name) ]), document.createTextNode(` — ${c.latin}`) ]),
      el('div', { class:'subtitle' }, [ document.createTextNode(`${c.hemisphere} • Meilleurs mois: ${c.best_months.join(', ')}`) ]),
      miniSky(c)
    ]);
    return card;
  }

  function miniSky(c){
    // Petit motif d’étoiles reliées pour le style
    const box = el('div', { class:'mini-sky' });
    const pts = randConstellationPoints(6 + Math.floor(Math.random()*4));
    // stars
    pts.forEach(p => box.appendChild(el('span', { class:'star', style:`left:${p.x}%; top:${p.y}%;` })));
    // links
    for (let i=0; i<pts.length-1; i++){
      const a = pts[i], b = pts[i+1];
      const dx = b.x - a.x, dy = b.y - a.y; const len = Math.sqrt(dx*dx + dy*dy);
      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      const link = el('span', { class:'link', style:`left:${a.x}%; top:${a.y}%; width:${len}%; transform:rotate(${ang}deg);` });
      box.appendChild(link);
    }
    return box;
  }

  function randConstellationPoints(n){
    const pts = []; let x=10+Math.random()*20, y=20+Math.random()*20;
    pts.push({x,y});
    for (let i=1;i<n;i++){ x = clamp(x + (Math.random()*30 - 10), 5, 95); y = clamp(y + (Math.random()*26 - 10), 5, 90); pts.push({x,y}); }
    return pts;
  }

  function openConstellation(c){
    const grid = $('#grid'); if (!grid) return; grid.innerHTML='';
    sectionHeader(c.name, '✨', `${c.latin} • Hémisphère ${c.hemisphere}`);

    const details = el('div', { class:'card' }, [
      el('div', { class:'icon' }, [ document.createTextNode('📚') ]),
      el('h3', {}, [ document.createTextNode('Fiche de culture') ]),
      el('p', {}, [ document.createTextNode(c.story) ]),
      el('p', { class:'subtitle' }, [ document.createTextNode(`Étoile la plus brillante: ${c.brightest}`) ]),
      el('p', { class:'subtitle' }, [ document.createTextNode(`Période idéale: ${c.best_months.join(', ')}`) ])
    ]);
    grid.appendChild(details);

    const sky = miniSky(c); sky.style.height = '180px'; sky.style.marginTop='10px';
    grid.appendChild(sky);

    if (tg){ tg.BackButton.show(); tg.MainButton.setParams({ text:'Ajouter aux favoris' }).show().enable(); tg.MainButton.onClick(() => sendData({ type:'fav_constellation', id:c.id })); }
  }

  // — Observations
  function renderObserving(){
    const grid = $('#grid'); if (!grid) return; grid.innerHTML='';
    sectionHeader('Préparer une observation', '🔭', 'Une check-list rapide pour optimiser votre session.');

    const list = [
      'Météo claire (nuages, humidité, vent)',
      'Carte du ciel / application prête',
      'Loin de la pollution lumineuse',
      'Adaptation visuelle (20–30 min sans lumière blanche)',
      'Lampe rouge, batteries chargées',
      'Vêtements chauds, thermos',
      'Trépied / monture réglée, collimation si nécessaire',
      'Liste d’objets à observer (3–5 cibles)'
    ];

    list.forEach(txt => grid.appendChild(el('div', { class:'check' }, [
      el('input', { type:'checkbox', onchange:(e)=> e.target.checked ? toast('Fait ✅') : null }),
      el('div', {}, [ document.createTextNode(txt) ])
    ])));

    if (tg){ tg.BackButton.show(); tg.MainButton.hide(); }
  }

  // — Paramètres
  function renderSettings(){
    const grid = $('#grid'); if (!grid) return; grid.innerHTML='';
    sectionHeader('Paramètres', '⚙️', 'Ajustez l’apparence et vos préférences.');

    grid.appendChild(el('div', { class:'card' }, [
      el('div', { class:'icon' }, [ document.createTextNode('🎨') ]),
      el('h3', {}, [ document.createTextNode('Thème Telegram') ]),
      el('p', {}, [ document.createTextNode('Cette mini‑app suit automatiquement le thème Telegram (clair/sombre/couleurs).') ])
    ]));

    grid.appendChild(el('div', { class:'card', onclick:()=> toast('Préférences enregistrées (démo)') }, [
      el('div', { class:'icon' }, [ document.createTextNode('🌍') ]),
      el('h3', {}, [ document.createTextNode('Hémisphère d’observation') ]),
      el('p', {}, [ document.createTextNode('Sélectionnez Nord/Sud pour des recommandations affinées (à venir).') ])
    ]));

    if (tg){ tg.BackButton.show(); tg.MainButton.hide(); }
  }

  // ——————————————————————————————————————————————————————
  // Helpers d’entête de section
  // ——————————————————————————————————————————————————————
  function sectionHeader(title, emoji, subtitle){
    const grid = $('#grid');
    grid.appendChild(el('div', { class:'card', style:'margin-bottom:14px' }, [
      el('div', { class:'icon' }, [ document.createTextNode(emoji) ]),
      el('h3', {}, [ document.createTextNode(title) ]),
      el('p', { class:'subtitle' }, [ document.createTextNode(subtitle) ])
    ]));
  }

  function upcomingPreview(n=4, filterQ=''){
    const now = new Date(todayISO());
    const items = EVENTS.filter(e => new Date(e.date) >= now)
      .filter(e => !filterQ || `${e.title} ${e.type}`.toLowerCase().includes(filterQ))
      .sort(sortByDateAsc)
      .slice(0,n)
      .map(e => eventCard(e));
    return items;
  }

  function sendData(payload){
    if (tg && typeof tg.sendData === 'function') tg.sendData(JSON.stringify(payload));
    else toast(`Payload: ${JSON.stringify(payload)}`);
  }

  // ——————————————————————————————————————————————————————
  // Entrée
  // ——————————————————————————————————————————————————————
  window.addEventListener('DOMContentLoaded', build);

})();
