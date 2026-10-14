/* ============================================================
   CLASSICAL CRYPTOGRAPHY TOOLKIT — JavaScript
   All cipher algorithms, navigation, file handling, utilities
   ============================================================ */

// ─── Navigation ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThemeToggle();
  initFileInputs();
});

/**
 * Initialise sidebar navigation and dashboard card clicks.
 */
function initNavigation() {
  // Sidebar nav items
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      navigateTo(target);
      closeSidebar();
    });
  });

  // Dashboard cards
  document.querySelectorAll('.dash-card[data-goto]').forEach(card => {
    card.addEventListener('click', () => {
      navigateTo(card.getAttribute('data-goto'));
    });
  });

  // Hamburger / sidebar close
  document.getElementById('hamburger-btn').addEventListener('click', openSidebar);
  document.getElementById('sidebar-close-btn').addEventListener('click', closeSidebar);
}

/**
 * Navigate to a specific page by id.
 */
function navigateTo(target) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show target
  const page = document.getElementById('page-' + target);
  if (page) page.classList.add('active');

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-target="${target}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

// Close sidebar on click outside (mobile)
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger-btn');
  if (sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeSidebar();
  }
});

// ─── Theme Toggle ───────────────────────────────────────────
function initThemeToggle() {
  const saved = localStorage.getItem('crypto-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  }
  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('crypto-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  document.getElementById('theme-icon').textContent = theme === 'dark' ? '☾' : '☀';
}

// ─── Toast Notifications ────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Clipboard ──────────────────────────────────────────────
function copyOutput(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  // For input elements (like otp-key)
  const text = el.value !== undefined && el.tagName === 'INPUT' ? el.value : el.textContent;
  if (!text || text === '—') {
    showToast('Nothing to copy.', 'info');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied to clipboard!', 'success');
  });
}

// ─── Clear Helpers ──────────────────────────────────────────
function clearCipher(prefix) {
  const fields = {
    'caesar': ['caesar-plaintext', 'caesar-key', 'caesar-ciphertext', 'caesar-decrypted', 'caesar-time'],
    'mono': ['mono-plaintext', 'mono-key', 'mono-ciphertext', 'mono-decrypted', 'mono-time'],
    'playfair': ['playfair-plaintext', 'playfair-key', 'playfair-matrix', 'playfair-ciphertext', 'playfair-decrypted', 'playfair-time'],
    'hill': ['hill-plaintext', 'hill-k00', 'hill-k01', 'hill-k10', 'hill-k11', 'hill-matrix-display', 'hill-ciphertext', 'hill-decrypted', 'hill-time'],
    'vigenere': ['vigenere-plaintext', 'vigenere-key', 'vigenere-ciphertext', 'vigenere-decrypted', 'vigenere-time'],
    'otp': ['otp-plaintext', 'otp-key', 'otp-ciphertext', 'otp-decrypted', 'otp-time'],
    'railfence': ['railfence-plaintext', 'railfence-key', 'railfence-ciphertext', 'railfence-decrypted', 'railfence-time'],
    'columnar': ['columnar-plaintext', 'columnar-key', 'columnar-ciphertext', 'columnar-decrypted', 'columnar-time'],
  };
  (fields[prefix] || []).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      if (el.type === 'number') {
        // leave default
      } else {
        el.value = '';
      }
    } else {
      el.textContent = '—';
    }
  });
  showToast('Cleared!', 'info');
}

function clearAllInputs() {
  ['caesar', 'mono', 'playfair', 'hill', 'vigenere', 'otp', 'railfence', 'columnar'].forEach(p => {
    clearCipher(p);
  });
  clearComparison();
  showToast('All inputs cleared!', 'info');
}

function finishSession() {
  showModal('Finish Session', 'Clear all inputs and return to the dashboard?', () => {
    clearAllInputs();
    navigateTo('dashboard');
    showToast('Session finished. Welcome back anytime!', 'success');
  });
}

// ─── Modal ──────────────────────────────────────────────────
function showModal(title, message, onConfirm) {
  const overlay = document.getElementById('confirm-modal');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-message').textContent = message;
  overlay.style.display = 'flex';
  const confirmBtn = document.getElementById('modal-confirm-btn');
  // Replace old listener
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
  newBtn.addEventListener('click', () => {
    closeModal();
    onConfirm();
  });
}

function closeModal() {
  document.getElementById('confirm-modal').style.display = 'none';
}

// ─── Load Examples ──────────────────────────────────────────
function loadExample(cipher) {
  switch (cipher) {
    case 'caesar':
      document.getElementById('caesar-plaintext').value = 'ATTACK AT DAWN';
      document.getElementById('caesar-key').value = 3;
      break;
    case 'mono':
      document.getElementById('mono-plaintext').value = 'HELLO WORLD';
      document.getElementById('mono-key').value = 'QWERTYUIOPASDFGHJKLZXCVBNM';
      break;
    case 'playfair':
      document.getElementById('playfair-plaintext').value = 'HELLO WORLD';
      document.getElementById('playfair-key').value = 'MONARCHY';
      break;
    case 'hill':
      document.getElementById('hill-plaintext').value = 'HELP';
      document.getElementById('hill-k00').value = 6;
      document.getElementById('hill-k01').value = 24;
      document.getElementById('hill-k10').value = 1;
      document.getElementById('hill-k11').value = 13;
      break;
    case 'vigenere':
      document.getElementById('vigenere-plaintext').value = 'ATTACKATDAWN';
      document.getElementById('vigenere-key').value = 'LEMON';
      break;
    case 'otp':
      document.getElementById('otp-plaintext').value = 'HELLO';
      generateOTPKey();
      break;
    case 'railfence':
      document.getElementById('railfence-plaintext').value = 'WEAREDISCOVEREDRUNATONCE';
      document.getElementById('railfence-key').value = 3;
      break;
    case 'columnar':
      document.getElementById('columnar-plaintext').value = 'WEAREDISCOVEREDRUNATONCE';
      document.getElementById('columnar-key').value = 'ZEBRAS';
      break;
  }
  showToast('Example loaded!', 'info');
}


