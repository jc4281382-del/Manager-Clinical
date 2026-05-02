/**
 * Injeta o modal de agendamento na página.
 */
function injectAppointmentModal() {
    const modalHTML = `
    <div id="appointmentModal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity opacity-0">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden transform scale-95 transition-transform max-h-[90vh] overflow-y-auto">
            <div class="px-6 py-4 border-b border-[#EEF2F5] flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 class="text-xl font-bold text-primary" id="modalTitle">Novo Agendamento</h2>
                <button id="closeModalBtn" type="button" class="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <span class="material-symbols-outlined text-slate-500">close</span>
                </button>
            </div>
            <form id="appointmentForm" class="p-6 space-y-4">
                <input type="hidden" id="appointmentId" value="">
                
                <div class="space-y-4 bg-surface-container-low p-4 rounded-xl border border-[#EEF2F5]">
                    <h3 class="text-sm font-bold text-primary mb-2">Dados do Paciente</h3>
                    <div>
                        <label class="block text-sm font-semibold text-on-surface-variant mb-1">Nome Completo *</label>
                        <input type="text" id="patientName" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary py-2 px-3">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-on-surface-variant mb-1">WhatsApp / Celular *</label>
                            <input type="tel" id="patientPhone" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary py-2 px-3" placeholder="(DD) 90000-0000">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-on-surface-variant mb-1">E-mail (Opcional)</label>
                            <input type="email" id="patientEmail" class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary py-2 px-3">
                        </div>
                    </div>
                </div>

                <div class="space-y-4 bg-surface-container-low p-4 rounded-xl border border-[#EEF2F5]">
                    <h3 class="text-sm font-bold text-primary mb-2">Dados da Consulta</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-on-surface-variant mb-1">Data *</label>
                            <input type="date" id="appointmentDate" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary py-2 px-3">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-on-surface-variant mb-1">Horário *</label>
                            <input type="time" id="appointmentTime" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary py-2 px-3">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-on-surface-variant mb-1">Tipo *</label>
                            <select id="appointmentType" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary py-2 px-3">
                                <option value="Consulta">Consulta</option>
                                <option value="Retorno">Retorno</option>
                                <option value="Avaliação">Avaliação</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-on-surface-variant mb-1">Valor (R$) *</label>
                            <input type="number" step="0.01" id="appointmentValue" value="0" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary py-2 px-3">
                        </div>
                    </div>
                    
                    <div id="statusContainer" class="hidden">
                        <label class="block text-sm font-semibold text-on-surface-variant mb-1">Status da Consulta</label>
                        <select id="appointmentStatus" class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary py-2 px-3 font-bold text-primary">
                            <option value="Agendado">Agendado</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Realizado">Realizado</option>
                            <option value="Cancelado">Cancelado</option>
                            <option value="Faltou">Faltou</option>
                        </select>
                    </div>
                </div>

                <div class="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                    <button type="button" id="cancelModalBtn" class="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-slate-100 transition-colors">Cancelar</button>
                    <button type="submit" id="saveAppointmentBtn" class="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-colors shadow-lg">Salvar</button>
                </div>
            </form>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('appointmentModal');
    const modalInner = modal.querySelector('div');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const form = document.getElementById('appointmentForm');
    const saveBtn = document.getElementById('saveAppointmentBtn');

    function openModal(existingAppointment = null) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Populate if edit
        if (existingAppointment) {
            document.getElementById('modalTitle').innerText = 'Editar Agendamento';
            document.getElementById('appointmentId').value = existingAppointment.id;
            document.getElementById('patientName').value = existingAppointment.patients?.full_name || '';
            document.getElementById('patientPhone').value = existingAppointment.patients?.phone || '';
            document.getElementById('patientEmail').value = existingAppointment.patients?.email || '';
            
            const dateObj = new Date(existingAppointment.scheduled_at);
            document.getElementById('appointmentDate').value = dateObj.toISOString().split('T')[0];
            document.getElementById('appointmentTime').value = String(dateObj.getHours()).padStart(2, '0') + ':' + String(dateObj.getMinutes()).padStart(2, '0');
            
            document.getElementById('appointmentType').value = existingAppointment.appointment_type;
            document.getElementById('appointmentValue').value = existingAppointment.value;
            
            document.getElementById('statusContainer').classList.remove('hidden');
            document.getElementById('appointmentStatus').value = existingAppointment.status;
            
            // Patient fields read-only on edit for simplicity (we'd need an update patient logic otherwise)
            document.getElementById('patientName').readOnly = true;
            document.getElementById('patientPhone').readOnly = true;
            document.getElementById('patientEmail').readOnly = true;
            document.getElementById('patientName').classList.add('bg-slate-100');
            document.getElementById('patientPhone').classList.add('bg-slate-100');
            document.getElementById('patientEmail').classList.add('bg-slate-100');
        } else {
            document.getElementById('modalTitle').innerText = 'Novo Agendamento';
            document.getElementById('appointmentId').value = '';
            form.reset();
            document.getElementById('statusContainer').classList.add('hidden');
            
            document.getElementById('patientName').readOnly = false;
            document.getElementById('patientPhone').readOnly = false;
            document.getElementById('patientEmail').readOnly = false;
            document.getElementById('patientName').classList.remove('bg-slate-100');
            document.getElementById('patientPhone').classList.remove('bg-slate-100');
            document.getElementById('patientEmail').classList.remove('bg-slate-100');
        }

        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalInner.classList.remove('scale-95');
        }, 10);
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modalInner.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            form.reset();
        }, 300);
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.innerText = 'Salvando...';

        try {
            const appId = document.getElementById('appointmentId').value;
            const patientName = document.getElementById('patientName').value;
            const patientPhone = document.getElementById('patientPhone').value;
            const patientEmail = document.getElementById('patientEmail').value;
            const date = document.getElementById('appointmentDate').value;
            const time = document.getElementById('appointmentTime').value;
            const type = document.getElementById('appointmentType').value;
            const value = parseFloat(document.getElementById('appointmentValue').value);
            const status = document.getElementById('appointmentStatus').value || 'Agendado';

            const scheduledAt = new Date(\`\${date}T\${time}\`).toISOString();

            let targetPatientId = null;

            if (!appId) {
                // Modo Criação: Inserir Paciente primeiro (se não existir, cria)
                // Vamos criar um novo pra simplificar. Numa app real, usariamos UPSERT pelo telefone.
                const { data: newPat, error: patErr } = await supabase.from('patients').insert([{
                    professional_id: currentProfessionalId,
                    full_name: patientName,
                    phone: patientPhone,
                    email: patientEmail || null
                }]).select('id').single();

                if (patErr) throw patErr;
                targetPatientId = newPat.id;

                // Inserir Agendamento
                const { error: appErr } = await supabase.from('appointments').insert([{
                    professional_id: currentProfessionalId,
                    patient_id: targetPatientId,
                    scheduled_at: scheduledAt,
                    appointment_type: type,
                    value: value,
                    status: 'Agendado'
                }]);
                if (appErr) throw appErr;

            } else {
                // Modo Edição: Apenas atualiza o Agendamento
                const { error: updErr } = await supabase.from('appointments').update({
                    scheduled_at: scheduledAt,
                    appointment_type: type,
                    value: value,
                    status: status
                }).eq('id', appId);
                if (updErr) throw updErr;
            }

            Swal.fire({
                icon: 'success',
                title: appId ? 'Agendamento Atualizado' : 'Agendamento Salvo',
                text: 'A operação foi concluída com sucesso!',
                confirmButtonColor: '#005258',
                timer: 2000,
                showConfirmButton: false
            });

            closeModal();
            document.dispatchEvent(new Event('appointmentSaved'));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível salvar: ' + error.message,
                confirmButtonColor: '#ba1a1a'
            });
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = 'Salvar';
        }
    });

    window.openAppointmentModal = openModal;
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth().then(() => {
        injectAppointmentModal();
        
        document.querySelectorAll('button').forEach(btn => {
            if (btn.innerText.includes('Agendar') || btn.innerText.includes('Novo Agendamento') || btn.innerText.includes('add')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if(window.openAppointmentModal) window.openAppointmentModal();
                });
            }
        });
    });
});
