const STATUS_COLS = ['Agendado','Confirmado','Realizado','Cancelado','Faltou'];

async function loadPacientes() {
  if (!window.currentProfessionalId) return;
  const { data, error } = await window.supabase.from('appointments').select('id, scheduled_at, status, value, patients(id, full_name, phone, email)').eq('professional_id', window.currentProfessionalId).order('scheduled_at', {ascending:false});
  if (error) { console.error(error); return; }
  const groups = {};
  STATUS_COLS.forEach(s => groups[s] = []);
  (data || []).forEach(a => { if (groups[a.status]) groups[a.status].push(a); });
  STATUS_COLS.forEach(status => {
    const col = document.getElementById(`col-${status}`);
    const counter = document.getElementById(`count-${status}`);
    if (!col) return;
    const items = groups[status];
    if (counter) counter.innerText = items.length;
    col.innerHTML = items.map(a => {
      const name = a.patients?.full_name || '—';
      const ini = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
      const dt = a.scheduled_at ? new Date(a.scheduled_at).toLocaleDateString('pt-BR') : '—';
      const time = a.scheduled_at ? new Date(a.scheduled_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '';
      return `<div class="bg-white rounded-xl border border-slate-100 shadow-sm p-3 space-y-2 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">${ini}</div><div class="min-w-0"><p class="font-bold text-on-surface text-sm truncate">${name}</p><p class="text-xs text-on-surface-variant">${a.patients?.phone || ''}</p></div></div>
        ${a.patients?.email ? `<p class="text-xs text-on-surface-variant truncate">${a.patients.email}</p>` : ''}
        <p class="text-xs text-on-surface-variant">${dt} ${time}</p>
        <div class="flex gap-1 flex-wrap">${STATUS_COLS.filter(s=>s!==status).map(s=>`<button onclick="moverPaciente('${a.id}','${s}')" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-colors">${s}</button>`).join('')}</div>
      </div>`;
    }).join('') || `<p class="text-center text-xs text-on-surface-variant py-4 opacity-60">Nenhum</p>`;
  });
  window._kanbanData = data;
}

window.moverPaciente = async (id, novoStatus) => {
  const { error } = await window.supabase.from('appointments').update({status: novoStatus}).eq('id', id);
  if (error) { Swal.fire({icon:'error',title:'Erro',text:error.message}); return; }
  loadPacientes();
};

document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => { loadPacientes(); document.getElementById('btnNovoPaciente')?.addEventListener('click', () => window.openAppointmentModal?.()); });
  document.addEventListener('appointmentSaved', loadPacientes);
});
