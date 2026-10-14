import { normalizeVisualData, eventAt, pulseAllowed } from './visual-data.mjs';

const audio = document.querySelector('#audio');
const sound = document.querySelector('#sound-toggle');
const mute = document.querySelector('#mute-toggle');
const motion = document.querySelector('#motion-toggle');
const status = document.querySelector('#audio-status');
const canvas = document.querySelector('#signal-canvas');
const context = canvas.getContext('2d');
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let audioContext, analyser, bins, source;
let beats = [], drops = [], lastBeat = -1, lastDrop = -1;
let frameId = 0, previousFrame = 0, lowEnd = 0, dropSize = 0, dropTime = -100;
let enabled = !reduced.matches, seeking = false, waiting = false;
let lastFlash = -100, flashAt = -100, flashSize = 0;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
let sceneTime = 0, pointerX = 0, pointerY = 0, driftX = 0, driftY = 0, driftScroll = scrollY;
const particles = Array.from({ length: 18 }, (_, i) => ({
  x: (i * .618034 + .13) % 1, y: (i * .414214 + .17) % 1,
  depth: .3 + (i % 5) * .17, radius: 24 + (i * 17 % 53), phase: i * 1.9
}));
// Reuse one soft sprite. No per-frame gradients or external imagery.
const orb = document.createElement('canvas');
orb.width = orb.height = 128;
const orbContext = orb.getContext('2d');
const halo = orbContext.createRadialGradient(64, 64, 0, 64, 64, 64);
halo.addColorStop(0, 'rgba(255,255,255,.48)');
halo.addColorStop(.38, 'rgba(255,255,255,.34)');
halo.addColorStop(.66, 'rgba(255,255,255,.12)');
halo.addColorStop(1, 'rgba(255,255,255,0)');
orbContext.fillStyle = halo;
orbContext.fillRect(0, 0, 128, 128);

function connectAudio() {
  if (!audioContext) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext = new Audio();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = .35;
    bins = new Uint8Array(analyser.frequencyBinCount);
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }
  audioContext.resume().catch(() => {});
}

function readBass() {
  if (!analyser || audioContext.state !== 'running') return 0;
  analyser.getByteFrequencyData(bins);
  const count = Math.max(2, Math.floor(180 / (audioContext.sampleRate / analyser.fftSize)));
  let energy = 0;
  for (let i = 1; i < count; i++) energy += bins[i] / 255;
  return energy / (count - 1);
}

function setSignal(bass, drop, flash = 0) {
  root.style.setProperty('--bass-level', bass.toFixed(3));
  root.style.setProperty('--pulse-glow', drop.toFixed(3));
  root.style.setProperty('--logo-flash', flash.toFixed(3));
  root.style.setProperty('--edge-alpha', (.10 + bass * .10 + drop * .08).toFixed(3));
  root.style.setProperty('--edge-glow', `${(3 + bass * 12 + drop * 18).toFixed(1)}px`);
  root.style.setProperty('--trace-offset', `${(-audio.currentTime * 1.2).toFixed(3)}px`);
}