/* ════════════════════════════════════════════════════════════
   CIPHER IMPLEMENTATIONS
   ════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// 1. CAESAR CIPHER
// ─────────────────────────────────────────────────────────────

/**
 * Caesar cipher core function.
 * @param {string} text
 * @param {number} shift – positive for encrypt, negative for decrypt
 * @returns {string}
 */
function caesarCore(text, shift) {
  shift = ((shift % 26) + 26) % 26; // normalise
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/[A-Z]/.test(ch)) {
      result += String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65);
    } else if (/[a-z]/.test(ch)) {
      result += String.fromCharCode(((ch.charCodeAt(0) - 97 + shift) % 26) + 97);
    } else {
      result += ch; // preserve non-alpha
    }
  }
  return result;
}

function caesarEncrypt() {
  const text = document.getElementById('caesar-plaintext').value;
  const key = parseInt(document.getElementById('caesar-key').value, 10);
  if (!text) { showToast('Please enter plaintext.', 'error'); return; }
  if (isNaN(key) || key < 0 || key > 25) { showToast('Key must be 0–25.', 'error'); return; }

  const t0 = performance.now();
  const cipher = caesarCore(text, key);
  const t1 = performance.now();

  document.getElementById('caesar-ciphertext').textContent = cipher;
  document.getElementById('caesar-time').textContent = `Encryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Caesar encryption complete!', 'success');
}

function caesarDecrypt() {
  const text = document.getElementById('caesar-ciphertext').textContent;
  const key = parseInt(document.getElementById('caesar-key').value, 10);
  if (!text || text === '—') { showToast('Encrypt first or enter ciphertext.', 'error'); return; }
  if (isNaN(key) || key < 0 || key > 25) { showToast('Key must be 0–25.', 'error'); return; }

  const t0 = performance.now();
  const plain = caesarCore(text, -key);
  const t1 = performance.now();

  document.getElementById('caesar-decrypted').textContent = plain;
  const prev = document.getElementById('caesar-time').textContent;
  document.getElementById('caesar-time').textContent = prev + ` | Decryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Caesar decryption complete!', 'success');
}

// ─────────────────────────────────────────────────────────────
// 2. MONOALPHABETIC CIPHER
// ─────────────────────────────────────────────────────────────

function validateMonoKey(key) {
  if (key.length !== 26) return 'Key must be exactly 26 letters.';
  const set = new Set(key.toUpperCase());
  if (set.size !== 26) return 'Key must contain all 26 unique letters A–Z.';
  for (const c of key.toUpperCase()) {
    if (c < 'A' || c > 'Z') return 'Key must contain only letters A–Z.';
  }
  return null;
}

function monoEncryptCore(text, key) {
  const k = key.toUpperCase();
  let result = '';
  for (const ch of text) {
    if (/[A-Z]/.test(ch)) {
      result += k[ch.charCodeAt(0) - 65];
    } else if (/[a-z]/.test(ch)) {
      result += k[ch.charCodeAt(0) - 97].toLowerCase();
    } else {
      result += ch;
    }
  }
  return result;
}

function monoDecryptCore(text, key) {
  const k = key.toUpperCase();
  // Build reverse map
  const rev = {};
  for (let i = 0; i < 26; i++) {
    rev[k[i]] = String.fromCharCode(65 + i);
  }
  let result = '';
  for (const ch of text) {
    if (/[A-Z]/.test(ch)) {
      result += rev[ch] || ch;
    } else if (/[a-z]/.test(ch)) {
      result += (rev[ch.toUpperCase()] || ch.toUpperCase()).toLowerCase();
    } else {
      result += ch;
    }
  }
  return result;
}

function generateMonoKey() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  document.getElementById('mono-key').value = letters.join('');
  showToast('Random key generated!', 'success');
}

function monoEncrypt() {
  const text = document.getElementById('mono-plaintext').value;
  const key = document.getElementById('mono-key').value.toUpperCase();
  if (!text) { showToast('Please enter plaintext.', 'error'); return; }
  const err = validateMonoKey(key);
  if (err) { showToast(err, 'error'); return; }

  const t0 = performance.now();
  const cipher = monoEncryptCore(text, key);
  const t1 = performance.now();

  document.getElementById('mono-ciphertext').textContent = cipher;
  document.getElementById('mono-time').textContent = `Encryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Monoalphabetic encryption complete!', 'success');
}

function monoDecrypt() {
  const text = document.getElementById('mono-ciphertext').textContent;
  const key = document.getElementById('mono-key').value.toUpperCase();
  if (!text || text === '—') { showToast('Encrypt first.', 'error'); return; }
  const err = validateMonoKey(key);
  if (err) { showToast(err, 'error'); return; }

  const t0 = performance.now();
  const plain = monoDecryptCore(text, key);
  const t1 = performance.now();

  document.getElementById('mono-decrypted').textContent = plain;
  const prev = document.getElementById('mono-time').textContent;
  document.getElementById('mono-time').textContent = prev + ` | Decryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Monoalphabetic decryption complete!', 'success');
}

