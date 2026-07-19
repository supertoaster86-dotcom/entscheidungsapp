/* ============================================================
   KONFIG – hier das Passwort setzen, bevor ihr deployed!
   ============================================================ */
const APP_PASSWORD = "aendermich"; // <-- HIER ändern

/* ============================================================
   FIREBASE – für Sync zwischen euch beiden Handys.
   Config aus eurem eigenen Firebase-Projekt hier eintragen
   (siehe README.md, Abschnitt "Sync einrichten").
   Bleibt es null, läuft die App einfach nur lokal weiter.
   ============================================================ */
  const firebaseConfig = {
    apiKey: "AIzaSyCBAEZ9FVOD-98N44nNWzYIpxNeDnblI8A",
    authDomain: "entscheidungsapp.firebaseapp.com",
    projectId: "entscheidungsapp",
    storageBucket: "entscheidungsapp.firebasestorage.app",
    messagingSenderId: "1034348019158",
    appId: "1:1034348019158:web:abcbbccf6b4953d4ee7877"
  };

let syncEnabled = false;
let stateDocRef = null;
const syncStatusEl = document.getElementById('syncStatus');

function setSyncStatus(text, on) {
  if (!syncStatusEl) return;
  syncStatusEl.textContent = text;
  syncStatusEl.classList.toggle('on', !!on);
}

function initSync() {
  if (!FIREBASE_CONFIG) { setSyncStatus('nur lokal', false); return; }
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    const db = firebase.firestore();
    stateDocRef = db.collection('shared').doc('appState');
    syncEnabled = true;
    setSyncStatus('sync…', false);

    stateDocRef.onSnapshot(
      snap => {
        if (!snap.exists) { pushState(); return; }
        applyRemoteState(snap.data());
        setSyncStatus('synced', true);
      },
      err => {
        console.warn('Sync-Fehler, arbeite lokal weiter:', err);
        setSyncStatus('offline', false);
      }
    );
  } catch (e) {
    console.warn('Firebase-Init fehlgeschlagen, arbeite lokal weiter:', e);
    setSyncStatus('offline', false);
  }
}

/* Schreibt den kompletten aktuellen Stand lokal + (falls aktiv) in die Cloud */
function pushState() {
  store.set('wheelItems', wheelItems);
  store.set('filmList', filmList);
  store.set('coinNames', coinNames);
  store.set('kochplan', kochplan);
  if (syncEnabled && stateDocRef) {
    stateDocRef.set({ wheelItems, filmList, coinNames, kochplan, updatedAt: Date.now() })
      .catch(e => { console.warn('Konnte nicht syncen:', e); setSyncStatus('offline', false); });
  }
}

/* Übernimmt einen von der Cloud kommenden Stand und rendert alle Screens neu */
function applyRemoteState(data) {
  if (data.wheelItems) wheelItems = data.wheelItems;
  if (data.filmList) filmList = data.filmList;
  if (data.coinNames) coinNames = data.coinNames;
  if (data.kochplan) kochplan = data.kochplan;
  store.set('wheelItems', wheelItems);
  store.set('filmList', filmList);
  store.set('coinNames', coinNames);
  store.set('kochplan', kochplan);
  drawWheel();
  renderWheelList();
  renderFilmList();
  renderCoinNames();
  renderKochplan();
}

/* ============================================================
   Kleine Storage-Helfer (alles bleibt lokal auf dem Handy)
   ============================================================ */
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/* ============================================================
   SPERRBILDSCHIRM
   ============================================================ */
const lockScreen = document.getElementById('lockScreen');
const appEl = document.getElementById('app');
const pwInput = document.getElementById('pwInput');
const pwSubmit = document.getElementById('pwSubmit');
const pwError = document.getElementById('pwError');

function tryUnlock() {
  if (pwInput.value === APP_PASSWORD) {
    store.set('unlocked', true);
    lockScreen.classList.add('hidden');
    appEl.classList.remove('hidden');
  } else {
    pwError.classList.add('show');
    pwInput.value = '';
  }
}
pwSubmit.addEventListener('click', tryUnlock);
pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });

if (store.get('unlocked', false)) {
  lockScreen.classList.add('hidden');
  appEl.classList.remove('hidden');
}

/* ============================================================
   TAB-NAVIGATION
   ============================================================ */
const tabs = document.querySelectorAll('.tab');
const screens = document.querySelectorAll('.screen');
const screenTitle = document.getElementById('screenTitle');
const titles = { wheel: 'Glücksrad', cards: 'Filmkarten', coin: 'Münzwurf', kochplan: 'Kochplan' };

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.screen;
    tabs.forEach(t => t.classList.toggle('active', t === tab));
    screens.forEach(s => s.classList.toggle('active', s.id === `screen-${target}`));
    screenTitle.textContent = titles[target];
  });
});