function paint(time, bass = 0, kick = 0, drop = 0) {
  const width = innerWidth, height = innerHeight;
  const scale = Math.min(devicePixelRatio || 1, 1.5);
  if (canvas.width !== Math.round(width * scale) || canvas.height !== Math.round(height * scale)) {
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
  }
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, width, height);
  const count = width < 600 ? 10 : 18;
  canvas.dataset.particleCount = String(count);
  canvas.dataset.pixelRatio = String(scale);
  canvas.dataset.sceneTime = time.toFixed(3);
  const bokehDrive = bass * .28 + kick * .08 + drop * .22;
  canvas.dataset.bokehDrive = bokehDrive.toFixed(3);
  for (let i = 0; i < count; i++) {
    const particle = particles[i];
    const radius = particle.radius * (width < 600 ? .72 : 1) * (1 + bokehDrive);
    const x = particle.x * width + Math.sin(time * .055 + particle.phase) * 32 * particle.depth
      + driftX * particle.depth + (particle.x - .5) * bokehDrive * 30;
    const span = height + 220;
    const rawY = particle.y * height + Math.cos(time * .045 + particle.phase) * 37 * particle.depth
      + driftY * particle.depth - driftScroll * .025 * particle.depth;
    const y = ((rawY + 110) % span + span) % span - 110;
    context.globalAlpha = .21 + particle.depth * .12 + bass * .18 + drop * .12;
    context.drawImage(orb, x - radius, y - radius, radius * 2, radius * 2);
  }
  context.globalAlpha = 1;
  const lines = width < 600 ? 3 : 4;
  const amplitude = 8 + bass * 18 + kick * 28 + drop * 25;
  for (let line = 0; line < lines; line++) {
    context.beginPath();
    const anchor = width * (line + 1) / (lines + 1);
    for (let step = 0; step <= 80; step++) {
      const y = height * step / 80;
      const x = anchor + Math.sin(step * .10 + time * .22 + line) * amplitude
        + Math.sin(step * .29 - time * .12) * (3 + kick * 8);
      if (step) context.lineTo(x, y); else context.moveTo(x, y);
    }
    // Only narrow linework blooms. The page background and readable text stay steady.
    const opacity = clamp(.03 + bass * .12 + drop * .16, .03, .24);
    context.strokeStyle = `rgba(255,255,255,${opacity})`;
    context.shadowColor = `rgba(255,255,255,${.30 + bass * .20 + drop * .20})`;
    context.shadowBlur = 6 + bass * 17 + drop * 23;
    context.lineWidth = .9 + bass * .8 + kick * .7;
    context.stroke();
    context.shadowBlur = 0;
  }
}

function resetCues() {
  const time = audio.currentTime || 0;
  lastBeat = eventAt(beats, time)?.time_seconds ?? -1;
  lastDrop = eventAt(drops, time)?.time_seconds ?? -1;
  dropTime = -100;
  lastFlash = sceneTime; flashAt = -100;
  lowEnd = 0;
}

function flashLogo(strength) {
  // A small emblem flashes at most once per .72 seconds, including strong drops.
  if (!pulseAllowed(lastFlash, sceneTime)) return;
  lastFlash = sceneTime; flashAt = sceneTime; flashSize = clamp(strength, .55, 1);
}

function frame(now) {
  frameId = 0;
  if (!enabled || document.hidden) return;
  if (previousFrame && now - previousFrame < 33) { frameId = requestAnimationFrame(frame); return; }
  const elapsed = previousFrame ? Math.min(.12, (now - previousFrame) / 1000) : 1 / 30;
  previousFrame = now;
  sceneTime += elapsed;
  const ease = 1 - Math.exp(-elapsed / .65);
  driftX += (pointerX - driftX) * ease;
  driftY += (pointerY - driftY) * ease;
  driftScroll += (scrollY - driftScroll) * ease;
  root.style.setProperty('--emblem-x', `${(driftX * .4).toFixed(2)}px`);
  root.style.setProperty('--emblem-y', `${(driftY * .4 - Math.min(driftScroll, 1200) * .004).toFixed(2)}px`);
  const playing = !audio.paused && !audio.ended && !seeking && !waiting;
  const time = audio.currentTime || 0;
  const target = playing ? readBass() : 0;
  lowEnd += (target - lowEnd) * (1 - Math.exp(-elapsed / (target > lowEnd ? .07 : .26)));
  let kick = 0;
  if (playing) {
    const beat = eventAt(beats, time);
    if (beat && time - beat.time_seconds < .34) {
      kick = beat.strength * Math.exp(-(time - beat.time_seconds) / .14);
      if (beat.time_seconds > lastBeat) flashLogo(beat.strength);
      lastBeat = beat.time_seconds;
    }
    const drop = eventAt(drops, time);
    if (drop && drop.time_seconds > lastDrop) {
      lastDrop = drop.time_seconds;
      if (time - drop.time_seconds < .25) { dropTime = time; dropSize = drop.strength; flashLogo(drop.strength); }
    }
  }
  const age = time - dropTime;
  const drop = playing && age >= 0 && age < 1.7
    ? dropSize * (age < .22 ? Math.sin(age / .22 * Math.PI / 2) : Math.exp(-(age - .22) / .6)) : 0;
  const flash = playing ? flashSize * Math.exp(-Math.max(0, sceneTime - flashAt) / .18) : 0;
  setSignal(lowEnd, drop, flash);
  paint(sceneTime, lowEnd, kick, drop);
  frameId = requestAnimationFrame(frame);
}

