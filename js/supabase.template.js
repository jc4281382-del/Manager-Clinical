// Fix: CDN define window.supabase como SDK, então usamos nome temporário
const _sdk = window.supabase;
// Substitua URL_AQUI e KEY_AQUI pelas suas credenciais no ambiente local,
// mas para a Vercel, isso será gerado automaticamente no deploy usando as Environment Variables 
// (SUPABASE_URL e SUPABASE_ANON_KEY).
window.supabase = _sdk.createClient(
  'URL_AQUI',
  'KEY_AQUI'
);

window.currentProfessionalId = null;
window.currentProfessional = null;

async function initAuth() {
  try {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
      if (!window.location.href.includes('index.html') && window.location.pathname !== '/') {
        window.location.href = 'index.html';
      }
      return;
    }
    const uid = session.user.id;
    let { data: prof } = await window.supabase.from('professionals').select('*').eq('user_id', uid).single();
    if (!prof) {
      const { data: np } = await window.supabase.from('professionals').insert([{
        user_id: uid,
        full_name: session.user.user_metadata?.full_name || 'Profissional',
        email: session.user.email
      }]).select().single();
      prof = np;
    }
    if (prof) {
      window.currentProfessionalId = prof.id;
      window.currentProfessional = prof;
      const el = document.getElementById('headerProfessionalName');
      if (el) el.innerText = prof.preferred_name || prof.full_name;
      const img = document.getElementById('profilePhoto');
      if (img && prof.photo_url) img.src = prof.photo_url;
    }
  } catch (e) { console.error('initAuth:', e); }
}

async function logout() {
  await window.supabase.auth.signOut();
  window.location.href = 'index.html';
}
window.logout = logout;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
