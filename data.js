// data.js — dummy M&E data for a UN mental health project in Somalia
const DEMO_REGIONS = [
  { id: 'banadir', name: 'Banadir (Mogadishu)', lat:2.0469, lon:45.3182 },
  { id: 'puntland', name: 'Puntland', lat:8.5000, lon:48.5000 },
  { id: 'somaliland', name: 'Somaliland', lat:9.5000, lon:44.0000 },
  { id: 'jubaland', name: 'Jubaland', lat:0.5000, lon:42.5000 },
  { id: 'southwest', name: 'South West', lat:3.5000, lon:43.0000 },
  { id: 'galmudug', name: 'Galmudug', lat:6.5000, lon:46.0000 }
];

// Years available
const YEARS = [2023, 2024, 2025];

// Generate time-series monthly data for each year
function genMonthlySeries(year){
  const months = Array.from({length:12},(_,i)=>`${year}-${String(i+1).padStart(2,'0')}`);
  let base = 1200 + (year-2023)*200; // growth across years
  return months.map((m,idx)=>({
    month: m,
    beneficiaries: Math.round(base + Math.sin(idx/2)*150 + Math.random()*200),
    referrals: Math.round(80 + Math.random()*60 + idx*2),
    followups: Math.round(40 + Math.random()*40)
  }));
}

const TIME_SERIES = {};
for(const y of YEARS) TIME_SERIES[y] = genMonthlySeries(y);

// Region summary (dummy)
const REGION_SUMMARY = DEMO_REGIONS.map((r,i)=>({
  id: r.id,
  name: r.name,
  cases: 800 + i*250 + Math.round(Math.random()*200),
  facilities: 8 + i + Math.round(Math.random()*4),
  referrals: 120 + i*30
}));

const SEVERITY = {
  mild: 0.52,
  moderate: 0.32,
  severe: 0.16
};

// Sample recent activities list
const ACTIVITIES = [
  {date:'2025-03-01', region:'Banadir (Mogadishu)', activity:'Psychosocial support sessions', count:120},
  {date:'2025-02-22', region:'Puntland', activity:'Community outreach', count:230},
  {date:'2025-02-15', region:'Galmudug', activity:'Training for clinicians', count:18},
  {date:'2025-02-05', region:'Somaliland', activity:'Referrals completed', count:76},
  {date:'2025-01-28', region:'Jubaland', activity:'Mobile clinic visits', count:96}
];

// KPIs (you asked me to decide) — typical M&E indicators for mental health
const KPIS = {
  beneficiaries_total: TIME_SERIES[2025].reduce((s,d)=>s+d.beneficiaries,0),
  percent_followup: Math.round((TIME_SERIES[2025].reduce((s,d)=>s+d.followups,0) / TIME_SERIES[2025].reduce((s,d)=>s+d.referrals,0))*100),
  active_facilities: REGION_SUMMARY.reduce((s,r)=>s+r.facilities,0),
  referrals_closed_rate: 78 // percent (dummy)
};

// Export to global
window.DASHBOARD_DATA = {
  regions: DEMO_REGIONS,
  years: YEARS,
  time_series: TIME_SERIES,
  region_summary: REGION_SUMMARY,
  severity: SEVERITY,
  activities: ACTIVITIES,
  kpis: KPIS
};
