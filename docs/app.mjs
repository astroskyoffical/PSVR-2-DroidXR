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
const video = document.querySelector('#demo-video');
const videoSound = document.querySelector('#demo-sound');
const emblem = document.querySelector('#emblem-control');
const invitation = document.querySelector('#sound-invitation');
const missionInvitation = document.querySelector('#mission-invitation');
let audioContext, analyser, bins;
const sources = new WeakMap();
let beats = [], drops = [], lastBeat = -1, lastDrop = -1;
let frameId = 0, previousFrame = 0, lowEnd = 0, dropSize = 0, dropTime = -100;
let enabled = !reduced.matches, seeking = false, waiting = false;
let lastFlash = -100, flashAt = -100, flashSize = 0;
let surfaceGlow = 0;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
let sceneTime = 0, pointerX = 0, pointerY = 0, driftX = 0, driftY = 0, driftScroll = scrollY;
let dragX = 0, dragY = 0, drag = null, suppressClick = false, pokeAt = -100;
let videoInView = false, userPausedVideo = false, autoPausingVideo = false, restoreMusic = false;
audio.volume = .5;
function saveSoundChoice(value) {
  try { sessionStorage.setItem('droidxr-sound-choice', value); } catch {}
}
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

async function connectAudio(media = audio) {
  if (!audioContext) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext = new Audio();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = .35;
    bins = new Uint8Array(analyser.frequencyBinCount);
    analyser.connect(audioContext.destination);
  }
  // Leave native playback intact if the browser has not unlocked WebAudio yet.
  await audioContext.resume();
  if (audioContext.state === 'running' && !sources.has(media)) {
    const source = audioContext.createMediaElementSource(media);
    source.connect(analyser);
    sources.set(media, source);
  }
}
const analyse = media => connectAudio(media).catch(() => {});
const videoAudible = () => !video.paused && !video.ended && !video.muted && video.volume > 0;

function readBass() {
  if (!analyser || audioContext.state !== 'running') return 0;
  analyser.getByteFrequencyData(bins);
  const count = Math.max(2, Math.floor(180 / (audioContext.sampleRate / analyser.fftSize)));
  let energy = 0;
  for (let i = 1; i < count; i++) energy += bins[i] / 255;
  return energy / (count - 1);
}

function setSignal(bass, drop, flash = 0, glow = 0) {
  root.style.setProperty('--bass-level', bass.toFixed(3));
  root.style.setProperty('--pulse-glow', drop.toFixed(3));
  root.style.setProperty('--logo-flash', flash.toFixed(3));
  root.style.setProperty('--surface-glow', glow.toFixed(3));
  root.style.setProperty('--edge-alpha', (.14 + bass * .20 + drop * .12).toFixed(3));
  root.style.setProperty('--edge-glow', `${(5 + bass * 22 + drop * 26).toFixed(1)}px`);
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
  const bokehDrive = bass * .38 + kick * .08 + drop * .26;
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
    context.globalAlpha = .21 + particle.depth * .12 + bass * .26 + drop * .16;
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
  surfaceGlow = 0;
  root.style.setProperty('--surface-glow', '0');
}

function flashLogo(beat) {
  // Only stronger onset-aligned beat estimates reach this function. No drop/bass flashes.
  if (!pulseAllowed(lastFlash, sceneTime, .36)) return;
  emblem.dataset.beatTime = String(beat.time_seconds);
  lastFlash = sceneTime; flashAt = sceneTime; flashSize = clamp(beat.strength, .55, 1);
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
  root.style.setProperty('--emblem-x', `${(driftX * .4 + Math.sin(sceneTime * .32) * 8).toFixed(2)}px`);
  root.style.setProperty('--emblem-y', `${(driftY * .4 + Math.cos(sceneTime * .27) * 10).toFixed(2)}px`);
  const pokeAge = sceneTime - pokeAt;
  root.style.setProperty('--emblem-tilt', `${(pokeAge < 1 ? Math.sin(pokeAge * 12) * Math.exp(-pokeAge * 4) * 12 : 0).toFixed(2)}deg`);
  const playing = !audio.paused && !audio.ended && !seeking && !waiting;
  const time = audio.currentTime || 0;
  const target = playing || videoAudible() ? readBass() : 0;
  lowEnd += (target - lowEnd) * (1 - Math.exp(-elapsed / (target > lowEnd ? .07 : .26)));
  let kick = 0;
  if (playing) {
    const beat = eventAt(beats, time);
    if (beat && time - beat.time_seconds < .34) {
      kick = beat.strength * Math.exp(-(time - beat.time_seconds) / .14);
      if (beat.time_seconds > lastBeat) flashLogo(beat);
      lastBeat = beat.time_seconds;
    }
    const drop = eventAt(drops, time);
    if (drop && drop.time_seconds > lastDrop) {
      lastDrop = drop.time_seconds;
      if (time - drop.time_seconds < .25) { dropTime = time; dropSize = drop.strength; }
    }
  }
  const age = time - dropTime;
  const drop = playing && age >= 0 && age < 1.7
    ? dropSize * (age < .22 ? Math.sin(age / .22 * Math.PI / 2) : Math.exp(-(age - .22) / .6)) : 0;
  const flash = playing ? flashSize * Math.exp(-Math.max(0, sceneTime - flashAt) / .18) : 0;
  const glowTarget = playing && !audio.muted && audio.volume > 0 ? clamp(flash * .7 + drop * .3, 0, 1) : 0;
  surfaceGlow += (glowTarget - surfaceGlow) * (1 - Math.exp(-elapsed / (glowTarget > surfaceGlow ? .08 : .32)));
  setSignal(lowEnd, drop, flash, surfaceGlow);
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
    surfaceGlow = 0;
    setSignal(0, 0); paint(sceneTime); pauseVideo();
  } else start();
}

