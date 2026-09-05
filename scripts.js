// scripts.js — render charts, KPIs, map
(function(){
  const data = window.DASHBOARD_DATA;

  // Populate year selector
  const yearSelect = document.getElementById('yearSelect');
  data.years.forEach(y=>{const o=document.createElement('option');o.value=y;o.textContent=y;yearSelect.appendChild(o)});
  yearSelect.value = Math.max(...data.years);

  // KPI cards
  const kpiCards = document.getElementById('kpiCards');
  function renderKPIs(){
    kpiCards.innerHTML = '';
    const k = data.kpis;
    const cards = [
      {title:'Beneficiaries (year to date)', value: k.beneficiaries_total.toLocaleString()},
      {title:'Follow-up rate', value: k.percent_followup + '%'},
      {title:'Active facilities engaged', value: k.active_facilities},
      {title:'Referrals closed', value: k.referrals_closed_rate + '%'}
    ];
    cards.forEach(c=>{
      const el = document.createElement('div'); el.className='kpi';
      el.innerHTML = `<h4>${c.title}</h4><p>${c.value}</p>`;
      kpiCards.appendChild(el);
    });
  }

  // Charts
  let tsChart, regionsChart, severityChart, referralsChart;

  function renderTimeSeries(year){
    const series = data.time_series[year];
    const labels = series.map(s=>s.month);
    const beneficiaries = series.map(s=>s.beneficiaries);
    const referrals = series.map(s=>s.referrals);
    const followups = series.map(s=>s.followups);

    const ctx = document.getElementById('tsChart').getContext('2d');
    if(tsChart) tsChart.destroy();
    tsChart = new Chart(ctx,{type:'line',data:{labels, datasets:[
      {label:'Beneficiaries',data:beneficiaries,borderColor:'#0ea5e9',backgroundColor:'rgba(14,165,233,0.08)',tension:0.3,fill:true},
      {label:'Referrals',data:referrals,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.06)',tension:0.3,fill:true},
      {label:'Follow-ups',data:followups,borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.06)',tension:0.3,fill:true}
    ]}, options:{responsive:true,scales:{x:{display:true},y:{beginAtZero:true}}}});
  }

  function renderRegions(){
    const labels = data.region_summary.map(r=>r.name);
    const cases = data.region_summary.map(r=>r.cases);
    const ctx = document.getElementById('regionsChart').getContext('2d');
    if(regionsChart) regionsChart.destroy();
    regionsChart = new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Reported cases',data:cases,backgroundColor:'#2563eb'}]},options:{indexAxis:'y',responsive:true,scales:{x:{beginAtZero:true}}}});
  }

  function renderSeverity(){
    const labels = ['Mild','Moderate','Severe'];
    const values = [data.severity.mild,data.severity.moderate,data.severity.severe].map(p=>p*100);
    const ctx = document.getElementById('severityChart').getContext('2d');
    if(severityChart) severityChart.destroy();
    severityChart = new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data:values,backgroundColor:['#60a5fa','#34d399','#fb923c']}]},options:{responsive:true}});
  }

  function renderReferrals(year){
    const series = data.time_series[year];
    const labels = series.map(s=>s.month);
    const referrals = series.map(s=>s.referrals);
    const followups = series.map(s=>s.followups);
    const ctx = document.getElementById('referralsChart').getContext('2d');
    if(referralsChart) referralsChart.destroy();
    referralsChart = new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Referrals',data:referrals,backgroundColor:'#7c3aed'},{label:'Follow-ups',data:followups,backgroundColor:'#06b6d4'}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});
  }

  // Map
  function renderMap(){
    const map = L.map('map').setView([5.0,45.5],5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
    data.regions.forEach(r=>{
      const summary = data.region_summary.find(s=>s.id===r.id) || {};
      const circle = L.circle([r.lat,r.lon], {radius: Math.max(8000, (summary.cases||400)*60), color:'#0ea5e9', fillColor:'#60a5fa', fillOpacity:0.4}).addTo(map);
      circle.bindPopup(`<strong>${r.name}</strong><br/>Cases: ${summary.cases||'n/a'}<br/>Facilities: ${summary.facilities||'n/a'}`);
    });
  }

  // Activity table
  function renderActivityTable(){
    const tbody = document.querySelector('#activityTable tbody');
    tbody.innerHTML = '';
    data.activities.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.date}</td><td>${a.region}</td><td>${a.activity}</td><td>${a.count}</td>`;
      tbody.appendChild(tr);
    });
  }

  // Initial render
  function init(){
    // Fix: ensure beneficiaries_total exists
    if(!data.kpis.beneficiaries_total){
      data.kpis.beneficiaries_total = data.time_series[Math.max(...data.years)].reduce((s,d)=>s+d.beneficiaries,0);
    }
    renderKPIs();
    const selectedYear = parseInt(yearSelect.value,10);
    renderTimeSeries(selectedYear);
    renderRegions();
    renderSeverity();
    renderReferrals(selectedYear);
    renderMap();
    renderActivityTable();

    yearSelect.addEventListener('change',()=>{
      const y = parseInt(yearSelect.value,10);
      renderTimeSeries(y); renderReferrals(y);
    });
  }

  document.addEventListener('DOMContentLoaded',init);
})();
