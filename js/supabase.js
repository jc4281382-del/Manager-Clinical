// Fix: CDN define window.supabase como SDK, então usamos nome temporário
const _sdk = window.supabase;
window.supabase = _sdk.createClient(
  'https://jczxpbpzmxwmwyvtyzpi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjenhwYnB6bXh3bXd5dnR5enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjYzMjgsImV4cCI6MjA5MzE0MjMyOH0.fjP_3i2z_1_zeZCr7BLfdhp5SF7J4J1Yxb_XjXpY0TA'
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