function start() {
  if (enabled && !document.hidden && !frameId) { previousFrame = 0; frameId = requestAnimationFrame(frame); }
}
function setMotion(value) {
  enabled = Boolean(value) && !reduced.matches;
  document.body.classList.toggle('motion-off', !enabled);
  motion.setAttribute('aria-checked', String(enabled));
  motion.textContent = enabled ? 'Motion on' : 'Motion off';
  if (!enabled) {
    cancelAnimationFrame(frameId); frameId = 0;
    setSignal(0, 0); paint(sceneTime);
  } else start();
}

sound.addEventListener('click', () => {
  if (audio.paused) {
    try { connectAudio(); } catch { status.textContent = 'Sound can play; live audio analysis is unavailable.'; }
    audio.play().catch(() => { status.textContent = 'Audio could not start. Try the native controls under the menu.'; });
  } else audio.pause();
});
audio.addEventListener('play', () => {
  try { connectAudio(); } catch {}
  sound.textContent = 'Pause sound';
  sound.setAttribute('aria-label', 'Pause optional soundtrack');
  status.textContent = 'Optional music is playing. White accents follow bass and inferred cues.';
  waiting = false;
  start();
});
function paused() {
  sound.textContent = 'Sound off'; sound.setAttribute('aria-label', 'Play optional soundtrack');
  status.textContent = audio.ended ? 'The mix has ended.' : 'Music paused. The journal remains available.';
}
audio.addEventListener('pause', paused); audio.addEventListener('ended', paused);
audio.addEventListener('waiting', () => { waiting = true; });
audio.addEventListener('playing', () => { waiting = false; });
audio.addEventListener('seeking', () => { seeking = true; });
audio.addEventListener('seeked', () => { seeking = false; resetCues(); });
audio.addEventListener('error', () => { status.textContent = 'The optional mix could not load. You can still read the journal.'; });
mute.addEventListener('click', () => { audio.muted = !audio.muted; });
audio.addEventListener('volumechange', () => {
  mute.textContent = audio.muted ? 'Unmute' : 'Mute'; mute.setAttribute('aria-pressed', String(audio.muted));
});
motion.addEventListener('click', () => setMotion(!enabled));
reduced.addEventListener('change', event => setMotion(!event.matches));
window.addEventListener('resize', () => paint(sceneTime));
window.addEventListener('pointermove', event => {
  if (!enabled || event.pointerType !== 'mouse') return;
  pointerX = (event.clientX / innerWidth - .5) * 20;
  pointerY = (event.clientY / innerHeight - .5) * 16;
}, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; } else start();
});
fetch('cues.json').then(response => {
  if (!response.ok) throw Error('Cue data unavailable');
  return response.json();
}).then(raw => {
  const cues = normalizeVisualData(raw);
  if (Math.abs(cues.duration_seconds - 1306.586848) > .05) return;
  beats = cues.events.filter(event => event.event_type === 'beat_candidate');
  drops = cues.events.filter(event => event.event_type === 'drop_candidate');
  resetCues();
}).catch(() => {});
setMotion(enabled);