function musicBlocked() {
  sound.textContent = 'Enable music';
  sound.setAttribute('aria-label', 'Enable optional soundtrack at half volume');
  status.textContent = 'Your browser needs a click to start music. Choose Enable music.';
}
sound.addEventListener('click', () => {
  restoreMusic = false;
  if (audio.paused) {
    video.muted = true;
    analyse(audio);
    audio.play().catch(musicBlocked);
  } else { saveSoundChoice('silent'); audio.pause(); }
});
audio.addEventListener('play', () => {
  saveSoundChoice('enabled');
  if (videoAudible()) video.muted = true;
  analyse(audio);
  sound.textContent = 'Pause sound';
  sound.setAttribute('aria-label', 'Pause optional soundtrack');
  status.textContent = 'Music is playing. Bokeh follows bass; the emblem follows stronger inferred beats.';
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
  if (audio.muted || audio.volume === 0) saveSoundChoice('silent');
  else if (!audio.paused) saveSoundChoice('enabled');
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
  if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; pauseVideo(); }
  else { start(); autoPlayVideo(); }
});
fetch('cues.json').then(response => {
  if (!response.ok) throw Error('Cue data unavailable');
  return response.json();
}).then(raw => {
  const cues = normalizeVisualData(raw);
  if (Math.abs(cues.duration_seconds - 1306.586848) > .05) return;
  beats = cues.events.filter(event => event.event_type === 'beat_candidate' && event.provenance === 'local_grid_onset_snap' && event.strength >= .55);
  drops = cues.events.filter(event => event.event_type === 'drop_candidate');
  resetCues();
}).catch(() => {});
setMotion(enabled);

// Keep the main video out of the arrival download. Native controls remain available.
function loadVideo() {
  if (!video.getAttribute('src')) {
    video.preload = 'metadata';
    video.src = video.dataset.src;
  }
}
function autoPlayVideo() {
  if (videoInView && !document.hidden && enabled && !reduced.matches && !userPausedVideo && !video.ended && video.muted) {
    loadVideo();
    video.play().catch(() => {});
  }
}
function pauseVideo() {
  if (!video.paused) { autoPausingVideo = true; video.pause(); }
}
function coordinateAudio() {
  videoSound.textContent = video.muted ? 'Video sound off' : 'Video sound on';
  videoSound.setAttribute('aria-pressed', String(!video.muted));
  if (videoAudible()) {
    analyse(video);
    if (!audio.paused) { restoreMusic = true; audio.pause(); }
  } else if (restoreMusic) {
    restoreMusic = false;
    audio.play().catch(musicBlocked);
  }
}
videoSound.addEventListener('click', () => {
  video.muted = !video.muted;
  if (!video.muted) {
    analyse(video); loadVideo();
    if (video.paused) video.play().catch(() => {});
  }
  coordinateAudio();
});
video.addEventListener('play', () => { userPausedVideo = false; coordinateAudio(); });
video.addEventListener('pause', () => {
  if (autoPausingVideo) autoPausingVideo = false; else userPausedVideo = true;
  coordinateAudio();
});
video.addEventListener('ended', coordinateAudio);
video.addEventListener('volumechange', coordinateAudio);
video.addEventListener('pointerdown', loadVideo, { once: true });
video.addEventListener('keydown', loadVideo, { once: true });
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    const entry = entries[0];
    videoInView = entry.intersectionRatio >= .45;
    if (entry.isIntersecting) loadVideo();
    if (videoInView) autoPlayVideo(); else if (!entry.isIntersecting) pauseVideo();
  }, { threshold: [0, .45] }).observe(video);
}
reduced.addEventListener('change', event => { if (event.matches) pauseVideo(); });

