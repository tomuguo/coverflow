const flowEl = document.getElementById('flow');
const stageEl = document.querySelector('.flow-stage');
const searchEl = document.getElementById('searchInput');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const metaTitle = document.getElementById('metaTitle');
const metaArtist = document.getElementById('metaArtist');
const metaAlbum = document.getElementById('metaAlbum');
const metaYear = document.getElementById('metaYear');
const metaIndex = document.getElementById('metaIndex');

let allItems = [];
let filteredItems = [];
let cards = [];
let selected = 0;
let wheelLock = false;
let rafId = 0;
const VISIBLE_RANGE = 7;

async function loadData() {
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allItems = await res.json();
    filteredItems = [...allItems];
    renderCards();
    scheduleVisualUpdate();
  } catch (err) {
    flowEl.innerHTML = `<div class="empty">Could not load <code>data.json</code>. Try running <code>python -m http.server</code> in this folder.</div>`;
    console.error(err);
  }
}

function clampSelected() {
  if (filteredItems.length === 0) {
    selected = 0;
  } else {
    selected = Math.max(0, Math.min(selected, filteredItems.length - 1));
  }
}

function setSelected(idx) {
  const next = Math.max(0, Math.min(idx, Math.max(0, filteredItems.length - 1)));
  if (next === selected) return;
  selected = next;
  scheduleVisualUpdate();
}

function move(delta) {
  setSelected(selected + delta);
}

function updateMeta() {
  if (!filteredItems.length) {
    metaTitle.textContent = 'No matches';
    metaArtist.textContent = '—';
    metaAlbum.textContent = '—';
    metaYear.textContent = '—';
    metaIndex.textContent = 'Try a different search.';
    return;
  }

  const item = filteredItems[selected];
  metaTitle.textContent = item.title;
  metaArtist.textContent = item.artist;
  metaAlbum.textContent = item.album;
  metaYear.textContent = String(item.year);
  metaIndex.textContent = `${selected + 1} of ${filteredItems.length}`;
}

function coverTransform(offset) {
  const abs = Math.abs(offset);
  const x = offset * 165;
  const z = abs === 0 ? 120 : -abs * 85;
  const y = abs === 0 ? -10 : abs * 5;
  const rotateY = offset === 0 ? 0 : (offset > 0 ? -58 : 58);
  const scale = abs === 0 ? 1.08 : Math.max(0.7, 1 - abs * 0.08);
  return `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
}

function buildCard(item, idx) {
  const card = document.createElement('button');
  card.className = 'cover';
  card.type = 'button';
  card.dataset.index = String(idx);
  card.style.setProperty('--cover-image', `url("${item.coverUrl}")`);
  card.ariaLabel = `${item.title} by ${item.artist}`;

  const img = document.createElement('img');
  img.src = item.coverUrl;
  img.alt = `${item.album} cover art`;
  img.draggable = false;

  card.appendChild(img);
  card.addEventListener('click', () => {
    if (selected !== idx) {
      selected = idx;
      scheduleVisualUpdate();
    }
  });

  return card;
}

function renderCards() {
  cards = [];
  flowEl.innerHTML = '';

  if (!filteredItems.length) {
    flowEl.innerHTML = '<div class="empty">No albums match your search.</div>';
    updateMeta();
    return;
  }

  const frag = document.createDocumentFragment();
  filteredItems.forEach((item, idx) => {
    const card = buildCard(item, idx);
    cards.push(card);
    frag.appendChild(card);
  });

  flowEl.appendChild(frag);
}

function updateCardsVisual() {
  cards.forEach((card, idx) => {
    const offset = idx - selected;
    const abs = Math.abs(offset);
    const visible = abs <= VISIBLE_RANGE;

    card.hidden = !visible;
    card.style.pointerEvents = visible ? 'auto' : 'none';

    if (!visible) return;

    card.dataset.pos = offset === 0 ? 'center' : (offset < 0 ? 'left' : 'right');
    card.style.transform = coverTransform(offset);
    card.style.opacity = String(Math.max(0, 1 - abs * 0.18));
    card.style.zIndex = String(100 - abs);
  });

  updateMeta();
}

function scheduleVisualUpdate() {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(updateCardsVisual);
}

searchEl.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  filteredItems = allItems.filter((item) => {
    return `${item.title} ${item.artist} ${item.album} ${item.year}`.toLowerCase().includes(q);
  });
  selected = 0;
  clampSelected();
  renderCards();
  scheduleVisualUpdate();
});

function onWheel(e) {
  e.preventDefault();
  if (wheelLock) return;
  const dominant = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (Math.abs(dominant) < 4) return;
  move(dominant > 0 ? 1 : -1);
  wheelLock = true;
  setTimeout(() => { wheelLock = false; }, 110);
}

stageEl.addEventListener('wheel', onWheel, { passive: false });

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    move(1);
  } else if (e.key === 'ArrowLeft') {
    move(-1);
  }
});

fullscreenBtn.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
});

document.addEventListener('fullscreenchange', () => {
  fullscreenBtn.textContent = document.fullscreenElement ? '🗗 Exit Fullscreen' : '⛶ Fullscreen';
});

loadData();
stageEl.focus();
