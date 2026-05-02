const supabaseUrl = 'https://jczxpbpzmxwmwyvtyzpi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjenhwYnB6bXh3bXd5dnR5enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjYzMjgsImV4cCI6MjA5MzE0MjMyOH0.fjP_3i2z_1_zeZCr7BLfdhp5SF7J4J1Yxb_XjXpY0TA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// For testing purposes without full auth flow, we will get the first professional
// or allow querying without it depending on RLS. We'll set a mock professional ID if needed,
// but since we want it functional, let's just fetch the first professional and use it.
let currentProfessionalId = null;

async function initAuth() {
    // In a real app we'd use supabase.auth.getUser()
    // For this prototype, we'll just grab the first professional from the table
    const { data, error } = await supabase.from('professionals').select('id').limit(1).single();
    if (data) {
        currentProfessionalId = data.id;
    } else {
        // If no professional exists, create a dummy one
        const { data: newProf, error: err } = await supabase.from('professionals').insert([
            { full_name: 'Dr. Ricardo Silveira', specialty: 'Geral' }
        ]).select().single();
        if (newProf) {
            currentProfessionalId = newProf.id;
        }
    }
}
