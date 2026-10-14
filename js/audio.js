/**
 * Misi Nusa Logika 3D — Modul Audio & Kesan Bunyi (Web Audio API)
 * Dicipta secara sintesis tempatan tanpa fail luaran.
 */
'use strict';

const SOUND_KEY = 'nusa-logika-v1-sound';
const voices = new Set();
let master = null;
let lastStep = 0;
let stepSide = false;
let audio = null;
let sound = true;

try {
  sound = localStorage.getItem(SOUND_KEY) !== 'off';
} catch (e) {}

const sounds = {
  select: [[630, 0.07, 0, 'sine', 0.12, 790]],
  menu: [[390, 0.09, 0, 'sine', 0.12], [520, 0.11, 0.07, 'sine', 0.10]],
  travel: [[300, 0.16, 0, 'sine', 0.10, 720]],
  start: [[392, 0.12, 0, 'triangle', 0.12], [523, 0.15, 0.11, 'triangle', 0.12], [659, 0.21, 0.23, 'sine', 0.12]],
  hint: [[660, 0.12, 0, 'sine', 0.10], [880, 0.17, 0.10, 'sine', 0.09]],
  correct: [[523, 0.11, 0, 'triangle', 0.13], [659, 0.12, 0.10, 'triangle', 0.13], [784, 0.21, 0.21, 'sine', 0.12]],
  wrong: [[260, 0.15, 0, 'sine', 0.11, 220], [220, 0.17, 0.12, 'sine', 0.09, 195]],
  mission: [[330, 0.15, 0, 'triangle', 0.11], [494, 0.17, 0.12, 'sine', 0.10]],
  crystal: [[659, 0.15, 0, 'sine', 0.13], [784, 0.15, 0.11, 'sine', 0.12], [988, 0.19, 0.23, 'sine', 0.12], [1319, 0.35, 0.36, 'sine', 0.10]],
  victory: [
    [392, 0.16, 0, 'triangle', 0.12],
    [523, 0.16, 0.15, 'triangle', 0.12],
    [659, 0.17, 0.30, 'triangle', 0.12],
    [784, 0.20, 0.45, 'sine', 0.12],
    [1047, 0.45, 0.64, 'sine', 0.12],
    [659, 0.45, 0.64, 'sine', 0.07]
  ],
  step: [[110, 0.065, 0, 'triangle', 0.045, 72]],
  stepAlt: [[135, 0.065, 0, 'triangle', 0.04, 88]]
};

function soundUI() {
  const btn = document.getElementById('soundBtn');
  if (btn) {
    btn.textContent = 'Bunyi: ' + (sound ? 'Buka' : 'Tutup');
    btn.setAttribute('aria-pressed', String(sound));
  }
}

function unlockAudio() {
  if (!sound) return;
  try {
    if (!audio) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audio = new AudioContextClass();
      master = audio.createGain();
      master.gain.value = 0.32;
      master.connect(audio.destination);
    }
    if (audio.state === 'suspended') {
      audio.resume().catch(() => {});
    }
  } catch (e) {}
}

function silenceSounds() {
  for (const v of voices) {
    try {
      v.stop();
      v.disconnect();
    } catch (e) {}
  }
  voices.clear();
}

function sfx(name) {
  if (!sound || document.hidden || !audio || audio.state !== 'running' || !sounds[name]) return;
  try {
    const now = audio.currentTime;
    for (const [freq, duration, delay, type, level, end] of sounds[name]) {
      if (voices.size >= 20) break;
      const o = audio.createOscillator();
      const g = audio.createGain();
      const at = now + delay;
      o.type = type;
      o.frequency.setValueAtTime(freq, at);
      if (end) {
        o.frequency.exponentialRampToValueAtTime(end, at + duration);
      }
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(level, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      o.connect(g);
      g.connect(master);
      voices.add(o);
      o.onended = () => {
        voices.delete(o);
        o.disconnect();
        g.disconnect();
      };
      o.start(at);
      o.stop(at + duration + 0.025);
    }
  } catch (e) {}
}

function tone(ok = true) {
  sfx(ok ? 'correct' : 'wrong');
}

function toggleSound() {
  sound = !sound;
  if (sound) {
    unlockAudio();
    if (master) master.gain.value = 0.32;
    sfx('menu');
  } else {
    if (master) master.gain.value = 0;
    silenceSounds();
  }
  soundUI();
  try {
    localStorage.setItem(SOUND_KEY, sound ? 'on' : 'off');
  } catch (e) {}
}

document.addEventListener('pointerdown', unlockAudio, { capture: true, passive: true });
document.addEventListener('keydown', unlockAudio, { capture: true });
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.matches('[data-answer],[data-move]')) {
    sfx('select');
  } else if (b.id === 'hintBtn') {
    sfx('hint');
  } else if (['notesBtn', 'helpBtn', 'closeModal', 'backBtn', 'reviewBtn', 'notesEnd', 'returnBtn'].includes(b.id)) {
    sfx('menu');
  }
}, true);

// Pendedahan kepada skop global
window.sfx = sfx;
window.tone = tone;
window.unlockAudio = unlockAudio;
window.silenceSounds = silenceSounds;
window.toggleSound = toggleSound;
window.soundUI = soundUI;
window.soundPresets = sounds;
Object.defineProperty(window, 'sound', {
  get() { return sound; },
  set(v) { sound = v; }
});
