/**
 * Atualiza o Dashboard com dados do Supabase
 */
async function loadDashboard() {
    if (!currentProfessionalId) return;

    // Fetch dashboard metrics
    const { data: metrics, error: rpcError } = await supabase
        .rpc('get_dashboard_metrics', { professional_uuid: currentProfessionalId });

    if (!rpcError && metrics) {
        // Atualiza UI com as métricas
        const m = metrics;
        
        // Faturamento
        const faturamentoEl = document.querySelector('span.text-2xl.font-extrabold.text-primary.tracking-tight');
        if (faturamentoEl) faturamentoEl.innerText = \`R$ \${m.today_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\`;

        // Pacientes Hoje (Agendado + Confirmado + Realizado + Cancelado + Faltou) -> Todos agendados pro dia
        const totalPacientes = Object.values(m.status_counts).reduce((a, b) => a + b, 0);
        const pacientesHojeEl = document.querySelector('div.bg-white.p-5:nth-child(1) span.text-3xl');
        if (pacientesHojeEl) pacientesHojeEl.innerText = String(totalPacientes).padStart(2, '0');

        // Realizados
        const realizadosEl = document.querySelector('div.border-l-secondary span.text-3xl');
        if (realizadosEl) realizadosEl.innerText = String(m.status_counts['Realizado'] || 0).padStart(2, '0');

        // Cancelados
        const canceladosEl = document.querySelector('div.border-l-error span.text-3xl');
        if (canceladosEl) canceladosEl.innerText = String(m.status_counts['Cancelado'] || 0).padStart(2, '0');

        // Não Compareceram (Faltou)
        const faltasEl = document.querySelector('div.border-l-slate-400 span.text-3xl');
        if (faltasEl) faltasEl.innerText = String(m.status_counts['Faltou'] || 0).padStart(2, '0');
    }

    // Carregar Lista de Compromissos
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(\`
            id,
            scheduled_at,
            appointment_type,
            value,
            status,
            patients ( full_name )
        \`)
        .eq('professional_id', currentProfessionalId)
        .gte('scheduled_at', \`\${todayStr}T00:00:00\`)
        .lte('scheduled_at', \`\${todayStr}T23:59:59\`)
        .order('scheduled_at', { ascending: true })
        .limit(10);

    if (error) {
        console.error('Erro ao buscar compromissos', error);
        return;
    }

    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (appointments.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="6" class="px-6 py-5 text-center text-on-surface-variant">Nenhum compromisso para hoje.</td></tr>\`;
        return;
    }

    appointments.forEach(app => {
        const time = new Date(app.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const patientName = app.patients?.full_name || 'Desconhecido';
        const initials = patientName.substring(0, 2).toUpperCase();
        
        let statusClass = '';
        switch(app.status) {
            case 'Realizado': statusClass = 'bg-secondary/10 text-secondary border-secondary/20'; break;
            case 'Confirmado': statusClass = 'bg-blue-50 text-blue-600 border-blue-200'; break;
            case 'Agendado': statusClass = 'bg-slate-100 text-slate-600 border-slate-200'; break;
            case 'Cancelado': statusClass = 'bg-error/10 text-error border-error/20'; break;
            case 'Faltou': statusClass = 'bg-slate-200 text-slate-700 border-slate-300'; break;
        }

        const opacityClass = app.status === 'Cancelado' ? 'opacity-75' : '';

        const tr = \`
        <tr class="hover:bg-slate-50/50 transition-colors \${opacityClass}">
            <td class="px-6 py-5 font-bold text-primary">\${time}</td>
            <td class="px-6 py-5">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                        \${initials}
                    </div>
                    <span class="font-semibold text-on-surface">\${patientName}</span>
                </div>
            </td>
            <td class="px-6 py-5">
                <span class="text-sm font-medium px-2 py-1 rounded bg-surface-container text-on-surface-variant">\${app.appointment_type}</span>
            </td>
            <td class="px-6 py-5 font-semibold">R$ \${app.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td class="px-6 py-5">
                <select onchange="updateAppointmentStatus('\${app.id}', this.value)" class="cursor-pointer appearance-none outline-none inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border \${statusClass}">
                    <option value="Agendado" \${app.status === 'Agendado' ? 'selected' : ''}>Agendado</option>
                    <option value="Confirmado" \${app.status === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                    <option value="Realizado" \${app.status === 'Realizado' ? 'selected' : ''}>Realizado</option>
                    <option value="Cancelado" \${app.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    <option value="Faltou" \${app.status === 'Faltou' ? 'selected' : ''}>Faltou</option>
                </select>
            </td>
            <td class="px-6 py-5">
                <button class="text-primary hover:underline font-bold text-sm" onclick='editAppointment("\${app.id}")'>Editar</button>
            </td>
        </tr>
        \`;
        tbody.insertAdjacentHTML('beforeend', tr);
    });

    window.currentAppointmentsData = appointments;
}

window.editAppointment = function(id) {
    const app = window.currentAppointmentsData.find(a => a.id === id);
    if(app && window.openAppointmentModal) {
        window.openAppointmentModal(app);
    }
}

window.updateAppointmentStatus = async function(id, newStatus) {
    try {
        const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        
        // Recarregar os dados para atualizar os cartões do topo também
        loadDashboard();
        
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'Status atualizado!'
        });
    } catch (e) {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao atualizar status: ' + e.message
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth().then(() => {
        loadDashboard();
    });
    document.addEventListener('appointmentSaved', loadDashboard);
});
