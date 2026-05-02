/**
 * Atualiza Agenda
 */
async function loadAgenda() {
    if (!currentProfessionalId) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            id,
            scheduled_at,
            appointment_type,
            value,
            status,
            patients ( id, full_name, phone, email )
        `)
        .eq('professional_id', currentProfessionalId)
        .gte('scheduled_at', `${todayStr}T00:00:00`)
        .lte('scheduled_at', `${todayStr}T23:59:59`)
        .order('scheduled_at', { ascending: true });

    if (error) {
        console.error('Erro ao buscar agenda', error);
        return;
    }

    const container = document.querySelector('main.max-w-4xl > div.space-y-4');
    if (!container) return;

    container.innerHTML = ''; 

    // Guardar appointments no window para acessar pelo botão de editar
    window.currentAppointmentsData = appointments;

    const hours = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    
    const appsByHour = {};
    appointments.forEach(app => {
        const dateObj = new Date(app.scheduled_at);
        const hStr = String(dateObj.getHours()).padStart(2, '0') + ':00';
        if (!appsByHour[hStr]) appsByHour[hStr] = [];
        appsByHour[hStr].push(app);
    });

    hours.forEach(h => {
        if (appsByHour[h] && appsByHour[h].length > 0) {
            appsByHour[h].forEach(app => {
                const patientName = app.patients?.full_name || 'Desconhecido';
                
                let badgeClass = '';
                switch(app.status) {
                    case 'Realizado': badgeClass = 'bg-secondary/20 text-secondary border-secondary/20'; break;
                    case 'Confirmado': badgeClass = 'bg-blue-100 text-blue-700 border-blue-200'; break;
                    case 'Agendado': badgeClass = 'bg-slate-200 text-slate-700 border-slate-300'; break;
                    case 'Cancelado': badgeClass = 'bg-error/20 text-error border-error/20'; break;
                    case 'Faltou': badgeClass = 'bg-slate-300 text-slate-800 border-slate-400'; break;
                }

                container.insertAdjacentHTML('beforeend', `
                <div class="flex gap-4">
                    <div class="w-12 pt-1">
                        <span class="text-sm font-bold text-on-surface-variant opacity-60">${h}</span>
                    </div>
                    <div class="flex-1">
                        <div class="bg-white p-4 rounded-xl border border-[#EEF2F5] shadow-sm flex justify-between items-center hover:shadow-md transition-shadow relative overflow-hidden ${app.status === 'Cancelado' ? 'opacity-50' : ''}">
                            <div class="absolute left-0 top-0 bottom-0 w-1 ${app.status === 'Realizado' ? 'bg-secondary' : 'bg-primary'}"></div>
                            <div>
                                <p class="text-xs font-bold text-primary mb-1 uppercase tracking-wider">${app.appointment_type}</p>
                                <h3 class="font-bold text-on-surface">${patientName}</h3>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">${app.status}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="block font-bold text-on-surface">R$ ${app.value.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                                <button class="mt-2 text-primary p-1 hover:bg-surface-container rounded-lg transition-colors" onclick='editAppointment("${app.id}")'>
                                    <span class="material-symbols-outlined">edit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `);
            });
        } else {
            container.insertAdjacentHTML('beforeend', `
            <div class="flex gap-4">
                <div class="w-12 pt-1">
                    <span class="text-sm font-bold text-on-surface-variant opacity-60">${h}</span>
                </div>
                <div class="flex-1">
                    <button onclick="window.openAppointmentModal()" class="w-full h-16 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-2 text-outline hover:bg-surface-container-low hover:border-primary transition-all group">
                        <span class="material-symbols-outlined text-outline group-hover:text-primary">add_circle</span>
                        <span class="font-semibold group-hover:text-primary">+ Agendar</span>
                    </button>
                </div>
            </div>
            `);
        }
    });

    container.insertAdjacentHTML('beforeend', `
        <div class="flex gap-4 mt-6">
            <div class="w-12 pt-1">
                <span class="text-sm font-bold text-on-surface-variant opacity-60">18:00</span>
            </div>
            <div class="flex-1">
                <button class="w-full h-12 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-2 text-outline hover:bg-surface-container-low transition-all">
                    <span class="material-symbols-outlined text-outline">lock</span>
                    <span class="text-xs font-semibold">Fim do Expediente</span>
                </button>
            </div>
        </div>
    `);
}

window.editAppointment = function(id) {
    const app = window.currentAppointmentsData.find(a => a.id === id);
    if(app && window.openAppointmentModal) {
        window.openAppointmentModal(app);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth().then(() => {
        loadAgenda();
    });
    document.addEventListener('appointmentSaved', loadAgenda);
});
