// ── Agenda JS ────────────────────────────────────────────────────────────────
// Bug 2 corrigido: offset de fuso horário aplicado na query
let selectedDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local (evita UTC)

async function loadAgenda(date) {
  if (!window.currentProfessionalId) return;
  selectedDate = date;

  // Atualizar header
  const h = document.getElementById('agendaDateLabel');
  if (h) h.innerText = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});

  // Calcular offset de fuso (igual ao dashboard)
  const offsetMinutes = new Date().getTimezoneOffset();
  const tzSign = offsetMinutes <= 0 ? '+' : '-';
  const tzAbs = Math.abs(offsetMinutes);
  const tzStr = `${tzSign}${String(Math.floor(tzAbs/60)).padStart(2,'0')}:${String(tzAbs%60).padStart(2,'0')}`;

  const { data, error } = await window.supabase
    .from('appointments')
    .select('id, scheduled_at, appointment_type, value, status, patients(full_name, phone, email)')
    .eq('professional_id', window.currentProfessionalId)
    .gte('scheduled_at', `${date}T00:00:00${tzStr}`)
    .lte('scheduled_at', `${date}T23:59:59${tzStr}`)
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
        <button onclick="agendaRemarcar('${a.id}')" class="text-xs font-bold text-blue-600 border border-blue-400 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">Remarcar</button>
        <button onclick="agendaCancel('${a.id}')" class="text-xs font-bold text-amber-600 border border-amber-400 px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Cancelar</button>
        <button onclick="agendaDelete('${a.id}')" class="text-xs font-bold text-error border border-error px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">Excluir</button>
      </div>
    </div>`;
  }).join('');

  window._agendaData = data;
}

// Problema 5 corrigido: Editar abre o modal normalmente
window.agendaEdit = (id) => {
  const a = (window._agendaData||[]).find(x=>x.id===id);
  if (a && window.openAppointmentModal) window.openAppointmentModal(a);
};

// Problema 5 corrigido: Remarcar abre o modal focando no campo de data/hora para fácil mudança
window.agendaRemarcar = (id) => {
  const a = (window._agendaData||[]).find(x=>x.id===id);
  if (!a || !window.openAppointmentModal) return;
  window.openAppointmentModal(a);
  // Focar no campo de data após abertura do modal para indicar intenção de remarcar
  requestAnimationFrame(() => {
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
      dateInput.focus();
      dateInput.select?.();
    }
  });
};

window.agendaCancel = async (id) => {
  const r = await Swal.fire({title:'Cancelar?',text:'Deseja cancelar este agendamento?',icon:'warning',showCancelButton:true,confirmButtonText:'Sim, cancelar',cancelButtonText:'Não',confirmButtonColor:'#ba1a1a'});
  if (!r.isConfirmed) return;
  await window.supabase.from('appointments').update({status:'Cancelado'}).eq('id',id);
  loadAgenda(selectedDate);
};

// Problema 8 corrigido: Botão de excluir permanentemente
window.agendaDelete = async (id) => {
  const r = await Swal.fire({
    title:'Excluir permanentemente?',
    text:'Este agendamento será removido e não poderá ser recuperado.',
    icon:'warning',
    showCancelButton:true,
    confirmButtonText:'Sim, excluir',
    cancelButtonText:'Cancelar',
    confirmButtonColor:'#ba1a1a'
  });
  if (!r.isConfirmed) return;
  const { error } = await window.supabase.from('appointments').delete().eq('id',id);
  if (error) { Swal.fire({icon:'error',title:'Erro',text:error.message}); return; }
  Swal.fire({icon:'success',title:'Excluído!',timer:1500,showConfirmButton:false});
  loadAgenda(selectedDate);
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
