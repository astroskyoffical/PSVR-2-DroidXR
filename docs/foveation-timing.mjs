/*
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project portions only; see https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/LICENSE-SCOPE.md
License: https://www.gnu.org/licenses/gpl-3.0.html
*/
import {energyAt,eventAt} from './visual-data.mjs';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t)};
export const edgePlans=[];
let at=0;
for(const [i,duration] of [.88,1.05,1.08,1.35,.95,1.05,1.05].entries()){
  edgePlans.push({id:'render-'+i,offset:at,duration,kind:'image'});at+=duration+.18;
}
edgePlans.push({id:'eye-bridge',offset:.75,duration:1.10,kind:'gaze'},
 {id:'bridge-record',offset:2.03,duration:1.15,kind:'gaze'},
 {id:'gaze-dxvk',offset:3.36,duration:2.20,kind:'gaze'},
 {id:'gaze-monado',offset:3.36,duration:2.55,kind:'gaze'},
 {id:'api',offset:.60,duration:3.10,kind:'api'});
export function smoothedEnergy(energy,time){return(energyAt(energy,time-.85)+energyAt(energy,time)*2+energyAt(energy,time+.85))/4}
export function makeSchedule(cues){
  const candidates=cues.events.filter(e=>(e.event_type==='beat_candidate'&&e.provenance==='local_grid_onset_snap'&&e.strength>=.15)||(e.event_type==='drop_candidate'&&e.strength>=.8));
  const schedule=[];let last=-100;
  for(const event of candidates){
    const t=event.time_seconds,energy=smoothedEnergy(cues.energy,t),gap=t-last;
    if(gap<3.8)continue;
    if(gap<7.6-energy*2&&event.event_type!=='drop_candidate')continue;
    schedule.push({time:t+.18+(1-energy)*.16,cueTime:t,strength:clamp(.32+energy*.5+event.strength*.18),cueType:event.event_type});
    last=t;
  }
  return schedule;
}
function upperBound(a,t){let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>>1;if(a[m].time<=t)lo=m+1;else hi=m}return lo}
export function sampleFlow(time,cues,schedule,connections){
  const e=smoothedEnergy(cues.energy,time),drop=eventAt(cues.drops,time),age=drop?time-drop.time_seconds:100;
  const dropEnvelope=age>=0&&age<10?smooth(age/.8)*Math.exp(-Math.max(0,age-.8)/2.6):0;
  const end=upperBound(schedule,time),recent=schedule.slice(Math.max(0,end-4),end).filter(x=>time-x.time<11);
  const packets=[],arrivals=[],glows={};
  for(const launch of recent){
    const amplitude=clamp(launch.strength*(.72+e*.28)+dropEnvelope*.16);
    arrivals.push({node:'game',time:launch.time,amplitude,kind:'image'},{node:'eyes',time:launch.time+.75,amplitude,kind:'gaze'});
    for(const plan of edgePlans){
      const connection=connections.find(x=>x.id===plan.id),start=launch.time+plan.offset,finish=start+plan.duration,local=time-start;
      arrivals.push({node:connection.target,time:finish,amplitude,kind:plan.kind,edge:plan.id});
      if(local>=0&&local<=plan.duration+.30)packets.push({id:plan.id,start,finish,progress:clamp(local/plan.duration),drain:clamp((local-plan.duration)/.30),amplitude:amplitude*smooth(local/.15),headOpacity:local>plan.duration?1-smooth((local-plan.duration)/.10):1,launchTime:launch.time});
    }
  }
  for(const a of arrivals){const age=time-a.time;if(age<0||age>2.0)continue;const envelope=smooth(age/.24)*Math.exp(-Math.max(0,age-.24)/.70);glows[a.node]=Math.max(glows[a.node]||0,a.amplitude*envelope)}
  return{time,energy:e,dropEnvelope,packets,arrivals,glows};
}
