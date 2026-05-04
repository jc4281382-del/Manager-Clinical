// ── Financeiro / Relatórios ──────────────────────────────────────────────────
let currentPeriod = 'mes';

async function loadFinanceiro(period, customFrom, customTo) {
  if (!window.currentProfessionalId) return;
  currentPeriod = period;

  const now = new Date();
  let from, to;
  if (period === 'hoje') {
    from = to = now.toISOString().split('T')[0];
  } else if (period === 'semana') {
    const d = new Date(now); d.setDate(d.getDate() - d.getDay());
    from = d.toISOString().split('T')[0];
    to = now.toISOString().split('T')[0];
  } else if (period === 'mes') {
    from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
    to = now.toISOString().split('T')[0];
  } else {
    from = customFrom; to = customTo;
  }

  // Calcular offset do fuso local para filtros corretos
  const offsetMinutes = new Date().getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const absOff = Math.abs(offsetMinutes);
  const offH = String(Math.floor(absOff / 60)).padStart(2, '0');
  const offM = String(absOff % 60).padStart(2, '0');
  const tz = `${sign}${offH}:${offM}`;

  const { data, error } = await window.supabase
    .from('appointments')
    .select('status, value, scheduled_at')
    .eq('professional_id', window.currentProfessionalId)
    .gte('scheduled_at', `${from}T00:00:00${tz}`)
    .lte('scheduled_at', `${to}T23:59:59${tz}`);

  if (error) { console.error(error); return; }

  const apps = data || [];
  let recebido = 0, perdido = 0, totalAgendados = 0;
  const countsByStatus = {};

  apps.forEach(a => {
    countsByStatus[a.status] = (countsByStatus[a.status] || 0) + 1;
    if (a.status === 'Realizado') recebido += (a.value || 0);
    if (a.status === 'Cancelado' || a.status === 'Faltou') perdido += (a.value || 0);
    totalAgendados++;
  });

  setText('finRecebido', `R$ ${recebido.toLocaleString('pt-BR',{minimumFractionDigits:2})}`);
  setText('finPerdido', `R$ ${perdido.toLocaleString('pt-BR',{minimumFractionDigits:2})}`);
  setText('finTotal', String(totalAgendados));
  setText('finRealizados', String(countsByStatus['Realizado'] || 0));
  setText('finCancelados', String(countsByStatus['Cancelado'] || 0));
  setText('finFaltou', String(countsByStatus['Faltou'] || 0));
  setText('finPeriodo', `${new Date(from+'T12:00:00').toLocaleDateString('pt-BR')} – ${new Date(to+'T12:00:00').toLocaleDateString('pt-BR')}`);

  // Tabela detalhada
  const tbody = document.getElementById('finTbody');
  if (!tbody) return;

  const { data: detailed } = await window.supabase
    .from('appointments')
    .select('scheduled_at, appointment_type, value, status, patients(full_name)')
    .eq('professional_id', window.currentProfessionalId)
    .gte('scheduled_at', `${from}T00:00:00${tz}`)
    .lte('scheduled_at', `${to}T23:59:59${tz}`)
    .order('scheduled_at', {ascending: false});

  if (!detailed || detailed.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-on-surface-variant">Nenhum registro no período.</td></tr>`;
    return;
  }

  tbody.innerHTML = detailed.map(a => {
    const dt = new Date(a.scheduled_at);
    const sc = {Realizado:'text-emerald-600',Cancelado:'text-red-600',Faltou:'text-amber-600',Confirmado:'text-blue-600',Agendado:'text-slate-600'}[a.status]||'text-slate-600';
    return `<tr class="border-b border-slate-50 hover:bg-slate-50/50">
      <td class="px-4 py-3 text-sm">${dt.toLocaleDateString('pt-BR')}</td>
      <td class="px-4 py-3 text-sm font-semibold">${a.patients?.full_name||'—'}</td>
      <td class="px-4 py-3 text-sm">${a.appointment_type}</td>
      <td class="px-4 py-3 text-sm font-bold">R$ ${(a.value||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
      <td class="px-4 py-3 text-sm font-bold ${sc}">${a.status}</td>
    </tr>`;
  }).join('');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => {
    loadFinanceiro('mes');

    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('bg-primary','text-white'));
        btn.classList.add('bg-primary','text-white');
        loadFinanceiro(btn.dataset.period);
      });
    });

    document.getElementById('btnCustomPeriod')?.addEventListener('click', () => {
      const f = document.getElementById('dateFrom').value;
      const t = document.getElementById('dateTo').value;
      if (f && t) loadFinanceiro('custom', f, t);
    });
  });
});
