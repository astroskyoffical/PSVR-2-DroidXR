/*
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project portions only; see https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/LICENSE-SCOPE.md
License: https://www.gnu.org/licenses/gpl-3.0.html
*/
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {normalizeVisualData} from './visual-data.mjs';
import {edgePlans,makeSchedule,sampleFlow} from './foveation-timing.mjs';
const base=new URL('./',import.meta.url),raw=JSON.parse(await fs.readFile(new URL('cues.json',base),'utf8'));
const cues=normalizeVisualData(raw);cues.drops=cues.events.filter(e=>e.event_type==='drop_candidate');
const html=await fs.readFile(new URL('index.html',base),'utf8');
const connections=[...html.matchAll(/data-edge="([^"]+)" data-source="([^"]+)" data-target="([^"]+)"/g)].slice(0,12).map(m=>({id:m[1],source:m[2],target:m[3]}));
const schedule=makeSchedule(cues),sourceTimes=new Set(cues.events.map(e=>e.time_seconds));
assert.equal(connections.length,12);assert(schedule.length>100&&schedule.length<300);
const intervals=[];for(let i=0;i<schedule.length;i++){const l=schedule[i];assert(sourceTimes.has(l.cueTime));assert(l.time-l.cueTime>=.179&&l.time-l.cueTime<=.341);assert(l.time<=cues.duration_seconds);if(i){intervals.push(l.time-schedule[i-1].time);assert(intervals.at(-1)>3.6)}}
const images=edgePlans.filter(e=>e.kind==='image');for(let i=1;i<images.length;i++)assert(Math.abs(images[i].offset-images[i-1].offset-images[i-1].duration-.18)<1e-9);
assert.equal(edgePlans.find(e=>e.id==='gaze-dxvk').offset,edgePlans.find(e=>e.id==='gaze-monado').offset);
assert(Math.abs(edgePlans.find(e=>e.id==='bridge-record').offset+1.15+.18-3.36)<1e-9);
const isolated=[{time:0,strength:.8,cueTime:0}],before=sampleFlow(.87,cues,isolated,connections),after=sampleFlow(1.03,cues,isolated,connections);
assert(!before.glows.dxvk);assert(after.glows.dxvk>0);
let samples=0,maxPackets=0,maxNodes=0;const signatures=[];
for(let t=0;t<=cues.duration_seconds;t+=.25){const s=sampleFlow(t,cues,schedule,connections);samples++;maxPackets=Math.max(maxPackets,s.packets.length);maxNodes=Math.max(maxNodes,Object.keys(s.glows).length);assert.equal(new Set(s.packets.map(p=>p.id)).size,s.packets.length);for(const p of s.packets){assert(Number.isFinite(p.amplitude)&&p.amplitude>=0&&p.amplitude<=1&&p.progress>=0&&p.progress<=1);const plan=edgePlans.find(x=>x.id===p.id);assert(Math.abs(p.finish-p.start-plan.duration)<1e-9)}for(const value of Object.values(s.glows))assert(value>=0&&value<=1);if(samples%211===0)signatures.push({t,json:JSON.stringify(s)})}
// Revisit times in reverse to model arbitrary seeking without mutable phase state.
for(const s of signatures.reverse())assert.equal(JSON.stringify(sampleFlow(s.t,cues,schedule,connections)),s.json);
const average=(a,z)=>{let e=0,n=0;for(let t=a;t<z;t+=.25){e+=sampleFlow(t,cues,schedule,connections).energy;n++}return e/n};
const quiet=average(233,240),strong=average(246,258);assert(strong>quiet+.4);
const result={status:'PASS',duration_seconds:cues.duration_seconds,sampled_times:samples,sample_step_seconds:.25,real_time_full_song_playback:false,
 launches:schedule.length,min_launch_interval:Math.min(...intervals),max_launch_interval:Math.max(...intervals),mean_launch_interval:intervals.reduce((a,b)=>a+b,0)/intervals.length,
 minimum_travel_seconds:Math.min(...edgePlans.map(p=>p.duration)),maximum_travel_seconds:Math.max(...edgePlans.map(p=>p.duration)),image_chain_seconds:images.at(-1).offset+images.at(-1).duration,
 max_concurrent_packets:maxPackets,max_active_node_envelopes:maxNodes,quiet_mean_energy:quiet,strong_mean_energy:strong,
 cue_anchored:true,arrival_causality:true,seek_deterministic:true,render_and_gaze_independent:true};
console.log(JSON.stringify(result));
