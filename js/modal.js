/**
 * Injeta o modal de agendamento na página.
 */
function injectAppointmentModal() {
    const modalHTML = `
    <div id="appointmentModal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity opacity-0">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden transform scale-95 transition-transform">
            <div class="px-6 py-4 border-b border-[#EEF2F5] flex justify-between items-center">
                <h2 class="text-xl font-bold text-primary">Novo Agendamento</h2>
                <button id="closeModalBtn" class="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <span class="material-symbols-outlined text-slate-500">close</span>
                </button>
            </div>
            <form id="appointmentForm" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-on-surface-variant mb-1">Paciente</label>
                    <select id="patientSelect" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary">
                        <option value="">Selecione um paciente</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-on-surface-variant mb-1">Data</label>
                        <input type="date" id="appointmentDate" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-on-surface-variant mb-1">Horário</label>
                        <input type="time" id="appointmentTime" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-on-surface-variant mb-1">Tipo</label>
                        <select id="appointmentType" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary">
                            <option value="Consulta">Consulta</option>
                            <option value="Retorno">Retorno</option>
                            <option value="Avaliação">Avaliação</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-on-surface-variant mb-1">Valor (R$)</label>
                        <input type="number" step="0.01" id="appointmentValue" value="0" required class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-on-surface-variant mb-1">Observações</label>
                    <textarea id="appointmentNotes" rows="3" class="w-full rounded-xl border-outline-variant focus:border-primary focus:ring-primary"></textarea>
                </div>
                <div class="pt-4 flex justify-end gap-3">
                    <button type="button" id="cancelModalBtn" class="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-slate-100 transition-colors">Cancelar</button>
                    <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-colors shadow-lg">Salvar Agendamento</button>
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

    function openModal() {
        loadPatients(); // Carrega pacientes do banco
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // setTimeout to allow display:flex to apply before transition
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
        
        const patientId = document.getElementById('patientSelect').value;
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const type = document.getElementById('appointmentType').value;
        const value = parseFloat(document.getElementById('appointmentValue').value);
        const notes = document.getElementById('appointmentNotes').value;

        // Combinar Data e Hora em ISO
        const scheduledAt = new Date(\`\${date}T\${time}\`).toISOString();

        try {
            const { error } = await supabase.from('appointments').insert([{
                professional_id: currentProfessionalId,
                patient_id: patientId,
                scheduled_at: scheduledAt,
                appointment_type: type,
                value: value,
                notes: notes,
                status: 'Agendado'
            }]);

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Agendamento Salvo',
                text: 'A consulta foi agendada com sucesso!',
                confirmButtonColor: '#005258'
            });

            closeModal();
            
            // Disparar evento para atualizar listas, se houver ouvintes
            document.dispatchEvent(new Event('appointmentSaved'));

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível salvar o agendamento: ' + error.message,
                confirmButtonColor: '#ba1a1a'
            });
        }
    });

    // Expose open function globally
    window.openAppointmentModal = openModal;
}

/**
 * Carrega a lista de pacientes no select do modal.
 */
async function loadPatients() {
    const select = document.getElementById('patientSelect');
    
    const { data: patients, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('professional_id', currentProfessionalId)
        .order('full_name');

    if (error) {
        console.error('Erro ao carregar pacientes', error);
        return;
    }

    // Se não tiver pacientes para testar, vamos criar um paciente dummy
    if (!patients || patients.length === 0) {
        const { data: newPat, error: err } = await supabase.from('patients').insert([{
            professional_id: currentProfessionalId,
            full_name: 'Paciente Teste'
        }]).select();
        
        if (newPat && newPat.length > 0) {
            patients.push(newPat[0]);
        }
    }

    select.innerHTML = '<option value="">Selecione um paciente</option>';
    patients.forEach(p => {
        select.innerHTML += \`<option value="\${p.id}">\${p.full_name}</option>\`;
    });
}

// Injeta o modal quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    // Só injeta após o initAuth para garantir que temos o professional
    initAuth().then(() => {
        injectAppointmentModal();
        
        // Conecta botões com texto "+ Agendar" ou "Novo Agendamento" ao modal
        document.querySelectorAll('button').forEach(btn => {
            if (btn.innerText.includes('Agendar') || btn.innerText.includes('Novo Agendamento') || btn.innerText.includes('add')) {
                // Remove listeners antigos substituindo o clone, para garantir que não chame duas vezes se já tivesse algo
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if(window.openAppointmentModal) window.openAppointmentModal();
                });
            }
        });
    });
});