// ─────────────────────────────────────────────────────────────
// 3. PLAYFAIR CIPHER
// ─────────────────────────────────────────────────────────────

function buildPlayfairMatrix(keyword) {
  const kw = keyword.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const seen = new Set();
  const matrix = [];
  const addChar = (c) => {
    if (!seen.has(c)) { seen.add(c); matrix.push(c); }
  };
  for (const c of kw) addChar(c);
  for (let i = 0; i < 26; i++) {
    const c = String.fromCharCode(65 + i);
    if (c !== 'J') addChar(c);
  }
  return matrix; // length 25
}

function findInMatrix(matrix, ch) {
  const idx = matrix.indexOf(ch);
  return [Math.floor(idx / 5), idx % 5];
}

function preparePlayfairText(text) {
  let clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  // Split into digraphs, inserting X between duplicate pairs
  let pairs = [];
  let i = 0;
  while (i < clean.length) {
    const a = clean[i];
    let b;
    if (i + 1 >= clean.length) {
      b = 'X'; // pad odd length
      i++;
    } else if (clean[i] === clean[i + 1]) {
      b = 'X'; // insert filler
      i++;
    } else {
      b = clean[i + 1];
      i += 2;
    }
    pairs.push([a, b]);
  }
  return pairs;
}

function playfairEncryptCore(text, keyword) {
  const matrix = buildPlayfairMatrix(keyword);
  const pairs = preparePlayfairText(text);
  let result = '';
  for (const [a, b] of pairs) {
    const [r1, c1] = findInMatrix(matrix, a);
    const [r2, c2] = findInMatrix(matrix, b);
    if (r1 === r2) {
      // Same row: shift right
      result += matrix[r1 * 5 + (c1 + 1) % 5];
      result += matrix[r2 * 5 + (c2 + 1) % 5];
    } else if (c1 === c2) {
      // Same column: shift down
      result += matrix[((r1 + 1) % 5) * 5 + c1];
      result += matrix[((r2 + 1) % 5) * 5 + c2];
    } else {
      // Rectangle: swap columns
      result += matrix[r1 * 5 + c2];
      result += matrix[r2 * 5 + c1];
    }
  }
  return result;
}

function playfairDecryptCore(text, keyword) {
  const matrix = buildPlayfairMatrix(keyword);
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  let result = '';
  for (let i = 0; i < clean.length; i += 2) {
    const a = clean[i];
    const b = clean[i + 1] || 'X';
    const [r1, c1] = findInMatrix(matrix, a);
    const [r2, c2] = findInMatrix(matrix, b);
    if (r1 === r2) {
      result += matrix[r1 * 5 + (c1 + 4) % 5];
      result += matrix[r2 * 5 + (c2 + 4) % 5];
    } else if (c1 === c2) {
      result += matrix[((r1 + 4) % 5) * 5 + c1];
      result += matrix[((r2 + 4) % 5) * 5 + c2];
    } else {
      result += matrix[r1 * 5 + c2];
      result += matrix[r2 * 5 + c1];
    }
  }
  return result;
}

function displayPlayfairMatrix(keyword) {
  const matrix = buildPlayfairMatrix(keyword);
  let display = '';
  for (let r = 0; r < 5; r++) {
    display += matrix.slice(r * 5, r * 5 + 5).join('  ') + '\n';
  }
  document.getElementById('playfair-matrix').textContent = display;
}

function playfairEncrypt() {
  const text = document.getElementById('playfair-plaintext').value;
  const key = document.getElementById('playfair-key').value;
  if (!text) { showToast('Please enter plaintext.', 'error'); return; }
  if (!key || !/[A-Za-z]/.test(key)) { showToast('Please enter an alphabetic keyword.', 'error'); return; }

  displayPlayfairMatrix(key);

  const t0 = performance.now();
  const cipher = playfairEncryptCore(text, key);
  const t1 = performance.now();

  document.getElementById('playfair-ciphertext').textContent = cipher;
  document.getElementById('playfair-time').textContent = `Encryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Playfair encryption complete!', 'success');
}

function playfairDecrypt() {
  const text = document.getElementById('playfair-ciphertext').textContent;
  const key = document.getElementById('playfair-key').value;
  if (!text || text === '—') { showToast('Encrypt first.', 'error'); return; }
  if (!key || !/[A-Za-z]/.test(key)) { showToast('Please enter an alphabetic keyword.', 'error'); return; }

  displayPlayfairMatrix(key);

  const t0 = performance.now();
  const plain = playfairDecryptCore(text, key);
  const t1 = performance.now();

  document.getElementById('playfair-decrypted').textContent = plain;
  const prev = document.getElementById('playfair-time').textContent;
  document.getElementById('playfair-time').textContent = prev + ` | Decryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Playfair decryption complete!', 'success');
}

// ─────────────────────────────────────────────────────────────
// 4. HILL CIPHER
// ─────────────────────────────────────────────────────────────

/**
 * Compute modular inverse of a mod m using extended Euclidean algorithm.
 * Returns -1 if no inverse exists.
 */
function modInverse(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return -1;
}

