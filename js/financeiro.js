/**
 * Atualiza Relatório Financeiro
 */
async function loadFinanceiro() {
    if (!currentProfessionalId) return;

    // Fetch dashboard metrics
    const { data: metrics, error: rpcError } = await supabase
        .rpc('get_dashboard_metrics', { professional_uuid: currentProfessionalId });

    if (!rpcError && metrics) {
        const m = metrics;
        
        // Faturamento Realizado (Mês)
        const faturamentoEl = document.querySelector('.text-4xl.md\\:text-6xl');
        if (faturamentoEl) faturamentoEl.innerText = \`R$ \${m.month_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\`;

        // Receita Perdida (Mês)
        const receitaPerdidaEl = document.querySelector('.text-3xl.font-extrabold.text-error');
        if (receitaPerdidaEl) receitaPerdidaEl.innerText = \`R$ \${m.lost_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\`;

        // Status Breakdown
        const totals = m.status_counts;
        const totalAppointments = Object.values(totals).reduce((a, b) => a + b, 0);

        function updateBar(label, count, colorClass, barContainerClass) {
            const spans = document.querySelectorAll('span.text-sm.font-semibold.text-on-surface');
            let targetRow = null;
            spans.forEach(s => { if(s.innerText === label) targetRow = s.parentElement.parentElement; });
            
            if (targetRow) {
                const countEl = targetRow.querySelector('span.text-sm.font-bold');
                if (countEl) countEl.innerText = count;
                
                const percent = totalAppointments > 0 ? (count / totalAppointments) * 100 : 0;
                const bar = targetRow.querySelector('div.h-full');
                if (bar) bar.style.width = \`\${percent}%\`;
            }
        }

        updateBar('Agendadas', totals['Agendado'] || 0);
        updateBar('Realizadas', totals['Realizado'] || 0);
        updateBar('Canceladas', totals['Cancelado'] || 0);
        updateBar('Faltas', totals['Faltou'] || 0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth().then(() => {
        loadFinanceiro();
    });
});