/* ============================================================
   GLÜCKSRAD
   ============================================================ */
const WHEEL_COLORS = ['#E3A857', '#5B8C85', '#C97B94', '#EAE1CF', '#8C7AA9', '#D9B04F'];

let wheelItems = store.get('wheelItems', ['Döner', 'Pizza', 'Ramen', 'Sushi', 'Falafel', 'Burger']);
let wheelRotation = 0;
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

function drawWheel() {
  const n = wheelItems.length;
  const size = canvas.width;
  const r = size / 2;
  ctx.clearRect(0, 0, size, size);
  if (n === 0) return;
  const slice = (2 * Math.PI) / n;

  wheelItems.forEach((label, i) => {
    const start = i * slice;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, start, end);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();

    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#241F2B';
    ctx.font = '600 22px "Work Sans", sans-serif';
    ctx.fillText(label, r - 24, 8);
    ctx.restore();
  });
}

function renderWheelList() {
  const ul = document.getElementById('wheelList');
  const editing = ul.dataset.editing === 'true';
  ul.innerHTML = '';
  wheelItems.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'chip';
    li.innerHTML = editing
      ? `${item} <button class="chip-remove" data-i="${i}">×</button>`
      : item;
    ul.appendChild(li);
  });
  ul.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      wheelItems.splice(Number(btn.dataset.i), 1);
      pushState();
      renderWheelList();
      drawWheel();
    });
  });
}

document.getElementById('wheelEditToggle').addEventListener('click', () => {
  const ul = document.getElementById('wheelList');
  const addRow = document.getElementById('wheelAddRow');
  const editing = ul.dataset.editing === 'true';
  ul.dataset.editing = String(!editing);
  addRow.classList.toggle('hidden', editing);
  renderWheelList();
});

document.getElementById('wheelAddBtn').addEventListener('click', () => {
  const input = document.getElementById('wheelAddInput');
  const val = input.value.trim();
  if (!val) return;
  wheelItems.push(val);
  pushState();
  input.value = '';
  renderWheelList();
  drawWheel();
});

document.getElementById('spinBtn').addEventListener('click', () => {
  if (wheelItems.length < 2) return;
  const n = wheelItems.length;
  const slice = 360 / n;
  const winnerIndex = Math.floor(Math.random() * n);
  // Zeiger zeigt nach oben (12 Uhr) -> Zielsegment dorthin drehen
  const targetAngle = 270 - (winnerIndex * slice + slice / 2);
  const spins = 5 * 360;
  wheelRotation += spins + (targetAngle - (wheelRotation % 360));
  canvas.style.transform = `rotate(${wheelRotation}deg)`;

  document.getElementById('wheelResult').classList.add('hidden');
  setTimeout(() => {
    const resultEl = document.getElementById('wheelResult');
    resultEl.textContent = `→ ${wheelItems[winnerIndex]}`;
    resultEl.classList.remove('hidden');
  }, 4300);
});

drawWheel();
renderWheelList();

/* ============================================================
   FILMKARTEN
   ============================================================ */
let filmList = store.get('filmList', ['Grand Budapest Hotel', 'Parasite', 'Dune', 'Chef', 'Whiplash']);
let filmDeck = shuffle([...filmList]);
let filmIndex = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showNextFilm() {
  const card = document.getElementById('filmCard');
  card.classList.remove('flipped');
  if (filmDeck.length === 0) filmDeck = shuffle([...filmList]);
  if (filmIndex >= filmDeck.length) { filmDeck = shuffle([...filmList]); filmIndex = 0; }
  document.getElementById('filmCardBack').textContent = filmDeck[filmIndex] || '–';
  filmIndex++;
}

document.getElementById('filmCard').addEventListener('click', () => {
  document.getElementById('filmCard').classList.toggle('flipped');
});
document.getElementById('cardFlipBtn').addEventListener('click', () => {
  document.getElementById('filmCard').classList.toggle('flipped');
});
document.getElementById('cardNopeBtn').addEventListener('click', showNextFilm);

function renderFilmList() {
  const ul = document.getElementById('filmList');
  const editing = ul.dataset.editing === 'true';
  ul.innerHTML = '';
  filmList.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'chip';
    li.innerHTML = editing
      ? `${item} <button class="chip-remove" data-i="${i}">×</button>`
      : item;
    ul.appendChild(li);
  });
  ul.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      filmList.splice(Number(btn.dataset.i), 1);
      pushState();
      renderFilmList();
      filmDeck = shuffle([...filmList]);
      filmIndex = 0;
      showNextFilm();
    });
  });
}

