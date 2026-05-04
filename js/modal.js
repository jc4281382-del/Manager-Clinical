// ── Modal de Agendamento ─────────────────────────────────────────────────────
function injectAppointmentModal() {
  if (document.getElementById('appointmentModal')) return;
  document.body.insertAdjacentHTML('beforeend', `
  <div id="appointmentModal" class="fixed inset-0 z-[200] hidden items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 transition-opacity">
    <div id="modalBox" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 scale-95 transition-transform max-h-[90vh] overflow-y-auto">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
        <h2 class="text-xl font-bold text-primary" id="modalTitle">Novo Agendamento</h2>
        <button id="closeModalBtn" class="p-2 rounded-full hover:bg-slate-100"><span class="material-symbols-outlined text-slate-500">close</span></button>
      </div>
      <form id="appointmentForm" class="p-6 space-y-4">
        <input type="hidden" id="appointmentId">
        <input type="hidden" id="existingPatientId">
        <div class="bg-slate-50 p-4 rounded-xl space-y-3">
          <h3 class="text-sm font-bold text-primary">Dados do Paciente</h3>
          <input type="text" id="patientName" required placeholder="Nome completo *" class="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-primary outline-none">
          <div class="grid grid-cols-2 gap-3">
            <input type="tel" id="patientPhone" required placeholder="Celular *" class="rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-primary outline-none">
            <input type="email" id="patientEmail" placeholder="E-mail (opcional)" class="rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-primary outline-none">
          </div>
        </div>
        <div class="bg-slate-50 p-4 rounded-xl space-y-3">
          <h3 class="text-sm font-bold text-primary">Dados da Consulta</h3>
          <div class="grid grid-cols-2 gap-3">
            <input type="date" id="appointmentDate" required class="rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-primary outline-none">
            <input type="time" id="appointmentTime" required class="rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-primary outline-none">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <select id="appointmentType" class="rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-primary outline-none">
              <option>Consulta</option><option>Retorno</option><option>Avaliação</option><option>Procedimento</option>
            </select>
            <input type="number" step="0.01" id="appointmentValue" value="0" placeholder="Valor R$" class="rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-primary outline-none">
          </div>
          <div id="statusContainer" class="hidden">
            <select id="appointmentStatus" class="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-primary outline-none font-bold text-primary">
              <option>Agendado</option><option>Confirmado</option><option>Realizado</option><option>Cancelado</option><option>Faltou</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" id="cancelModalBtn" class="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
          <button type="submit" id="saveBtn" class="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-container shadow-lg transition-colors">Salvar</button>
        </div>
      </form>
    </div>
  </div>`);

  const modal = document.getElementById('appointmentModal');
  const box = document.getElementById('modalBox');
  const form = document.getElementById('appointmentForm');
  const saveBtn = document.getElementById('saveBtn');

  function open(app = null) {
    form.reset();
    document.getElementById('patientName').readOnly = false;
    document.getElementById('patientPhone').readOnly = false;
    if (app) {
      document.getElementById('modalTitle').innerText = 'Editar Agendamento';
      document.getElementById('appointmentId').value = app.id;
      document.getElementById('existingPatientId').value = app.patient_id || '';
      document.getElementById('patientName').value = app.patients?.full_name || '';
      document.getElementById('patientPhone').value = app.patients?.phone || '';
      document.getElementById('patientEmail').value = app.patients?.email || '';
      document.getElementById('patientName').readOnly = true;
      document.getElementById('patientPhone').readOnly = true;
      const dt = new Date(app.scheduled_at);
      // Usar data/hora local do navegador (corrige fuso horário)
      const localDate = dt.toLocaleDateString('en-CA'); // formato YYYY-MM-DD
      const localTime = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      document.getElementById('appointmentDate').value = localDate;
      document.getElementById('appointmentTime').value = localTime;
      document.getElementById('appointmentType').value = app.appointment_type;
      document.getElementById('appointmentValue').value = app.value || 0;
      document.getElementById('statusContainer').classList.remove('hidden');
      document.getElementById('appointmentStatus').value = app.status;
    } else {
      document.getElementById('modalTitle').innerText = 'Novo Agendamento';
      document.getElementById('appointmentId').value = '';
      document.getElementById('statusContainer').classList.add('hidden');
      // Default: hoje
      document.getElementById('appointmentDate').value = new Date().toISOString().split('T')[0];
    }
    modal.classList.remove('hidden'); modal.classList.add('flex');
    requestAnimationFrame(() => { modal.classList.remove('opacity-0'); box.classList.remove('scale-95'); });
  }

  function close() {
    modal.classList.add('opacity-0'); box.classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 250);
  }

  document.getElementById('closeModalBtn').addEventListener('click', close);
  document.getElementById('cancelModalBtn').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    saveBtn.disabled = true; saveBtn.innerText = 'Salvando...';
    try {
      const id = document.getElementById('appointmentId').value;
      const patId = document.getElementById('existingPatientId').value;
      const name = document.getElementById('patientName').value.trim();
      const phone = document.getElementById('patientPhone').value.trim();
      const email = document.getElementById('patientEmail').value.trim();
      const date = document.getElementById('appointmentDate').value;
      const time = document.getElementById('appointmentTime').value;
      const type = document.getElementById('appointmentType').value;
      const value = parseFloat(document.getElementById('appointmentValue').value) || 0;
      const status = document.getElementById('appointmentStatus').value || 'Agendado';
      // Incluir offset do fuso horário local para evitar conversão UTC incorreta
      const offsetMinutes = new Date().getTimezoneOffset();
      const sign = offsetMinutes <= 0 ? '+' : '-';
      const absOff = Math.abs(offsetMinutes);
      const offH = String(Math.floor(absOff / 60)).padStart(2, '0');
      const offM = String(absOff % 60).padStart(2, '0');
      const tzOffset = `${sign}${offH}:${offM}`;
      const scheduled_at = `${date}T${time}:00${tzOffset}`;

      if (!id) {
        // Criar paciente + agendamento
        const { data: pat, error: pe } = await window.supabase.from('patients')
          .insert([{ professional_id: window.currentProfessionalId, full_name: name, phone, email: email||null }])
          .select('id').single();
        if (pe) throw pe;
        const { error: ae } = await window.supabase.from('appointments')
          .insert([{ professional_id: window.currentProfessionalId, patient_id: pat.id, scheduled_at, appointment_type: type, value, status: 'Agendado' }]);
        if (ae) throw ae;
      } else {
        // Atualizar agendamento
        const { error: ue } = await window.supabase.from('appointments')
          .update({ scheduled_at, appointment_type: type, value, status }).eq('id', id);
        if (ue) throw ue;
      }
      Swal.fire({ icon:'success', title: id ? 'Atualizado!' : 'Agendado!', timer:2000, showConfirmButton:false, confirmButtonColor:'#005258' });
      close();
      document.dispatchEvent(new Event('appointmentSaved'));
    } catch(err) {
      Swal.fire({ icon:'error', title:'Erro', text: err.message });
    } finally {
      saveBtn.disabled = false; saveBtn.innerText = 'Salvar';
    }
  });

  window.openAppointmentModal = open;
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => injectAppointmentModal());
});
