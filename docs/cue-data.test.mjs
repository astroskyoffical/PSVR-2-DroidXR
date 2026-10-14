import assert from "node:assert/strict";
import { normalizeCueData, findSectionIndexAt } from "./cue-data.mjs";

const cues = normalizeCueData({
  duration_seconds: 60,
  energy: [null, { time_seconds: 4, energy: 1.2 }, { time_seconds: 1, energy: -2 }, { time_seconds: "bad", energy: .5 }],
  sections: [
    { start_seconds: 20, end_seconds: 40, label: "Build" },
    { start_seconds: 0, end_seconds: 20, label: "Circuitry" },
    { start_seconds: 40, end_seconds: 60, label: "Reveal" },
    { start_seconds: 50, end_seconds: 45, label: "Invalid" }
  ]
});
assert.deepEqual(cues.energy.map(cue => cue.energy), [0, 1]);
assert.equal(findSectionIndexAt(cues.sections, 0), 0);
assert.equal(findSectionIndexAt(cues.sections, 20), 1);
assert.equal(findSectionIndexAt(cues.sections, 40), 2);
assert.equal(findSectionIndexAt(cues.sections, 60), -1);
console.log("cue normalization and seek boundaries passed");