document.getElementById('filmEditToggle').addEventListener('click', () => {
  const ul = document.getElementById('filmList');
  const addRow = document.getElementById('filmAddRow');
  const editing = ul.dataset.editing === 'true';
  ul.dataset.editing = String(!editing);
  addRow.classList.toggle('hidden', editing);
  renderFilmList();
});

document.getElementById('filmAddBtn').addEventListener('click', () => {
  const input = document.getElementById('filmAddInput');
  const val = input.value.trim();
  if (!val) return;
  filmList.push(val);
  pushState();
  input.value = '';
  renderFilmList();
});

renderFilmList();
showNextFilm();

/* ============================================================
   MÜNZE
   ============================================================ */
let coinNames = store.get('coinNames', { a: 'Name A', b: 'Name B' });
const coinInputA = document.getElementById('coinInputA');
const coinInputB = document.getElementById('coinInputB');
const coinNameA = document.getElementById('coinNameA');
const coinNameB = document.getElementById('coinNameB');
const coin = document.getElementById('coin');
let coinRotationY = 0;

function renderCoinNames() {
  coinNameA.textContent = coinNames.a || 'Name A';
  coinNameB.textContent = coinNames.b || 'Name B';
  coinInputA.value = coinNames.a === 'Name A' ? '' : coinNames.a;
  coinInputB.value = coinNames.b === 'Name B' ? '' : coinNames.b;
}
[coinInputA, coinInputB].forEach((input, idx) => {
  input.addEventListener('input', () => {
    coinNames[idx === 0 ? 'a' : 'b'] = input.value.trim() || (idx === 0 ? 'Name A' : 'Name B');
    pushState();
    renderCoinNames();
  });
});
renderCoinNames();

document.getElementById('coinFlipBtn').addEventListener('click', () => {
  const heads = Math.random() < 0.5;
  const extraSpins = 4; // volle Umdrehungen für den Schwung
  coinRotationY += extraSpins * 360 + (heads ? 0 : 180);
  coin.style.transform = `rotateY(${coinRotationY}deg)`;

  document.getElementById('coinResult').classList.add('hidden');
  setTimeout(() => {
    const resultEl = document.getElementById('coinResult');
    resultEl.textContent = `→ ${heads ? coinNames.a : coinNames.b}`;
    resultEl.classList.remove('hidden');
  }, 2500);
});

/* ============================================================
   KOCHPLAN
   ============================================================ */
let kochplan = store.get('kochplan', {
  people: ['Person 1', 'Person 2'],
  currentIndex: 0,
  history: []
});

function renderKochplan() {
  const currentEl = document.getElementById('kochCurrent');
  const lastEl = document.getElementById('kochLast');
  currentEl.textContent = kochplan.people[kochplan.currentIndex] || '–';

  const last = kochplan.history[kochplan.history.length - 1];
  lastEl.textContent = last ? `Zuletzt: ${last.person} am ${last.date}` : '';

  const ul = document.getElementById('kochList');
  ul.innerHTML = '';
  kochplan.people.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'chip';
    li.innerHTML = `${i === kochplan.currentIndex ? '👉 ' : ''}${p} <button class="chip-remove" data-i="${i}">×</button>`;
    ul.appendChild(li);
  });
  ul.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      kochplan.people.splice(i, 1);
      if (kochplan.currentIndex >= kochplan.people.length) kochplan.currentIndex = 0;
      pushState();
      renderKochplan();
    });
  });

  const histUl = document.getElementById('kochHistory');
  histUl.innerHTML = '';
  [...kochplan.history].reverse().slice(0, 8).forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${entry.person}</span><span>${entry.date}</span>`;
    histUl.appendChild(li);
  });
}

document.getElementById('kochAddBtn').addEventListener('click', () => {
  const input = document.getElementById('kochAddInput');
  const val = input.value.trim();
  if (!val) return;
  kochplan.people.push(val);
  pushState();
  input.value = '';
  renderKochplan();
});

document.getElementById('kochNextBtn').addEventListener('click', () => {
  if (kochplan.people.length === 0) return;
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  kochplan.history.push({ person: kochplan.people[kochplan.currentIndex], date: today });
  kochplan.currentIndex = (kochplan.currentIndex + 1) % kochplan.people.length;
  pushState();
  renderKochplan();
});

renderKochplan();

/* Sync starten */
initSync();
