// ── Pacientes JS ─────────────────────────────────────────────────────────────
// Problema 9 corrigido: exibir pacientes ÚNICOS em vez de agendamentos
// Busca por nome ou telefone adicionada

let allPatients = [];
let patientSearch = '';

async function loadPacientes() {
  if (!window.currentProfessionalId) return;

  // Buscar pacientes únicos da tabela patients
  const { data, error } = await window.supabase
    .from('patients')
    .select('id, full_name, phone, email, created_at')
    .eq('professional_id', window.currentProfessionalId)
    .order('full_name', { ascending: true });

  if (error) { console.error(error); return; }
  allPatients = data || [];

  // Buscar contagem de agendamentos por paciente
  const { data: appsData } = await window.supabase
    .from('appointments')
    .select('patient_id, status')
    .eq('professional_id', window.currentProfessionalId);

  // Agregar contagens por paciente
  const appCounts = {};
  const lastStatus = {};
  (appsData || []).forEach(a => {
    if (!appCounts[a.patient_id]) appCounts[a.patient_id] = 0;
    appCounts[a.patient_id]++;
    lastStatus[a.patient_id] = a.status;
  });

  renderPacientes(allPatients, appCounts, lastStatus);
}

function renderPacientes(patients, appCounts, lastStatus) {
  const container = document.getElementById('patientsList');
  if (!container) return;

  const searchLower = patientSearch.toLowerCase();
  const filtered = patients.filter(p =>
    (p.full_name || '').toLowerCase().includes(searchLower) ||
    (p.phone || '').includes(patientSearch)
  );

  // Atualizar contador
  const countEl = document.getElementById('patientsCount');
  if (countEl) countEl.innerText = `${filtered.length} paciente${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center py-16 text-on-surface-variant col-span-full">
      <span class="material-symbols-outlined text-5xl opacity-30 block mb-2">person_off</span>
      ${patientSearch ? 'Nenhum paciente encontrado para esta busca.' : 'Nenhum paciente cadastrado ainda.'}
    </div>`;
    return;
  }

  const statusColors = {
    Realizado:'bg-emerald-50 text-emerald-700', Confirmado:'bg-blue-50 text-blue-700',
    Agendado:'bg-slate-100 text-slate-600', Cancelado:'bg-red-50 text-red-700',
    Faltou:'bg-amber-50 text-amber-700'
  };

  container.innerHTML = filtered.map(p => {
    const name = p.full_name || '—';
    const ini = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const total = appCounts[p.id] || 0;
    const status = lastStatus[p.id];
    const sc = statusColors[status] || '';
    const since = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—';
    return `
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">${ini}</div>
        <div class="min-w-0 flex-1">
          <p class="font-bold text-on-surface truncate">${name}</p>
          <p class="text-xs text-on-surface-variant">${p.phone || 'Sem telefone'}</p>
        </div>
        ${status ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${sc} flex-shrink-0">${status}</span>` : ''}
      </div>
      ${p.email ? `<p class="text-xs text-on-surface-variant truncate">${p.email}</p>` : ''}
      <div class="flex items-center justify-between pt-1 border-t border-slate-50">
        <span class="text-xs text-on-surface-variant">${total} consulta${total !== 1 ? 's' : ''}</span>
        <span class="text-xs text-on-surface-variant">desde ${since}</span>
      </div>
      <button onclick="agendarParaPaciente('${p.id}','${p.full_name?.replace(/'/g,"\\'") || ''}','${p.phone || ''}')"
        class="w-full text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
        + Novo Agendamento
      </button>
    </div>`;
  }).join('');
}

// Agendar abrindo o modal já preenchido com dados do paciente
window.agendarParaPaciente = (patientId, name, phone) => {
  if (!window.openAppointmentModal) return;
  // Passa um objeto "fake" de appointment sem id, mas com dados do paciente
  window.openAppointmentModal({
    _newForPatient: true,
    patient_id: patientId,
    patients: { full_name: name, phone, email: '' },
    scheduled_at: null
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => {
    loadPacientes();

    // Busca de pacientes
    const searchInput = document.getElementById('patientSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        patientSearch = e.target.value;
        // Rebuscar contagens (já no cache — só re-render)
        window.supabase.from('appointments')
          .select('patient_id, status')
          .eq('professional_id', window.currentProfessionalId)
          .then(({ data }) => {
            const appCounts = {};
            const lastStatus = {};
            (data || []).forEach(a => {
              if (!appCounts[a.patient_id]) appCounts[a.patient_id] = 0;
              appCounts[a.patient_id]++;
              lastStatus[a.patient_id] = a.status;
            });
            renderPacientes(allPatients, appCounts, lastStatus);
          });
      });
    }

    // Botão "Novo" → abre modal de cadastro de paciente (sem agendamento)
    document.getElementById('btnNovoPaciente')?.addEventListener('click', () => window.openAppointmentModal?.('ONLY_PATIENT'));
  });
  document.addEventListener('appointmentSaved', loadPacientes);
});