// A native button provides keyboard access as well as mouse/touch pointer capture.
function moveEmblem(x, y) {
  const rect = emblem.getBoundingClientRect();
  dragX = clamp(x, dragX + 12 - rect.left, dragX + innerWidth - 12 - rect.right);
  dragY = clamp(y, dragY + 12 - rect.top, dragY + innerHeight - 12 - rect.bottom);
  emblem.style.setProperty('--drag-x', `${dragX}px`);
  emblem.style.setProperty('--drag-y', `${dragY}px`);
}
emblem.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  suppressClick = false;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: dragX, startY: dragY };
  emblem.setPointerCapture(event.pointerId);
});
emblem.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
  if (Math.hypot(dx, dy) > 5) suppressClick = true;
  if (suppressClick) { emblem.classList.add('dragging'); moveEmblem(drag.startX + dx, drag.startY + dy); }
});
function endDrag() { drag = null; emblem.classList.remove('dragging'); }
emblem.addEventListener('pointerup', endDrag);
emblem.addEventListener('pointercancel', () => { suppressClick = false; endDrag(); });
emblem.addEventListener('lostpointercapture', endDrag);
emblem.addEventListener('click', () => {
  if (suppressClick) { suppressClick = false; return; }
  pokeAt = sceneTime;
  moveEmblem(dragX + (dragX > 0 ? -12 : 12), dragY - 8);
});
emblem.addEventListener('keydown', event => {
  const step = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[event.key];
  if (event.key === 'Home') { event.preventDefault(); moveEmblem(0, 0); }
  else if (step) { event.preventDefault(); moveEmblem(dragX + step[0], dragY + step[1]); }
});
window.addEventListener('resize', () => moveEmblem(dragX, dragY));

// Sound is invited once per tab session. Declining never installs a later gesture unlock.
function closeInvitation() {
  if (invitation.open) invitation.close();
  if (!showMission()) sound.focus({ preventScroll: true });
}
function showMission() {
  if (missionSeen) return false;
  missionInvitation.showModal();
  document.querySelector('#mission-explore').focus({ preventScroll: true });
  return true;
}
function finishMission() {
  missionSeen = true;
  try { sessionStorage.setItem('droidxr-mission-seen', '1'); } catch {}
  missionInvitation.close();
  document.querySelector('#hero-title').focus({ preventScroll: true });
}
for (const id of ['mission-explore', 'mission-skip', 'mission-close']) document.getElementById(id).addEventListener('click', finishMission);
missionInvitation.addEventListener('cancel', event => { event.preventDefault(); finishMission(); });
function continueSilently() {
  restoreMusic = false;
  audio.pause(); saveSoundChoice('silent');
  root.dataset.autoplay = 'declined';
  closeInvitation();
}
document.querySelector('#sound-approve').addEventListener('click', () => {
  saveSoundChoice('enabled'); video.muted = true;
  analyse(audio);
  audio.play().then(() => { root.dataset.autoplay = 'approved'; }, musicBlocked);
  closeInvitation();
});
document.querySelector('#sound-decline').addEventListener('click', continueSilently);
document.querySelector('#sound-close').addEventListener('click', continueSilently);
invitation.addEventListener('cancel', event => { event.preventDefault(); continueSilently(); });
for (const dialog of [invitation, missionInvitation]) dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const buttons = dialog.querySelectorAll('button'), first = buttons[0], last = buttons[buttons.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
// Native media pause is also an explicit choice unless video sound temporarily took over.
audio.addEventListener('pause', () => { if (!restoreMusic) saveSoundChoice('silent'); });
let soundChoice, missionSeen = false;
try {
  soundChoice = sessionStorage.getItem('droidxr-sound-choice');
  missionSeen = sessionStorage.getItem('droidxr-mission-seen') === '1';
} catch {}
if (soundChoice === 'enabled') {
  audio.play().then(() => { root.dataset.autoplay = 'allowed'; }, () => {
    root.dataset.autoplay = 'blocked'; musicBlocked();
  });
  showMission();
} else if (soundChoice === 'silent') { root.dataset.autoplay = 'declined'; showMission(); }
else { root.dataset.autoplay = 'awaiting-choice'; invitation.showModal(); }
