const supabaseUrl = 'https://jczxpbpzmxwmwyvtyzpi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjenhwYnB6bXh3bXd5dnR5enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjYzMjgsImV4cCI6MjA5MzE0MjMyOH0.fjP_3i2z_1_zeZCr7BLfdhp5SF7J4J1Yxb_XjXpY0TA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let currentProfessionalId = null;
let currentProfessionalName = "";

async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Se não estiver logado e não for a tela de login, redireciona
    if (!session && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
        return;
    }

    if (session) {
        const userId = session.user.id;
        
        // Buscar o profissional correspondente na tabela professionals
        const { data: prof, error } = await supabase
            .from('professionals')
            .select('id, full_name')
            .eq('user_id', userId)
            .single();
            
        if (prof) {
            currentProfessionalId = prof.id;
            currentProfessionalName = prof.full_name;
            
            // Atualizar UI global (foto e nome do Header)
            const headerNameEl = document.getElementById('headerProfessionalName');
            if(headerNameEl) headerNameEl.innerText = prof.full_name;
        } else {
            // Se por acaso o trigger não criou ou o cliente fechou antes
            const { data: newProf, error: err } = await supabase.from('professionals').insert([{
                user_id: userId,
                full_name: session.user.user_metadata?.full_name || 'Dr(a).',
                email: session.user.email
            }]).select().single();
            if (newProf) {
                currentProfessionalId = newProf.id;
                currentProfessionalName = newProf.full_name;
            }
        }
    }
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

window.logout = logout;

if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').then(reg => console.log('SW Registered')).catch(err => console.log('SW Failed', err)); }); }
