function injectSidebar() {
  if (document.getElementById('sidebarMenu')) return;
  document.body.insertAdjacentHTML('beforeend', `
  <div id="sidebarOverlay" class="fixed inset-0 z-[150] bg-black/40 hidden opacity-0 transition-opacity" onclick="closeSidebar()"></div>
  <aside id="sidebarMenu" class="fixed left-0 top-0 h-full w-72 z-[160] bg-white shadow-2xl flex flex-col -translate-x-full transition-transform duration-300">
    <div class="bg-gradient-to-br from-primary to-primary-container p-6 text-white">
      <div class="relative w-20 h-20 mx-auto mb-3">
        <img id="sidebarPhoto" src="https://ui-avatars.com/api/?name=P&background=1a6b72&color=fff&size=80" class="w-20 h-20 rounded-full object-cover border-4 border-white/30">
        <label for="photoUpload" class="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md">
          <span class="material-symbols-outlined text-primary text-sm">photo_camera</span>
        </label>
        <input type="file" id="photoUpload" accept="image/*" class="hidden" onchange="uploadPhoto(this)">
      </div>
      <p class="text-center font-bold text-lg leading-tight" id="sidebarName">Profissional</p>
      <p class="text-center text-white/70 text-xs" id="sidebarEmail"></p>
    </div>
    <nav class="flex-1 py-4 overflow-y-auto">
      <button onclick="openProfile()" class="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors text-left">
        <span class="material-symbols-outlined text-primary">person</span><span class="font-semibold text-on-surface">Meu Perfil</span>
      </button>
      <button onclick="openRelatorio()" class="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors text-left">
        <span class="material-symbols-outlined text-primary">download</span><span class="font-semibold text-on-surface">Relatório</span>
      </button>
      <a href="https://wa.me/5521992341112" target="_blank" class="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors">
        <span class="material-symbols-outlined text-green-600">support_agent</span><span class="font-semibold text-on-surface">Suporte WhatsApp</span>
      </a>
      <hr class="my-2 border-slate-100">
      <button onclick="logout()" class="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-red-50 transition-colors text-left">
        <span class="material-symbols-outlined text-error">logout</span><span class="font-semibold text-error">Sair</span>
      </button>
    </nav>
  </aside>
  <div id="profileModal" class="fixed inset-0 z-[200] hidden items-center justify-center bg-black/50">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
      <div class="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
        <h2 class="font-bold text-primary text-xl">Meu Perfil</h2>
        <button onclick="document.getElementById('profileModal').classList.add('hidden');document.getElementById('profileModal').classList.remove('flex')" class="p-2 hover:bg-slate-100 rounded-full"><span class="material-symbols-outlined text-slate-500">close</span></button>
      </div>
      <form class="p-6 space-y-4" onsubmit="saveProfile(event)">
        <div><label class="text-sm font-bold text-on-surface-variant block mb-1">Nome Preferido</label><input type="text" id="prefName" class="w-full rounded-xl border border-slate-200 py-2.5 px-3 outline-none focus:border-primary text-sm"></div>
        <div><label class="text-sm font-bold text-on-surface-variant block mb-1">Nome Completo</label><input type="text" id="fullName" class="w-full rounded-xl border border-slate-200 py-2.5 px-3 outline-none focus:border-primary text-sm"></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-sm font-bold text-on-surface-variant block mb-1">Início</label><input type="time" id="workStart" class="w-full rounded-xl border border-slate-200 py-2.5 px-3 outline-none focus:border-primary text-sm"></div>
          <div><label class="text-sm font-bold text-on-surface-variant block mb-1">Fim</label><input type="time" id="workEnd" class="w-full rounded-xl border border-slate-200 py-2.5 px-3 outline-none focus:border-primary text-sm"></div>
        </div>
        <button type="submit" class="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-container transition-colors">Salvar Perfil</button>
      </form>
    </div>
  </div>
  <div id="relatorioModal" class="fixed inset-0 z-[200] hidden items-center justify-center bg-black/50">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
      <div class="px-6 py-4 border-b flex justify-between items-center">
        <h2 class="font-bold text-primary text-xl">Gerar Relatório</h2>
        <button onclick="document.getElementById('relatorioModal').classList.add('hidden');document.getElementById('relatorioModal').classList.remove('flex')" class="p-2 hover:bg-slate-100 rounded-full"><span class="material-symbols-outlined text-slate-500">close</span></button>
      </div>
      <div class="p-6 space-y-3">
        <button onclick="downloadRelatorio('hoje')" class="w-full py-3 px-4 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 text-left flex items-center gap-3"><span class="material-symbols-outlined text-primary">today</span>Hoje</button>
        <button onclick="downloadRelatorio('semana')" class="w-full py-3 px-4 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 text-left flex items-center gap-3"><span class="material-symbols-outlined text-primary">date_range</span>Essa Semana</button>
        <button onclick="downloadRelatorio('mes')" class="w-full py-3 px-4 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 text-left flex items-center gap-3"><span class="material-symbols-outlined text-primary">calendar_month</span>Esse Mês</button>
        <div class="flex gap-2">
          <input type="date" id="relatorioDateFrom" class="flex-1 rounded-xl border border-slate-200 py-2.5 px-3 text-sm outline-none">
          <input type="date" id="relatorioDateTo" class="flex-1 rounded-xl border border-slate-200 py-2.5 px-3 text-sm outline-none">
        </div>
        <button onclick="downloadRelatorio('custom')" class="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2"><span class="material-symbols-outlined">download</span>Baixar Período</button>
      </div>
    </div>
  </div>`);
}

