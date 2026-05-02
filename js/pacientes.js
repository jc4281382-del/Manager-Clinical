async function loadKanban() {
    if (!currentProfessionalId) return;

    // Buscar agendamentos de hoje/futuros ou todos recentes
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            id,
            scheduled_at,
            appointment_type,
            value,
            status,
            patients ( full_name, phone )
        `)
        .eq('professional_id', currentProfessionalId)
        .order('scheduled_at', { ascending: false })
        .limit(50); // Últimos 50

    if (error) {
        console.error('Erro ao buscar pacientes pro Kanban', error);
        return;
    }

    const cols = {
        'Agendado': document.getElementById('colAgendado'),
        'Confirmado': document.getElementById('colConfirmado'),
        'Realizado': document.getElementById('colRealizado'),
        'Cancelado': document.getElementById('colCancelado'),
        'Faltou': document.getElementById('colCancelado') // Faltou entra no mesmo de Cancelado
    };

    const counts = {
        'Agendado': 0, 'Confirmado': 0, 'Realizado': 0, 'CanceladoFaltou': 0
    };

    // Limpar colunas
    Object.values(cols).forEach(c => c && (c.innerHTML = ''));

    appointments.forEach(app => {
        const col = cols[app.status];
        if (!col) return;

        if (app.status === 'Cancelado' || app.status === 'Faltou') counts['CanceladoFaltou']++;
        else counts[app.status]++;

        const time = new Date(app.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'});
        
        let borderClass = 'border-l-4 border-slate-300';
        if (app.status === 'Confirmado') borderClass = 'border-l-4 border-blue-400';
        else if (app.status === 'Realizado') borderClass = 'border-l-4 border-secondary';
        else if (app.status === 'Cancelado' || app.status === 'Faltou') borderClass = 'border-l-4 border-error opacity-75';

        const card = `
        <div class="bg-white p-4 rounded-xl shadow-sm border border-[#EEF2F5] ${borderClass} cursor-pointer hover:shadow-md transition-all">
            <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">${time}</p>
            <h4 class="font-bold text-on-surface mb-2">${app.patients?.full_name || 'Desconhecido'}</h4>
            <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">call</span> ${app.patients?.phone || 'Sem número'}
                </span>
                <span class="text-xs font-bold ${app.status === 'Faltou' || app.status === 'Cancelado' ? 'text-error' : 'text-primary'}">${app.status}</span>
            </div>
        </div>
        `;

        col.insertAdjacentHTML('beforeend', card);
    });

    document.getElementById('countAgendado').innerText = counts['Agendado'];
    document.getElementById('countConfirmado').innerText = counts['Confirmado'];
    document.getElementById('countRealizado').innerText = counts['Realizado'];
    document.getElementById('countCancelado').innerText = counts['CanceladoFaltou'];
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth().then(() => {
        loadKanban();
    });
    document.addEventListener('appointmentSaved', loadKanban);
});