function getHillKey() {
  return [
    parseInt(document.getElementById('hill-k00').value, 10) || 0,
    parseInt(document.getElementById('hill-k01').value, 10) || 0,
    parseInt(document.getElementById('hill-k10').value, 10) || 0,
    parseInt(document.getElementById('hill-k11').value, 10) || 0,
  ];
}

function hillValidateKey(key) {
  const [a, b, c, d] = key;
  const det = ((a * d - b * c) % 26 + 26) % 26;
  if (modInverse(det, 26) === -1) {
    return `Determinant (${det}) is not coprime with 26. Choose a key where det mod 26 is coprime with 26.`;
  }
  return null;
}

function hillEncryptCore(text, key) {
  let clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length % 2 !== 0) clean += 'X'; // pad
  const [a, b, c, d] = key;
  let result = '';
  for (let i = 0; i < clean.length; i += 2) {
    const p1 = clean.charCodeAt(i) - 65;
    const p2 = clean.charCodeAt(i + 1) - 65;
    const c1 = ((a * p1 + b * p2) % 26 + 26) % 26;
    const c2 = ((c * p1 + d * p2) % 26 + 26) % 26;
    result += String.fromCharCode(c1 + 65) + String.fromCharCode(c2 + 65);
  }
  return result;
}

function hillDecryptCore(text, key) {
  let clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length % 2 !== 0) clean += 'X';
  const [a, b, c, d] = key;
  const det = ((a * d - b * c) % 26 + 26) % 26;
  const detInv = modInverse(det, 26);
  // Inverse matrix
  const ia = (detInv * (( d) % 26 + 26)) % 26;
  const ib = (detInv * ((-b) % 26 + 26)) % 26;
  const ic = (detInv * ((-c) % 26 + 26)) % 26;
  const id = (detInv * (( a) % 26 + 26)) % 26;
  let result = '';
  for (let i = 0; i < clean.length; i += 2) {
    const p1 = clean.charCodeAt(i) - 65;
    const p2 = clean.charCodeAt(i + 1) - 65;
    const c1 = ((ia * p1 + ib * p2) % 26 + 26) % 26;
    const c2 = ((ic * p1 + id * p2) % 26 + 26) % 26;
    result += String.fromCharCode(c1 + 65) + String.fromCharCode(c2 + 65);
  }
  return result;
}

function displayHillMatrices(key) {
  const [a, b, c, d] = key;
  const det = ((a * d - b * c) % 26 + 26) % 26;
  const detInv = modInverse(det, 26);
  const ia = (detInv * (( d % 26 + 26) % 26)) % 26;
  const ib = (detInv * (((-b) % 26 + 26) % 26)) % 26;
  const ic = (detInv * (((-c) % 26 + 26) % 26)) % 26;
  const id = (detInv * (( a % 26 + 26) % 26)) % 26;

  const display =
    `Key Matrix:          Inverse Matrix:\n` +
    `┌        ┐          ┌        ┐\n` +
    `│ ${String(a).padStart(2)}  ${String(b).padStart(2)} │          │ ${String(ia).padStart(2)}  ${String(ib).padStart(2)} │\n` +
    `│ ${String(c).padStart(2)}  ${String(d).padStart(2)} │          │ ${String(ic).padStart(2)}  ${String(id).padStart(2)} │\n` +
    `└        ┘          └        ┘\n` +
    `Det = ${det}  |  Det⁻¹ mod 26 = ${detInv}`;

  document.getElementById('hill-matrix-display').textContent = display;
}

function hillEncrypt() {
  const text = document.getElementById('hill-plaintext').value;
  if (!text) { showToast('Please enter plaintext.', 'error'); return; }
  const key = getHillKey();
  const err = hillValidateKey(key);
  if (err) { showToast(err, 'error'); return; }

  displayHillMatrices(key);

  const t0 = performance.now();
  const cipher = hillEncryptCore(text, key);
  const t1 = performance.now();

  document.getElementById('hill-ciphertext').textContent = cipher;
  document.getElementById('hill-time').textContent = `Encryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Hill encryption complete!', 'success');
}

function hillDecrypt() {
  const text = document.getElementById('hill-ciphertext').textContent;
  if (!text || text === '—') { showToast('Encrypt first.', 'error'); return; }
  const key = getHillKey();
  const err = hillValidateKey(key);
  if (err) { showToast(err, 'error'); return; }

  displayHillMatrices(key);

  const t0 = performance.now();
  const plain = hillDecryptCore(text, key);
  const t1 = performance.now();

  document.getElementById('hill-decrypted').textContent = plain;
  const prev = document.getElementById('hill-time').textContent;
  document.getElementById('hill-time').textContent = prev + ` | Decryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Hill decryption complete!', 'success');
}

// ─────────────────────────────────────────────────────────────
// 5. VIGENÈRE CIPHER
// ─────────────────────────────────────────────────────────────

function vigenereCore(text, key, decrypt = false) {
  const k = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (k.length === 0) return '';
  let result = '';
  let ki = 0;
  for (const ch of text) {
    if (/[A-Z]/.test(ch)) {
      const shift = k.charCodeAt(ki % k.length) - 65;
      const dir = decrypt ? -1 : 1;
      result += String.fromCharCode(((ch.charCodeAt(0) - 65 + dir * shift + 26) % 26) + 65);
      ki++;
    } else if (/[a-z]/.test(ch)) {
      const shift = k.charCodeAt(ki % k.length) - 65;
      const dir = decrypt ? -1 : 1;
      result += String.fromCharCode(((ch.charCodeAt(0) - 97 + dir * shift + 26) % 26) + 97);
      ki++;
    } else {
      result += ch;
    }
  }
  return result;
}

