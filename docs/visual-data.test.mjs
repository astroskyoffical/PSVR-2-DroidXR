/*
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project portions only; see https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/LICENSE-SCOPE.md
License: https://www.gnu.org/licenses/gpl-3.0.html
*/
import assert from"node:assert/strict";import{normalizeVisualData,energyAt,eventAt,pulseAllowed}from"./visual-data.mjs";let d=normalizeVisualData({duration_seconds:10,energy:[null,{time_seconds:4,energy:1.4},{time_seconds:0,energy:-1}],events:[{time_seconds:4,event_type:"drop_candidate"},{time_seconds:1,event_type:"beat_candidate"}]});assert.deepEqual(d.energy,[{time_seconds:0,energy:0},{time_seconds:4,energy:1}]);assert.equal(energyAt(d.energy,2),.5);assert.equal(eventAt(d.events,3).event_type,"beat_candidate");assert.equal(eventAt(d.events,8).event_type,"drop_candidate");assert.equal(pulseAllowed(1,1.71),false);assert.equal(pulseAllowed(1,1.72),true);console.log("cue normalization, timing lookup, and pulse-rate guard passed");
