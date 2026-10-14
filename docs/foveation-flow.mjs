/*
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project portions only; see https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/LICENSE-SCOPE.md
License: https://www.gnu.org/licenses/gpl-3.0.html
*/
import {makeSchedule,sampleFlow} from './foveation-timing.mjs';
const figure=document.querySelector('#foveation-flow'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:600px)');
const ns='http://www.w3.org/2000/svg';
const diagrams=[...(figure?.querySelectorAll('.flow-svg')||[])].map(svg=>({svg,
 edges:[...svg.querySelectorAll('.flow-connection')].map(g=>{
   const wire=g.querySelector('.flow-wire'),length=wire.getTotalLength(),tail=Math.max(8,Math.min(55,1600/length));
   const head=document.createElementNS(ns,'circle'),halo=document.createElementNS(ns,'circle');head.setAttribute('class','flow-head');halo.setAttribute('class','flow-head-bloom');
   halo.setAttribute('filter',g.querySelector('.flow-bloom').getAttribute('filter'));g.append(halo,head);
   const core=g.querySelector('.flow-core'),bloom=g.querySelector('.flow-bloom');core.style.strokeDasharray=bloom.style.strokeDasharray=`${tail} 200`;
   return{g,id:g.dataset.edge,source:g.dataset.source,target:g.dataset.target,wire,length,start:wire.getPointAtLength(0),tail,core,bloom,head,halo};
 }),nodes:[...svg.querySelectorAll('.flow-node')].map(g=>({g,charge:g.querySelector('.flow-node-charge'),halo:g.querySelector('.flow-node-halo')}))}));
const connections=diagrams[0]?.edges.map(({id,source,target})=>({id,source,target}))||[];
let cues={events:[],energy:[],drops:[],duration_seconds:0},schedule=[],inView=false,dirty=false;
if(figure)new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(!inView)resetFlow();},{rootMargin:'40px'}).observe(figure);
export function configureFlow(data){cues={...data,drops:data.events.filter(e=>e.event_type==='drop_candidate')};schedule=makeSchedule(cues)}
function hideEdge(e){e.core.style.opacity=e.bloom.style.opacity=e.head.style.opacity=e.halo.style.opacity='0';for(const c of[e.head,e.halo]){c.setAttribute('cx',e.start.x.toFixed(3));c.setAttribute('cy',e.start.y.toFixed(3))}}
function clear(d){for(const e of d.edges)hideEdge(e);for(const n of d.nodes)n.charge.style.opacity=n.halo.style.opacity='0'}
export function resetFlow(){if(dirty)diagrams.forEach(clear);dirty=false;if(figure)figure.dataset.active='false'}
function draw(time){
  const d=diagrams[small.matches?1:0],other=diagrams[small.matches?0:1];if(other.svg.dataset.active==='true'){clear(other);other.svg.dataset.active='false'}
  const sample=sampleFlow(time,cues,schedule,connections);
  for(const e of d.edges){
    const p=sample.packets.find(p=>p.id===e.id);
    if(!p){hideEdge(e);continue;}
    const point=e.wire.getPointAtLength(e.length*p.progress),offset=e.tail-p.progress*100-p.drain*e.tail;
    e.core.style.strokeDashoffset=e.bloom.style.strokeDashoffset=offset.toFixed(3);
    e.core.style.opacity=(p.amplitude*.94*(1-p.drain*.5)).toFixed(3);e.bloom.style.opacity=(p.amplitude*.26*(1-p.drain)).toFixed(3);
    e.core.style.strokeWidth=(2.1+p.amplitude*.5).toFixed(2);
    for(const circle of[e.head,e.halo]){circle.setAttribute('cx',point.x.toFixed(3));circle.setAttribute('cy',point.y.toFixed(3));circle.style.opacity=(p.amplitude*p.headOpacity*(circle === e.head ? .95 : .24)).toFixed(3);circle.setAttribute('r',circle===e.head?'3.2':'7.5')}
  }
  for(const n of d.nodes){const glow=sample.glows[n.g.dataset.node]||0;n.charge.style.opacity=(glow*.8).toFixed(3);n.halo.style.opacity=(glow*.25).toFixed(3)}
  dirty=true;figure.dataset.active='true';d.svg.dataset.active='true';
}
export function updateFlow(time,playing){
  if(!inView||reduced.matches||document.hidden||document.body.classList.contains('motion-off')){resetFlow();return;}
  if(!playing){if(dirty)figure.dataset.active='paused';return;}
  draw(time);
}