function vigenereEncrypt() {
  const text = document.getElementById('vigenere-plaintext').value;
  const key = document.getElementById('vigenere-key').value;
  if (!text) { showToast('Please enter plaintext.', 'error'); return; }
  if (!key || !/^[A-Za-z]+$/.test(key)) { showToast('Key must be non-empty alphabetic.', 'error'); return; }

  const t0 = performance.now();
  const cipher = vigenereCore(text, key, false);
  const t1 = performance.now();

  document.getElementById('vigenere-ciphertext').textContent = cipher;
  document.getElementById('vigenere-time').textContent = `Encryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Vigenère encryption complete!', 'success');
}

function vigenereDecrypt() {
  const text = document.getElementById('vigenere-ciphertext').textContent;
  const key = document.getElementById('vigenere-key').value;
  if (!text || text === '—') { showToast('Encrypt first.', 'error'); return; }
  if (!key || !/^[A-Za-z]+$/.test(key)) { showToast('Key must be non-empty alphabetic.', 'error'); return; }

  const t0 = performance.now();
  const plain = vigenereCore(text, key, true);
  const t1 = performance.now();

  document.getElementById('vigenere-decrypted').textContent = plain;
  const prev = document.getElementById('vigenere-time').textContent;
  document.getElementById('vigenere-time').textContent = prev + ` | Decryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Vigenère decryption complete!', 'success');
}

// ─────────────────────────────────────────────────────────────
// 6. ONE-TIME PAD
// ─────────────────────────────────────────────────────────────

function countLetters(text) {
  return (text.match(/[A-Za-z]/g) || []).length;
}

function generateOTPKey() {
  const text = document.getElementById('otp-plaintext').value;
  const n = countLetters(text);
  if (n === 0) { showToast('Enter plaintext first (needs at least one letter).', 'error'); return; }
  let key = '';
  for (let i = 0; i < n; i++) {
    key += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  document.getElementById('otp-key').value = key;
  showToast('OTP key generated!', 'success');
}

function otpCore(text, key, decrypt = false) {
  const k = key.toUpperCase().replace(/[^A-Z]/g, '');
  let result = '';
  let ki = 0;
  for (const ch of text) {
    if (/[A-Z]/.test(ch)) {
      const shift = k.charCodeAt(ki) - 65;
      const dir = decrypt ? -1 : 1;
      result += String.fromCharCode(((ch.charCodeAt(0) - 65 + dir * shift + 26) % 26) + 65);
      ki++;
    } else if (/[a-z]/.test(ch)) {
      const shift = k.charCodeAt(ki) - 65;
      const dir = decrypt ? -1 : 1;
      result += String.fromCharCode(((ch.charCodeAt(0) - 97 + dir * shift + 26) % 26) + 97);
      ki++;
    } else {
      result += ch;
    }
  }
  return result;
}

function otpEncrypt() {
  const text = document.getElementById('otp-plaintext').value;
  const key = document.getElementById('otp-key').value;
  if (!text) { showToast('Please enter plaintext.', 'error'); return; }
  const letterCount = countLetters(text);
  const keyClean = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (keyClean.length === 0) { showToast('Please generate or enter a key.', 'error'); return; }
  if (keyClean.length !== letterCount) {
    showToast(`Key length (${keyClean.length}) must match letter count in plaintext (${letterCount}).`, 'error');
    return;
  }

  const t0 = performance.now();
  const cipher = otpCore(text, key, false);
  const t1 = performance.now();

  document.getElementById('otp-ciphertext').textContent = cipher;
  document.getElementById('otp-time').textContent = `Encryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('OTP encryption complete!', 'success');
}

function otpDecrypt() {
  const text = document.getElementById('otp-ciphertext').textContent;
  const key = document.getElementById('otp-key').value;
  if (!text || text === '—') { showToast('Encrypt first.', 'error'); return; }
  const letterCount = countLetters(text);
  const keyClean = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (keyClean.length !== letterCount) {
    showToast(`Key length (${keyClean.length}) must match letter count in ciphertext (${letterCount}).`, 'error');
    return;
  }

  const t0 = performance.now();
  const plain = otpCore(text, key, true);
  const t1 = performance.now();

  document.getElementById('otp-decrypted').textContent = plain;
  const prev = document.getElementById('otp-time').textContent;
  document.getElementById('otp-time').textContent = prev + ` | Decryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('OTP decryption complete!', 'success');
}

// ─────────────────────────────────────────────────────────────
// 7. RAIL FENCE CIPHER
// ─────────────────────────────────────────────────────────────

function railfenceEncryptCore(text, rails) {
  if (rails < 2 || text.length === 0) return text;
  const fence = Array.from({ length: rails }, () => []);
  let rail = 0, direction = 1;
  for (const ch of text) {
    fence[rail].push(ch);
    if (rail === 0) direction = 1;
    if (rail === rails - 1) direction = -1;
    rail += direction;
  }
  return fence.flat().join('');
}

function railfenceDecryptCore(text, rails) {
  if (rails < 2 || text.length === 0) return text;
  const n = text.length;
  // Determine the length of each rail
  const railLens = new Array(rails).fill(0);
  let rail = 0, direction = 1;
  for (let i = 0; i < n; i++) {
    railLens[rail]++;
    if (rail === 0) direction = 1;
    if (rail === rails - 1) direction = -1;
    rail += direction;
  }
  // Split ciphertext into rail segments
  const railChars = [];
  let idx = 0;
  for (let r = 0; r < rails; r++) {
    railChars.push(text.slice(idx, idx + railLens[r]).split(''));
    idx += railLens[r];
  }
  // Read off in zigzag order
  const result = [];
  rail = 0; direction = 1;
  const railIdx = new Array(rails).fill(0);
  for (let i = 0; i < n; i++) {
    result.push(railChars[rail][railIdx[rail]++]);
    if (rail === 0) direction = 1;
    if (rail === rails - 1) direction = -1;
    rail += direction;
  }
  return result.join('');
}

function railfenceEncrypt() {
  const text = document.getElementById('railfence-plaintext').value;
  const rails = parseInt(document.getElementById('railfence-key').value, 10);
  if (!text) { showToast('Please enter plaintext.', 'error'); return; }
  if (isNaN(rails) || rails < 2) { showToast('Number of rails must be ≥ 2.', 'error'); return; }

  const t0 = performance.now();
  const cipher = railfenceEncryptCore(text, rails);
  const t1 = performance.now();

  document.getElementById('railfence-ciphertext').textContent = cipher;
  document.getElementById('railfence-time').textContent = `Encryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Rail Fence encryption complete!', 'success');
}

function railfenceDecrypt() {
  const text = document.getElementById('railfence-ciphertext').textContent;
  const rails = parseInt(document.getElementById('railfence-key').value, 10);
  if (!text || text === '—') { showToast('Encrypt first.', 'error'); return; }
  if (isNaN(rails) || rails < 2) { showToast('Number of rails must be ≥ 2.', 'error'); return; }

  const t0 = performance.now();
  const plain = railfenceDecryptCore(text, rails);
  const t1 = performance.now();

  document.getElementById('railfence-decrypted').textContent = plain;
  const prev = document.getElementById('railfence-time').textContent;
  document.getElementById('railfence-time').textContent = prev + ` | Decryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Rail Fence decryption complete!', 'success');
}

// ─────────────────────────────────────────────────────────────
// 8. COLUMNAR TRANSPOSITION CIPHER
// ─────────────────────────────────────────────────────────────

/**
 * Get column order from keyword using stable sort (left-to-right for ties).
 * Returns an array of 0-indexed column positions sorted by keyword letter.
 */
function getColumnOrder(keyword) {
  const kw = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  const indexed = kw.split('').map((ch, i) => ({ ch, i }));
  // Stable sort by character, ties broken by original index
  indexed.sort((a, b) => a.ch < b.ch ? -1 : a.ch > b.ch ? 1 : a.i - b.i);
  // order[i] = which column to read i-th
  const order = indexed.map(x => x.i);
  return order;
}

function columnarEncryptCore(text, keyword) {
  const kw = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  const cols = kw.length;
  if (cols === 0) return text;
  const order = getColumnOrder(kw);
  // Write text into rows of 'cols' width
  const rows = Math.ceil(text.length / cols);
  const grid = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(idx < text.length ? text[idx++] : '');
    }
    grid.push(row);
  }
  // Read columns in sorted order
  let result = '';
  for (const col of order) {
    for (let r = 0; r < rows; r++) {
      if (grid[r][col] !== '') result += grid[r][col];
    }
  }
  return result;
}

