/**
 * Atualiza Relatório Financeiro
 */
let allAppointments = [];

async function loadFinanceiro() {
    if (!currentProfessionalId) return;

    // Fetch ALL appointments (or maybe limit to last 3 months to be safe)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);

    const { data: apps, error } = await supabase
        .from('appointments')
        .select('id, scheduled_at, status, value')
        .eq('professional_id', currentProfessionalId)
        .gte('scheduled_at', thirtyDaysAgo.toISOString())
        .order('scheduled_at', { ascending: false });

    if (!error && apps) {
        allAppointments = apps;
        filterData('Mês'); // default
    }

    // Attach listeners to buttons
    const filterBtns = document.querySelectorAll('.inline-flex.p-1.bg-surface-container-high button');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active classes
            filterBtns.forEach(b => {
                b.classList.remove('bg-white', 'text-primary', 'shadow-sm');
                b.classList.add('text-on-surface-variant');
            });
            // Add active classes
            e.target.classList.add('bg-white', 'text-primary', 'shadow-sm');
            e.target.classList.remove('text-on-surface-variant');
            
            filterData(e.target.innerText.trim());
        });
    });
    
    // Set default active button
    filterBtns.forEach(b => {
        if(b.innerText.trim() === 'Mês') {
            b.classList.add('bg-white', 'text-primary', 'shadow-sm');
            b.classList.remove('text-on-surface-variant');
        }
    });
}

function filterData(period) {
    const now = new Date();
    let startDate = new Date();

    if (period === 'Hoje') {
        startDate.setHours(0,0,0,0);
    } else if (period === 'Semana') {
        startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate.setHours(0,0,0,0);
    } else if (period === 'Mês') {
        startDate.setDate(1); // Start of month
        startDate.setHours(0,0,0,0);
    }

    const filtered = allAppointments.filter(app => {
        const d = new Date(app.scheduled_at);
        return d >= startDate && d <= now;
    });

    let faturamento = 0;
    let perdida = 0;
    const counts = { 'Agendado': 0, 'Realizado': 0, 'Confirmado': 0, 'Cancelado': 0, 'Faltou': 0 };

    filtered.forEach(app => {
        if (app.status === 'Realizado') {
            faturamento += app.value;
        } else if (app.status === 'Cancelado' || app.status === 'Faltou') {
            perdida += app.value;
        }
        counts[app.status]++;
    });

    const faturamentoEl = document.querySelector('.text-4xl.md\\:text-6xl') || document.querySelector('h3.text-4xl');
    if (faturamentoEl) faturamentoEl.innerText = \`R$ \${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\`;

    const perdidaEls = document.querySelectorAll('span.text-3xl.font-extrabold.text-error, h3.text-3xl.font-extrabold.text-error');
    if (perdidaEls.length > 0) {
        perdidaEls[0].innerText = \`R$ \${perdida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\`;
    }

    const total = filtered.length;
    updateBar('Agendadas', counts['Agendado'] + counts['Confirmado'], total);
    updateBar('Realizadas', counts['Realizado'], total);
    updateBar('Canceladas', counts['Cancelado'], total);
    updateBar('Faltas', counts['Faltou'], total);
}

function updateBar(label, count, total) {
    const spans = document.querySelectorAll('span.text-sm.font-semibold.text-on-surface');
    let targetRow = null;
    spans.forEach(s => { if(s.innerText === label) targetRow = s.parentElement.parentElement; });
    
    if (targetRow) {
        const countEl = targetRow.querySelector('span.text-sm.font-bold');
        if (countEl) countEl.innerText = count;
        
        const percent = total > 0 ? (count / total) * 100 : 0;
        const bar = targetRow.querySelector('div.h-full');
        if (bar) bar.style.width = \`\${percent}%\`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth().then(() => {
        loadFinanceiro();
    });
});
