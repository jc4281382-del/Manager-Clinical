let allAppointments = [];
let searchQuery = '';
let filterDay = '';

async function loadDashboard() {
  if (!window.currentProfessionalId) return;
  const pid = window.currentProfessionalId;
  const prof = window.currentProfessional;
  const greetEl = document.getElementById('greetingName');
  if (greetEl) greetEl.innerText = `Olá, ${prof?.preferred_name || prof?.full_name || 'Profissional'}`;
  const dateEl = document.getElementById('currentDate');
  if (dateEl) dateEl.innerText = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const today = new Date().toISOString().split('T')[0];
  const { data: apps, error } = await window.supabase
    .from('appointments')
    .select('id, scheduled_at, appointment_type, value, status, patients(full_name, phone, email)')
    .eq('professional_id', pid)
    .gte('scheduled_at', `${today}T00:00:00`)
    .lte('scheduled_at', `${today}T23:59:59`)
    .order('scheduled_at', { ascending: true });
  if (error) { console.error(error); return; }
  allAppointments = apps || [];
  updateStats(allAppointments);
  renderAppointments(allAppointments);
}

function updateStats(apps) {
  const counts = { Agendado:0, Confirmado:0, Realizado:0, Cancelado:0, Faltou:0 };
  let revenue = 0;
  apps.forEach(a => {
    counts[a.status] = (counts[a.status] || 0) + 1;
    if (a.status === 'Realizado') revenue += (a.value || 0);
  });
  setText('statTotal', String(apps.length).padStart(2,'0'));
  setText('statRevenue', `R$ ${revenue.toLocaleString('pt-BR',{minimumFractionDigits:2})}`);
  setText('statRealizados', String(counts['Realizado']).padStart(2,'0'));
  setText('statCancelados', String(counts['Cancelado']).padStart(2,'0'));
  setText('statFaltou', String(counts['Faltou']).padStart(2,'0'));
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.innerText = val; }

function renderAppointments(apps) {
  const tbody = document.getElementById('appointmentsTbody');
  if (!tbody) return;
  let filtered = apps;
  if (searchQuery) filtered = filtered.filter(a => (a.patients?.full_name||'').toLowerCase().includes(searchQuery.toLowerCase()));
  if (filterDay) {
    const days = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
    filtered = filtered.filter(a => days[new Date(a.scheduled_at).getDay()].startsWith(filterDay.toLowerCase()));
  }
  if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-on-surface-variant">Nenhum compromisso encontrado.</td></tr>`; return; }
  tbody.innerHTML = filtered.map(a => {
    const time = new Date(a.scheduled_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const name = a.patients?.full_name || '—';
    const ini = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    const sc = {Realizado:'bg-emerald-50 text-emerald-700 border-emerald-200',Confirmado:'bg-blue-50 text-blue-700 border-blue-200',Agendado:'bg-slate-100 text-slate-600 border-slate-200',Cancelado:'bg-red-50 text-red-700 border-red-200',Faltou:'bg-amber-50 text-amber-700 border-amber-200'}[a.status]||'bg-slate-100 text-slate-600 border-slate-200';
    return `<tr class="hover:bg-slate-50/50 transition-colors ${a.status==='Cancelado'?'opacity-60':''}">
      <td class="px-4 py-4 font-bold text-primary whitespace-nowrap">${time}</td>
      <td class="px-4 py-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">${ini}</div><div><p class="font-semibold text-on-surface text-sm">${name}</p><p class="text-xs text-on-surface-variant">${a.appointment_type}</p></div></div></td>
      <td class="px-4 py-4 font-semibold text-sm">R$ ${(a.value||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
      <td class="px-4 py-4"><select onchange="updateStatus('${a.id}',this.value)" class="cursor-pointer text-xs font-bold px-2 py-1 rounded-full border ${sc} appearance-none outline-none">${['Agendado','Confirmado','Realizado','Cancelado','Faltou'].map(s=>`<option value="${s}" ${a.status===s?'selected':''}>${s}</option>`).join('')}</select></td>
      <td class="px-4 py-4"><button onclick="openEdit('${a.id}')" class="text-primary hover:underline font-bold text-sm">Editar</button></td>
    </tr>`;
  }).join('');
}

window.updateStatus = async (id, status) => {
  const { error } = await window.supabase.from('appointments').update({status}).eq('id',id);
  if (error) { Swal.fire({icon:'error',title:'Erro',text:error.message}); return; }
  allAppointments = allAppointments.map(a => a.id===id ? {...a,status} : a);
  updateStats(allAppointments); renderAppointments(allAppointments);
};

window.openEdit = (id) => { const app = allAppointments.find(a=>a.id===id); if (app && window.openAppointmentModal) window.openAppointmentModal(app); };

document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => {
    loadDashboard();
    document.getElementById('btnNovoAgendamento')?.addEventListener('click', () => window.openAppointmentModal?.());
    document.getElementById('searchInput')?.addEventListener('input', e => { searchQuery = e.target.value; renderAppointments(allAppointments); });
    document.getElementById('btnSearch')?.addEventListener('click', () => { document.getElementById('searchBar')?.classList.toggle('hidden'); document.getElementById('searchInput')?.focus(); });
    document.querySelectorAll('.day-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterDay = btn.dataset.day === filterDay ? '' : btn.dataset.day;
        document.querySelectorAll('.day-filter-btn').forEach(b => { b.classList.toggle('bg-primary', b.dataset.day===filterDay); b.classList.toggle('text-white', b.dataset.day===filterDay); });
        renderAppointments(allAppointments);
      });
    });
  });
  document.addEventListener('appointmentSaved', loadDashboard);
});