function columnarDecryptCore(text, keyword) {
  const kw = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  const cols = kw.length;
  if (cols === 0) return text;
  const order = getColumnOrder(kw);
  const n = text.length;
  const rows = Math.ceil(n / cols);
  const fullCols = n % cols || cols; // number of columns that have 'rows' chars

  // Determine length of each column in sorted order
  // The original grid has 'rows' rows and 'cols' columns.
  // The last row may have fewer columns. Specifically, the first (n % cols) columns
  // (in original order) have 'rows' characters, the rest have 'rows-1'.
  // But if n % cols == 0, all columns have 'rows' characters.
  const colLengths = new Array(cols);
  const remainder = n % cols;
  for (let c = 0; c < cols; c++) {
    // column c in original order has 'rows' chars if c < remainder, else rows-1
    colLengths[c] = (remainder === 0 || c < remainder) ? rows : rows - 1;
  }

  // Fill columns in sorted order
  const colData = new Array(cols);
  let idx = 0;
  for (const origCol of order) {
    const len = colLengths[origCol];
    colData[origCol] = text.slice(idx, idx + len).split('');
    idx += len;
  }

  // Read off row by row
  let result = '';
  const colIdx = new Array(cols).fill(0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (colIdx[c] < (colData[c] || []).length) {
        result += colData[c][colIdx[c]++];
      }
    }
  }
  return result;
}

