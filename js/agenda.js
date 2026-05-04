// ── Agenda JS ────────────────────────────────────────────────────────────────
let selectedDate = new Date().toISOString().split('T')[0];

async function loadAgenda(date) {
  if (!window.currentProfessionalId) return;
  selectedDate = date;

  // Atualizar header
  const h = document.getElementById('agendaDateLabel');
  if (h) h.innerText = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});

  const { data, error } = await window.supabase
    .from('appointments')
    .select('id, scheduled_at, appointment_type, value, status, patients(full_name, phone, email)')
    .eq('professional_id', window.currentProfessionalId)
    .gte('scheduled_at', `${date}T00:00:00`)
    .lte('scheduled_at', `${date}T23:59:59`)
    .order('scheduled_at');

  if (error) { console.error(error); return; }

  const list = document.getElementById('agendaList');
  if (!list) return;

  if (!data || data.length === 0) {
    list.innerHTML = `<div class="text-center py-16 text-on-surface-variant">
      <span class="material-symbols-outlined text-5xl opacity-30 block mb-2">event_available</span>
      Nenhum agendamento para esta data.
    </div>`;
    return;
  }

  list.innerHTML = data.map(a => {
    const dt = new Date(a.scheduled_at);
    const time = dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const name = a.patients?.full_name || '—';
    const ini = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    const statusColors = {
      Realizado:'bg-emerald-50 text-emerald-700', Confirmado:'bg-blue-50 text-blue-700',
      Agendado:'bg-slate-100 text-slate-600', Cancelado:'bg-red-50 text-red-700', Faltou:'bg-amber-50 text-amber-700'
    };
    const sc = statusColors[a.status] || 'bg-slate-100 text-slate-600';
    return `
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex justify-between items-center gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <div class="text-center min-w-[48px]">
          <p class="font-extrabold text-primary text-lg leading-none">${time}</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">${ini}</div>
        <div class="min-w-0">
          <p class="font-bold text-on-surface truncate">${name}</p>
          <p class="text-xs text-on-surface-variant">${a.appointment_type} · R$ ${(a.value||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full ${sc} mt-1 inline-block">${a.status}</span>
        </div>
      </div>
      <div class="flex flex-col gap-1.5 flex-shrink-0">
        <button onclick="agendaEdit('${a.id}')" class="text-xs font-bold text-primary border border-primary px-3 py-1 rounded-lg hover:bg-teal-50 transition-colors">Editar</button>
        <button onclick="agendaCancel('${a.id}')" class="text-xs font-bold text-error border border-error px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">Cancelar</button>
        <button onclick="agendaRemarcar('${a.id}')" class="text-xs font-bold text-slate-600 border border-slate-300 px-3 py-1 rounded-lg hover:bg-slate-50 transition-colors">Remarcar</button>
      </div>
    </div>`;
  }).join('');

  window._agendaData = data;
}

window.agendaEdit = (id) => {
  const a = (window._agendaData||[]).find(x=>x.id===id);
  if (a && window.openAppointmentModal) window.openAppointmentModal(a);
};

window.agendaCancel = async (id) => {
  const r = await Swal.fire({title:'Cancelar?',text:'Deseja cancelar este agendamento?',icon:'warning',showCancelButton:true,confirmButtonText:'Sim, cancelar',cancelButtonText:'Não',confirmButtonColor:'#ba1a1a'});
  if (!r.isConfirmed) return;
  await window.supabase.from('appointments').update({status:'Cancelado'}).eq('id',id);
  loadAgenda(selectedDate);
};

window.agendaRemarcar = (id) => {
  const a = (window._agendaData||[]).find(x=>x.id===id);
  if (a && window.openAppointmentModal) window.openAppointmentModal(a);
};

document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => {
    // Seletor de data
    const picker = document.getElementById('agendaDatePicker');
    if (picker) {
      picker.value = selectedDate;
      picker.addEventListener('change', e => loadAgenda(e.target.value));
    }
    loadAgenda(selectedDate);
  });
  document.addEventListener('appointmentSaved', () => loadAgenda(selectedDate));
});