function openSidebar() {
  const s = document.getElementById('sidebarMenu');
  const o = document.getElementById('sidebarOverlay');
  o.classList.remove('hidden'); requestAnimationFrame(() => o.classList.remove('opacity-0'));
  s.classList.remove('-translate-x-full');
  const prof = window.currentProfessional;
  if (prof) { document.getElementById('sidebarName').innerText = prof.preferred_name || prof.full_name; document.getElementById('sidebarEmail').innerText = prof.email || ''; if (prof.photo_url) document.getElementById('sidebarPhoto').src = prof.photo_url; }
}
window.openSidebar = openSidebar;

function closeSidebar() {
  document.getElementById('sidebarMenu').classList.add('-translate-x-full');
  const o = document.getElementById('sidebarOverlay');
  o.classList.add('opacity-0'); setTimeout(() => o.classList.add('hidden'), 300);
}
window.closeSidebar = closeSidebar;

window.openProfile = () => {
  closeSidebar();
  const prof = window.currentProfessional;
  if (prof) { document.getElementById('prefName').value = prof.preferred_name || ''; document.getElementById('fullName').value = prof.full_name || ''; document.getElementById('workStart').value = prof.work_start || '08:00'; document.getElementById('workEnd').value = prof.work_end || '18:00'; }
  const m = document.getElementById('profileModal'); m.classList.remove('hidden'); m.classList.add('flex');
};

window.saveProfile = async (e) => {
  e.preventDefault();
  const upd = { preferred_name: document.getElementById('prefName').value, full_name: document.getElementById('fullName').value, work_start: document.getElementById('workStart').value, work_end: document.getElementById('workEnd').value };
  const { error } = await window.supabase.from('professionals').update(upd).eq('id', window.currentProfessionalId);
  if (error) { Swal.fire({icon:'error',title:'Erro',text:error.message}); return; }
  Object.assign(window.currentProfessional, upd);
  const nameEl = document.getElementById('headerProfessionalName'); if (nameEl) nameEl.innerText = upd.preferred_name || upd.full_name;
  document.getElementById('profileModal').classList.add('hidden'); document.getElementById('profileModal').classList.remove('flex');
  Swal.fire({icon:'success',title:'Perfil salvo!',timer:2000,showConfirmButton:false});
};

window.uploadPhoto = async (input) => {
  const file = input.files[0]; if (!file) return;
  const ext = file.name.split('.').pop();
  const path = `${window.currentProfessionalId}/photo.${ext}`;
  const { error: ue } = await window.supabase.storage.from('profile-photos').upload(path, file, { upsert: true });
  if (ue) { Swal.fire({icon:'error',title:'Erro',text:ue.message}); return; }
  const { data: { publicUrl } } = window.supabase.storage.from('profile-photos').getPublicUrl(path);
  await window.supabase.from('professionals').update({ photo_url: publicUrl }).eq('id', window.currentProfessionalId);
  window.currentProfessional.photo_url = publicUrl;
  document.getElementById('sidebarPhoto').src = publicUrl;
  const pi = document.getElementById('profilePhoto'); if (pi) pi.src = publicUrl;
  Swal.fire({icon:'success',title:'Foto atualizada!',timer:2000,showConfirmButton:false});
};

window.openRelatorio = () => { closeSidebar(); const m = document.getElementById('relatorioModal'); m.classList.remove('hidden'); m.classList.add('flex'); };

window.downloadRelatorio = async (period) => {
  const pid = window.currentProfessionalId;
  let from, to; const now = new Date();
  if (period === 'hoje') { from = to = now.toISOString().split('T')[0]; }
  else if (period === 'semana') { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); from = d.toISOString().split('T')[0]; to = now.toISOString().split('T')[0]; }
  else if (period === 'mes') { from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`; to = now.toISOString().split('T')[0]; }
  else { from = document.getElementById('relatorioDateFrom').value; to = document.getElementById('relatorioDateTo').value; if (!from || !to) { Swal.fire({icon:'warning',title:'Atenção',text:'Selecione as datas.'}); return; } }
  const { data } = await window.supabase.from('appointments').select('scheduled_at, appointment_type, value, status, patients(full_name, phone)').eq('professional_id', pid).gte('scheduled_at', `${from}T00:00:00`).lte('scheduled_at', `${to}T23:59:59`).order('scheduled_at');
  if (!data || data.length === 0) { Swal.fire({icon:'info',title:'Sem dados',text:'Nenhum agendamento no período.'}); return; }
  const rows = [['Data','Hora','Paciente','Celular','Tipo','Valor','Status']];
  let total = 0;
  data.forEach(a => { const dt = new Date(a.scheduled_at); rows.push([dt.toLocaleDateString('pt-BR'), dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), a.patients?.full_name||'—', a.patients?.phone||'—', a.appointment_type, `R$ ${(a.value||0).toFixed(2)}`, a.status]); if (a.status === 'Realizado') total += (a.value || 0); });
  rows.push(['','','','','','Total Recebido:', `R$ ${total.toFixed(2)}`]);
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `relatorio-${from}-${to}.csv`; a.click(); URL.revokeObjectURL(url);
};

document.addEventListener('DOMContentLoaded', () => { initAuth().then(() => { injectSidebar(); document.getElementById('btnHamburger')?.addEventListener('click', openSidebar); }); });
