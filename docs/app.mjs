import { normalizeCueData, findSectionIndexAt } from "./cue-data.mjs";

const $ = selector => document.querySelector(selector);
const audio = $("#audio"), canvas = $("#energy-chart"), seek = $("#timeline-seek"), status = $("#audio-status");
const sceneTrack = $("#scene-track"), stage = $(".device-stage"), headset = $(".headset");
const expectedBytes = 21713723, expectedDuration = 1306.586848;
let cues = normalizeCueData(null), cuesLoaded = false, cuesActive = false;
let cueNotice = "Confirming the supplied mix before showing its cue map.";
let sourceVersion = 0, sourceBytes = null, sourceFile = null, objectUrl = null;
let reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let motionEnabled = !reducedMotion, waiting = true, seeking = false, frameId = 0, lastFrameAt = 0;
let lastSeenEvent = -Infinity, lastPulseAt = -Infinity, pulseSize = 0, smoothedSignal = .25;

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function setStatus(message, kind = "") { status.textContent = message; status.dataset.kind = kind; }
function duration() { return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : cues.duration_seconds || expectedDuration; }
function setCueNotice(message) { cueNotice = message; drawEnergy(); renderScenes(); syncTime(); }

function drawEnergy() {
  const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  if (!rect.width || !rect.height) return;
  canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
  const w = rect.width, h = rect.height, pad = 13;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#252d29"; ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) { const y = Math.round(h * i / 4) + .5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  if (!cuesActive || !cues.energy.length) { $("#timeline-empty").textContent = cueNotice; $("#timeline-empty").hidden = false; return; }
  $("#timeline-empty").hidden = true;
  const span = duration(), values = cues.energy;
  ctx.beginPath();
  values.forEach((cue, index) => {
    const x = pad + cue.time_seconds / span * (w - pad * 2), y = h - pad - cue.energy * (h - pad * 2);
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(w - pad, h - pad); ctx.lineTo(pad, h - pad); ctx.closePath();
  const fill = ctx.createLinearGradient(0, 0, 0, h); fill.addColorStop(0, "#a9ffca28"); fill.addColorStop(1, "#a9ffca02");
  ctx.fillStyle = fill; ctx.fill();
  ctx.beginPath();
  values.forEach((cue, index) => {
    const x = pad + cue.time_seconds / span * (w - pad * 2), y = h - pad - cue.energy * (h - pad * 2);
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#9bdbb4"; ctx.globalAlpha = .77; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
}

function renderScenes() {
  if (!cuesActive || !cues.sections.length) {
    const note = document.createElement("div"); note.className = "scene-placeholder";
    const index = document.createElement("span"); index.textContent = "--";
    const text = document.createElement("p"); text.textContent = cueNotice;
    note.append(index, text); sceneTrack.replaceChildren(note); return;
  }
  sceneTrack.replaceChildren(...cues.sections.map((section, index) => {
    const label = section.label || section.scene || `Scene ${index + 1}`;
    const button = document.createElement("button"); button.type = "button"; button.className = "scene-card";
    button.dataset.index = index; button.setAttribute("aria-label", `Seek to ${label}, ${formatTime(section.start_seconds)}`);
    button.title = `${label} | ${formatTime(section.start_seconds)} - ${formatTime(section.end_seconds)}`;
    const number = document.createElement("span"); number.className = "scene-index"; number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("div"); name.className = "scene-name"; name.textContent = label;
    const time = document.createElement("div"); time.className = "scene-time"; time.textContent = `${formatTime(section.start_seconds)} - ${formatTime(section.end_seconds)}`;
    button.append(number, name, time); button.addEventListener("click", () => seekTo(section.start_seconds));
    return button;
  }));
}

function intervalAt(items, time) {
  let low = 0, high = items.length;
  while (low < high) { const mid = (low + high) >>> 1; if (items[mid].start_seconds <= time) low = mid + 1; else high = mid; }
  const cue = items[low - 1];
  return cue && time < cue.end_seconds ? cue : null;
}
function latestEventAt(events, time) {
  let low = 0, high = events.length;
  while (low < high) { const mid = (low + high) >>> 1; if (events[mid].time_seconds <= time) low = mid + 1; else high = mid; }
  return events[low - 1] || null;
}
function energyAt(time) {
  const values = cues.energy;
  if (!values.length) return 0;
  let low = 0, high = values.length;
  while (low < high) { const mid = (low + high) >>> 1; if (values[mid].time_seconds < time) low = mid + 1; else high = mid; }
  const before = values[Math.max(0, low - 1)], after = values[Math.min(values.length - 1, low)];
  if (before === after || after.time_seconds <= before.time_seconds) return before.energy;
  const amount = Math.max(0, Math.min(1, (time - before.time_seconds) / (after.time_seconds - before.time_seconds)));
  return before.energy + (after.energy - before.energy) * amount;
}

function updateReadouts(now) {
  const currentIndex = findSectionIndexAt(cues.sections, now), section = cues.sections[currentIndex];
  const sceneName = section?.label || section?.scene || "No mapped scene";
  $("#scene-value").textContent = sceneName;
  $("#hero-scene").textContent = section ? String(section.scene || section.label).toUpperCase() : "DEVICE STUDY";
  stage.dataset.scene = section ? String(section.scene || section.label).toLowerCase().replace(/[^a-z0-9]+/g, "-") : "standby";
  const tempo = intervalAt(cues.tempo, now);
  $("#tempo-value").textContent = tempo ? `${Math.round(tempo.bpm)} BPM / ${Math.round((tempo.confidence || 0) * 100)}%` : "No estimate";
  const alternatives = tempo?.alternatives_bpm?.slice(0, 2).map(value => Math.round(value));
  const alternativeText = alternatives?.length ? `Alt: ${alternatives.join(" / ")} BPM` : "No alternatives in this segment";
  $("#tempo-alternatives").textContent = alternativeText; $("#tempo-alternatives").title = alternativeText;
  const event = latestEventAt(cues.events, now);
  $("#event-value").textContent = event && now - event.time_seconds <= 5
    ? `${String(event.event_type || "Audio cue").replace(/[_-]+/g, " ")} / ${Math.round((event.confidence || 0) * 100)}%`
    : "No recent cue";
  sceneTrack.querySelectorAll(".scene-card").forEach((button, index) => {
    if (index === currentIndex) button.setAttribute("aria-current", "true"); else button.removeAttribute("aria-current");
  });
}

function syncTime() {
  const now = Number.isFinite(audio.currentTime) ? audio.currentTime : 0, total = duration();
  seek.max = String(total); seek.value = String(now); seek.setAttribute("aria-valuetext", formatTime(now));
  $("#current-time").textContent = formatTime(now); $("#end-time").textContent = formatTime(total);
  if (!cuesActive || seeking || audio.seeking) return;
  updateReadouts(now);
}
function seekTo(seconds) { audio.currentTime = Math.max(0, Math.min(duration(), Number(seconds) || 0)); }

function setMotionVariables(time, level) {
  const bounded = Math.max(0, Math.min(1, level));
  stage.style.setProperty("--cable-width", `${(7 + bounded * 1.4).toFixed(2)}px`);
  stage.style.setProperty("--trace-offset", `${(-time * 1.5).toFixed(2)}px`);
  headset.setAttribute("transform", `translate(84 130) translate(241 150) scale(1 ${(1 + bounded * .0025).toFixed(4)}) translate(-241 -150)`);
}
function setMotion(enabled) {
  motionEnabled = Boolean(enabled) && !reducedMotion;
  $("#motion-toggle").setAttribute("aria-checked", String(motionEnabled));
  $("#motion-label").textContent = motionEnabled ? "GENTLE" : "REDUCED";
  stage.classList.toggle("motion-enabled", motionEnabled);
  if (!motionEnabled) {
    stopMotion(); stage.style.removeProperty("--cable-width"); stage.style.removeProperty("--trace-offset");
    headset.setAttribute("transform", "translate(84 130)");
  } else if (cuesActive) setMotionVariables(audio.currentTime || 0, .25 + energyAt(audio.currentTime || 0) * .38);
  startMotion();
}
function canAnimate() { return cuesActive && motionEnabled && !document.hidden && !audio.paused && audio.readyState >= 2 && !waiting && !seeking && !audio.seeking; }
function stopMotion() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; lastFrameAt = 0; }
function startMotion() {
  if (canAnimate() && !frameId) { lastFrameAt = 0; frameId = requestAnimationFrame(animateMotion); }
}
function animateMotion(timestamp) {
  frameId = 0;
  if (!canAnimate()) return;
  if (lastFrameAt && timestamp - lastFrameAt < 33) { frameId = requestAnimationFrame(animateMotion); return; }
  const elapsed = lastFrameAt ? Math.min(.1, (timestamp - lastFrameAt) / 1000) : 1 / 30;
  lastFrameAt = timestamp;
  const now = audio.currentTime, event = latestEventAt(cues.events, now);
  if (event && event.time_seconds > lastSeenEvent) {
    lastSeenEvent = event.time_seconds;
    if (event.time_seconds - lastPulseAt >= .72) {
      lastPulseAt = event.time_seconds;
      pulseSize = Math.min(.18, .04 + Math.max(0, Math.min(1, event.confidence || 0)) * .14);
    }
  }
  const age = now - lastPulseAt, pulse = age >= 0 && age < .62 ? pulseSize * (1 - age / .62) : 0;
  const target = .24 + energyAt(now) * .38 + pulse;
  smoothedSignal += (target - smoothedSignal) * (1 - Math.exp(-elapsed / .28));
  setMotionVariables(now, smoothedSignal);
  frameId = requestAnimationFrame(animateMotion);
}
function resetMotionAt(time) {
  if (!motionEnabled || !cuesActive) return;
  smoothedSignal = .24 + energyAt(time) * .38;
  lastSeenEvent = latestEventAt(cues.events, time)?.time_seconds ?? -Infinity;
  lastPulseAt = -Infinity; pulseSize = 0;
  setMotionVariables(time, smoothedSignal);
}

function cueMapUnavailable(message) {
  cuesActive = false; stopMotion(); cueNotice = message;
  $("#previous-chapter").disabled = true; $("#next-chapter").disabled = true;
  stage.dataset.scene = "standby"; $("#hero-scene").textContent = "DEVICE STUDY";
  $("#scene-value").textContent = "Audio not matched";
  $("#tempo-value").textContent = "— BPM"; $("#tempo-alternatives").textContent = "No cue map available";
  $("#event-value").textContent = "No cue map available";
  if (motionEnabled) { stage.style.removeProperty("--cable-width"); stage.style.removeProperty("--trace-offset"); headset.setAttribute("transform", "translate(84 130)"); }
  drawEnergy(); renderScenes(); syncTime(); setStatus(message, "error");
}
function tryActivateCueMap() {
  if (!cuesLoaded) return;
  const bytes = sourceFile ? sourceFile.size : sourceBytes;
  if (bytes == null) { setCueNotice("Confirming audio file size before showing its cue map."); return; }
  if (bytes !== expectedBytes) { cueMapUnavailable("This file does not match the supplied mix; its cue map is disabled."); return; }
  if (!Number.isFinite(cues.duration_seconds) || Math.abs(cues.duration_seconds - expectedDuration) > .05) { cueMapUnavailable("Cue data does not match the supplied mix duration; its map is disabled."); return; }
  if (!Number.isFinite(audio.duration)) { setCueNotice("Waiting for audio duration to confirm the cue map."); return; }
  if (Math.abs(audio.duration - expectedDuration) > .05) { cueMapUnavailable("Audio duration does not match the supplied mix; its cue map is disabled."); return; }
  cuesActive = true; cueNotice = "Audio energy cues are unavailable.";
  $("#previous-chapter").disabled = false; $("#next-chapter").disabled = false;
  drawEnergy(); renderScenes(); syncTime();
  setStatus(audio.paused ? "Audio matches cue-map metadata. Press play when you are ready." : "Playing audio that matches cue-map metadata.");
  resetMotionAt(audio.currentTime || 0); startMotion();
}
async function readBundledAssetSize() {
  let response = await fetch("assets/mix.mp3", { method: "HEAD" });
  if (!response.ok) throw new Error("asset size unavailable");
  let size = Number(response.headers.get("content-length"));
  if (size > 0) return size;
  response = await fetch("assets/mix.mp3", { headers: { Range: "bytes=0-0" } });
  const total = Number(response.headers.get("content-range")?.split("/").pop());
  await response.body?.cancel();
  if (!total) throw new Error("asset size unavailable");
  return total;
}
function beginBundledValidation() {
  const version = ++sourceVersion;
  sourceFile = null; sourceBytes = null; cuesActive = false;
  setCueNotice("Confirming the supplied mix before showing its cue map.");
  readBundledAssetSize().then(size => {
    if (version !== sourceVersion) return;
    sourceBytes = size; tryActivateCueMap();
  }).catch(() => {
    if (version !== sourceVersion) return;
    cueMapUnavailable("Could not verify the supplied audio file size; its cue map is disabled.");
    setStatus("Could not verify the supplied mix. Open the original local audio file to enable its cue map.", "error");
  });
}

$("#previous-chapter").addEventListener("click", () => {
  const now = audio.currentTime || 0, index = findSectionIndexAt(cues.sections, now);
  if (index >= 0 && now - cues.sections[index].start_seconds > 3) return seekTo(cues.sections[index].start_seconds);
  const previous = [...cues.sections].reverse().find(section => section.start_seconds < now - 1);
  seekTo(previous?.start_seconds || 0);
});
$("#next-chapter").addEventListener("click", () => {
  const next = cues.sections.find(section => section.start_seconds > (audio.currentTime || 0) + 1);
  if (next) seekTo(next.start_seconds);
});
$("#mute-toggle").addEventListener("click", event => {
  audio.muted = !audio.muted; event.currentTarget.setAttribute("aria-pressed", String(audio.muted)); event.currentTarget.textContent = audio.muted ? "Unmute" : "Mute";
});
$("#motion-toggle").addEventListener("click", () => setMotion(!motionEnabled));
seek.addEventListener("input", () => seekTo(Number(seek.value)));
audio.addEventListener("timeupdate", syncTime); audio.addEventListener("seeked", () => {
  seeking = false; syncTime(); resetMotionAt(audio.currentTime || 0); startMotion();
});
audio.addEventListener("seeking", () => { seeking = true; stopMotion(); });
audio.addEventListener("loadedmetadata", () => {
  $("#duration-label").textContent = formatTime(audio.duration); $("#end-time").textContent = formatTime(audio.duration);
  seek.max = String(audio.duration); tryActivateCueMap();
});
audio.addEventListener("durationchange", tryActivateCueMap);
audio.addEventListener("play", () => { waiting = false; setStatus(cuesActive ? "Playing audio that matches cue-map metadata." : "Playing audio; cue-map matching is in progress."); startMotion(); });
audio.addEventListener("playing", () => { waiting = false; startMotion(); });
audio.addEventListener("canplay", () => { waiting = false; startMotion(); });
audio.addEventListener("pause", () => { stopMotion(); if (!audio.ended) setStatus("Playback paused."); });
audio.addEventListener("waiting", () => { waiting = true; stopMotion(); setStatus("Buffering audio."); });
audio.addEventListener("ended", () => { stopMotion(); setStatus("Mix complete."); });
audio.addEventListener("error", () => { cueMapUnavailable("Audio could not load; its cue map is disabled."); setStatus("The supplied mix could not load. Open the original local audio file to continue.", "error"); });
$("#file-button").addEventListener("click", () => $("#file-input").click());
$("#file-input").addEventListener("change", event => {
  const file = event.target.files?.[0]; if (!file) return;
  sourceVersion++; sourceFile = file; sourceBytes = null; cuesActive = false;
  cueMapUnavailable("Checking the selected file before enabling the cue map.");
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file); audio.src = objectUrl; audio.load();
  if (file.size !== expectedBytes) {
    cueMapUnavailable("This file does not match the supplied mix; its cue map is disabled.");
    setStatus("Local audio loaded, but its file size does not match the cue map.", "error");
  } else setStatus("Checking local audio duration against the cue map.");
});
window.addEventListener("resize", drawEnergy);
document.addEventListener("visibilitychange", () => { if (document.hidden) stopMotion(); else startMotion(); });
matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", event => { reducedMotion = event.matches; setMotion(!reducedMotion); });
setMotion(!reducedMotion); drawEnergy(); renderScenes(); syncTime();
fetch("cues.json").then(response => { if (!response.ok) throw new Error("cue file unavailable"); return response.json(); }).then(raw => {
  cues = normalizeCueData(raw); cuesLoaded = true;
  const dataDuration = cues.duration_seconds || expectedDuration;
  $("#duration-label").textContent = formatTime(dataDuration); $("#end-time").textContent = formatTime(dataDuration); seek.max = String(dataDuration);
  tryActivateCueMap();
}).catch(() => {
  cuesLoaded = false; cueMapUnavailable("Cue data could not load. Audio playback is still available.");
  setStatus("Cue data is unavailable. Audio controls remain ready.", "error");
});
beginBundledValidation();