function columnarEncrypt() {
  const text = document.getElementById('columnar-plaintext').value;
  const key = document.getElementById('columnar-key').value;
  if (!text) { showToast('Please enter plaintext.', 'error'); return; }
  if (!key || !/[A-Za-z]/.test(key)) { showToast('Please enter an alphabetic keyword.', 'error'); return; }

  const t0 = performance.now();
  const cipher = columnarEncryptCore(text, key);
  const t1 = performance.now();

  document.getElementById('columnar-ciphertext').textContent = cipher;
  document.getElementById('columnar-time').textContent = `Encryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Columnar encryption complete!', 'success');
}

function columnarDecrypt() {
  const text = document.getElementById('columnar-ciphertext').textContent;
  const key = document.getElementById('columnar-key').value;
  if (!text || text === '—') { showToast('Encrypt first.', 'error'); return; }
  if (!key || !/[A-Za-z]/.test(key)) { showToast('Please enter an alphabetic keyword.', 'error'); return; }

  const t0 = performance.now();
  const plain = columnarDecryptCore(text, key);
  const t1 = performance.now();

  document.getElementById('columnar-decrypted').textContent = plain;
  const prev = document.getElementById('columnar-time').textContent;
  document.getElementById('columnar-time').textContent = prev + ` | Decryption: ${(t1 - t0).toFixed(4)} ms`;
  showToast('Columnar decryption complete!', 'success');
}


/* ════════════════════════════════════════════════════════════
   COMPARE ALGORITHMS
   ════════════════════════════════════════════════════════════ */

function runComparison() {
  const text = document.getElementById('compare-plaintext').value;
  if (!text) { showToast('Please enter plaintext for comparison.', 'error'); return; }

  const checkboxes = document.querySelectorAll('#page-compare .checkbox-grid input[type="checkbox"]');
  const selected = [];
  checkboxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
  if (selected.length === 0) { showToast('Select at least one cipher.', 'error'); return; }

  const tbody = document.getElementById('compare-table-body');
  tbody.innerHTML = '';

  // Default keys for comparison
  const monoKey = 'QWERTYUIOPASDFGHJKLZXCVBNM';
  const letterCount = countLetters(text);
  let otpKey = '';
  for (let i = 0; i < letterCount; i++) {
    otpKey += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }

  const configs = {
    caesar:          { name: 'Caesar Cipher',          cat: 'Substitution',   keyType: 'Integer (3)',
                       enc: t => caesarCore(t, 3),
                       dec: t => caesarCore(t, -3) },
    monoalphabetic:  { name: 'Monoalphabetic',         cat: 'Substitution',   keyType: '26-letter permutation',
                       enc: t => monoEncryptCore(t, monoKey),
                       dec: t => monoDecryptCore(t, monoKey) },
    playfair:        { name: 'Playfair Cipher',        cat: 'Substitution',   keyType: 'Keyword (MONARCHY)',
                       enc: t => playfairEncryptCore(t, 'MONARCHY'),
                       dec: t => playfairDecryptCore(t, 'MONARCHY') },
    hill:            { name: 'Hill Cipher',            cat: 'Substitution',   keyType: '2×2 Matrix [6,24,1,13]',
                       enc: t => hillEncryptCore(t, [6, 24, 1, 13]),
                       dec: t => hillDecryptCore(t, [6, 24, 1, 13]) },
    vigenere:        { name: 'Vigenère Cipher',        cat: 'Substitution',   keyType: 'Keyword (LEMON)',
                       enc: t => vigenereCore(t, 'LEMON', false),
                       dec: t => vigenereCore(t, 'LEMON', true) },
    otp:             { name: 'One-Time Pad',           cat: 'Substitution',   keyType: `Random key (${letterCount} chars)`,
                       enc: t => otpCore(t, otpKey, false),
                       dec: t => otpCore(t, otpKey, true) },
    railfence:       { name: 'Rail Fence Cipher',      cat: 'Transposition',  keyType: 'Rails (3)',
                       enc: t => railfenceEncryptCore(t, 3),
                       dec: t => railfenceDecryptCore(t, 3) },
    columnar:        { name: 'Columnar Transposition', cat: 'Transposition',  keyType: 'Keyword (ZEBRAS)',
                       enc: t => columnarEncryptCore(t, 'ZEBRAS'),
                       dec: t => columnarDecryptCore(t, 'ZEBRAS') },
  };

  for (const id of selected) {
    const cfg = configs[id];
    if (!cfg) continue;

    const t0 = performance.now();
    const cipher = cfg.enc(text);
    const t1 = performance.now();

    const t2 = performance.now();
    const decrypted = cfg.dec(cipher);
    const t3 = performance.now();

    // Round-trip check (for Playfair and Hill, only check letter content since they strip/pad)
    let roundTrip;
    if (id === 'playfair' || id === 'hill') {
      // Compare letters only
      const origLetters = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, id === 'playfair' ? 'I' : 'J');
      let decLetters = decrypted.toUpperCase().replace(/[^A-Z]/g, '');
      // Playfair may have extra X filler, Hill may have padding X
      roundTrip = decLetters.startsWith(origLetters.length <= decLetters.length
        ? origLetters : origLetters.substring(0, decLetters.length));
      // More lenient: just check if first N chars match
      const minLen = Math.min(origLetters.length, decLetters.length);
      roundTrip = origLetters.substring(0, minLen) === decLetters.substring(0, minLen);
    } else {
      roundTrip = (decrypted === text);
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cfg.name}</td>
      <td>${cfg.cat}</td>
      <td>${cfg.keyType}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${cipher}">${cipher}</td>
      <td>${(t1 - t0).toFixed(4)} ms</td>
      <td>${(t3 - t2).toFixed(4)} ms</td>
      <td class="${roundTrip ? 'pass' : 'fail'}">${roundTrip ? '✔ Pass' : '✘ Fail'}</td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById('compare-results').style.display = 'block';
  showToast('Comparison complete!', 'success');
}

function clearComparison() {
  document.getElementById('compare-plaintext').value = '';
  document.getElementById('compare-table-body').innerHTML = '';
  document.getElementById('compare-results').style.display = 'none';
  showToast('Comparison cleared.', 'info');
}


/* ════════════════════════════════════════════════════════════
   FILE ENCRYPTION / DECRYPTION
   ════════════════════════════════════════════════════════════ */

let fileEncContent = '';
let fileDecContent = '';
let fileEncResult = '';
let fileDecResult = '';
let fileEncName = '';
let fileDecName = '';

function initFileInputs() {
  document.getElementById('file-enc-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      showToast('Please upload a .txt file.', 'error');
      return;
    }
    fileEncName = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      fileEncContent = ev.target.result;
      document.getElementById('file-enc-preview').textContent = fileEncContent;
      showToast(`File "${file.name}" loaded.`, 'success');
    };
    reader.readAsText(file);
  });

  document.getElementById('file-dec-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      showToast('Please upload a .txt file.', 'error');
      return;
    }
    fileDecName = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      fileDecContent = ev.target.result;
      document.getElementById('file-dec-preview').textContent = fileDecContent;
      showToast(`File "${file.name}" loaded.`, 'success');
    };
    reader.readAsText(file);
  });
}

/**
 * Generic encrypt/decrypt dispatcher for file operations.
 */
function fileCipherDispatch(text, algo, key, decrypt = false) {
  switch (algo) {
    case 'caesar': {
      const shift = parseInt(key, 10);
      if (isNaN(shift) || shift < 0 || shift > 25) throw 'Caesar key must be an integer 0–25.';
      return caesarCore(text, decrypt ? -shift : shift);
    }
    case 'monoalphabetic': {
      const k = key.toUpperCase();
      const err = validateMonoKey(k);
      if (err) throw err;
      return decrypt ? monoDecryptCore(text, k) : monoEncryptCore(text, k);
    }
    case 'playfair': {
      if (!key || !/[A-Za-z]/.test(key)) throw 'Playfair key must be an alphabetic keyword.';
      return decrypt ? playfairDecryptCore(text, key) : playfairEncryptCore(text, key);
    }
    case 'hill': {
      const parts = key.split(',').map(s => parseInt(s.trim(), 10));
      if (parts.length !== 4 || parts.some(isNaN)) throw 'Hill key must be 4 comma-separated integers (e.g. 6,24,1,13).';
      const err = hillValidateKey(parts);
      if (err) throw err;
      return decrypt ? hillDecryptCore(text, parts) : hillEncryptCore(text, parts);
    }
    case 'vigenere': {
      if (!key || !/^[A-Za-z]+$/.test(key)) throw 'Vigenère key must be a non-empty alphabetic keyword.';
      return vigenereCore(text, key, decrypt);
    }
    case 'otp': {
      const letterCount = countLetters(text);
      const k = key.toUpperCase().replace(/[^A-Z]/g, '');
      if (k.length !== letterCount) throw `OTP key length (${k.length}) must match letter count (${letterCount}).`;
      return otpCore(text, key, decrypt);
    }
    case 'railfence': {
      const rails = parseInt(key, 10);
      if (isNaN(rails) || rails < 2) throw 'Rail Fence key must be an integer ≥ 2.';
      return decrypt ? railfenceDecryptCore(text, rails) : railfenceEncryptCore(text, rails);
    }
    case 'columnar': {
      if (!key || !/[A-Za-z]/.test(key)) throw 'Columnar key must be an alphabetic keyword.';
      return decrypt ? columnarDecryptCore(text, key) : columnarEncryptCore(text, key);
    }
    default:
      throw 'Unknown algorithm.';
  }
}

function encryptFile() {
  if (!fileEncContent) { showToast('Please upload a .txt file first.', 'error'); return; }
  const algo = document.getElementById('file-enc-algo').value;
  let key = document.getElementById('file-enc-key').value;

  // Auto-generate OTP key if needed
  if (algo === 'otp' && !key) {
    const n = countLetters(fileEncContent);
    key = '';
    for (let i = 0; i < n; i++) key += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    document.getElementById('file-enc-key').value = key;
    showToast('OTP key auto-generated. Copy it to decrypt later!', 'info');
  }

  try {
    fileEncResult = fileCipherDispatch(fileEncContent, algo, key, false);
    document.getElementById('file-enc-output').textContent = fileEncResult;
    document.getElementById('file-enc-download-btn').style.display = 'inline-flex';
    showToast(`File encrypted with ${algo}.`, 'success');
  } catch (err) {
    showToast(typeof err === 'string' ? err : 'Encryption failed.', 'error');
  }
}

function decryptFile() {
  if (!fileDecContent) { showToast('Please upload an encrypted .txt file first.', 'error'); return; }
  const algo = document.getElementById('file-dec-algo').value;
  const key = document.getElementById('file-dec-key').value;

  try {
    fileDecResult = fileCipherDispatch(fileDecContent, algo, key, true);
    document.getElementById('file-dec-output').textContent = fileDecResult;
    document.getElementById('file-dec-download-btn').style.display = 'inline-flex';
    showToast(`File decrypted with ${algo}.`, 'success');
  } catch (err) {
    showToast(typeof err === 'string' ? err : 'Decryption failed.', 'error');
  }
}

function downloadFileEncrypted() {
  if (!fileEncResult) return;
  downloadTextFile('encrypted_' + (fileEncName || 'output.txt'), fileEncResult);
}

function downloadFileDecrypted() {
  if (!fileDecResult) return;
  downloadTextFile('decrypted_' + (fileDecName || 'output.txt'), fileDecResult);
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  showToast(`Downloaded ${filename}`, 'success');
}
