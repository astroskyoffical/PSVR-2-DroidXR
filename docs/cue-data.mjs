export function normalizeCueData(input) {
  if (!input || typeof input !== "object") return emptyCueData();
  const numeric = value => value == null || value === "" ? null : Number.isFinite(Number(value)) ? Number(value) : null;
  const energy = (Array.isArray(input.energy) ? input.energy : [])
    .filter(cue => cue && typeof cue === "object")
    .map(cue => ({ ...cue, time_seconds: numeric(cue.time_seconds), energy: numeric(cue.energy), rms_db: numeric(cue.rms_db), bass_energy: numeric(cue.bass_energy) }))
    .filter(cue => cue.time_seconds !== null && cue.energy !== null)
    .map(cue => ({ ...cue, energy: Math.max(0, Math.min(1, cue.energy)) }))
    .sort((a, b) => a.time_seconds - b.time_seconds);
  const tempo = (Array.isArray(input.tempo) ? input.tempo : [])
    .filter(cue => cue && typeof cue === "object")
    .map(cue => ({ ...cue, start_seconds: numeric(cue.start_seconds), end_seconds: numeric(cue.end_seconds), bpm: numeric(cue.bpm), confidence: numeric(cue.confidence) }))
    .filter(cue => cue.start_seconds !== null && cue.end_seconds > cue.start_seconds && cue.bpm > 0)
    .sort((a, b) => a.start_seconds - b.start_seconds);
  const events = (Array.isArray(input.events) ? input.events : [])
    .filter(cue => cue && typeof cue === "object")
    .map(cue => ({ ...cue, time_seconds: numeric(cue.time_seconds) }))
    .filter(cue => cue.time_seconds !== null)
    .sort((a, b) => a.time_seconds - b.time_seconds);
  const sections = (Array.isArray(input.sections) ? input.sections : [])
    .filter(cue => cue && typeof cue === "object")
    .map(cue => ({ ...cue, start_seconds: numeric(cue.start_seconds), end_seconds: numeric(cue.end_seconds) }))
    .filter(cue => cue.start_seconds !== null && cue.end_seconds > cue.start_seconds)
    .sort((a, b) => a.start_seconds - b.start_seconds);
  return { duration_seconds: numeric(input.duration_seconds), energy, tempo, events, sections };
}

export function findSectionIndexAt(sections, timeSeconds) {
  let low = 0, high = sections.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (sections[mid].start_seconds <= timeSeconds) low = mid + 1;
    else high = mid;
  }
  const index = low - 1;
  return index >= 0 && timeSeconds < sections[index].end_seconds ? index : -1;
}

function emptyCueData() { return { duration_seconds: null, energy: [], tempo: [], events: [], sections: [] }; }
