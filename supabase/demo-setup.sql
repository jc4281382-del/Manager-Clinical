-- ============================================================
-- SETUP DO USUÁRIO DE DEMO — Manager Clinic
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- 1. Adiciona coluna is_demo nas tabelas principais
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE patients     ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- 2. Política RLS: usuário de demo só enxerga linhas is_demo = true
--    Usuários reais nunca veem dados de demo
DROP POLICY IF EXISTS "demo_isolation_appointments" ON appointments;
CREATE POLICY "demo_isolation_appointments" ON appointments
  USING (
    CASE
      WHEN auth.email() = 'demo@managerclinic.app' THEN is_demo = true
      ELSE auth.uid() = user_id AND (is_demo = false OR is_demo IS NULL)
    END
  );

DROP POLICY IF EXISTS "demo_isolation_patients" ON patients;
CREATE POLICY "demo_isolation_patients" ON patients
  USING (
    CASE
      WHEN auth.email() = 'demo@managerclinic.app' THEN is_demo = true
      ELSE auth.uid() = user_id AND (is_demo = false OR is_demo IS NULL)
    END
  );

-- 3. Insere dados de exemplo para o usuário de demo
--    (substitua demo-user-uuid pelo UUID real após criar o usuário no painel)
/*
INSERT INTO patients (user_id, name, phone, is_demo) VALUES
  ('demo-user-uuid', 'Maria Silva (Demo)',    '(21) 99999-0001', true),
  ('demo-user-uuid', 'João Souza (Demo)',     '(21) 99999-0002', true),
  ('demo-user-uuid', 'Ana Pereira (Demo)',    '(21) 99999-0003', true);

INSERT INTO appointments (user_id, patient_name, date, time, value, status, is_demo) VALUES
  ('demo-user-uuid', 'Maria Silva (Demo)',  CURRENT_DATE,     '09:00', 200, 'Agendado',  true),
  ('demo-user-uuid', 'João Souza (Demo)',   CURRENT_DATE,     '10:00', 180, 'Confirmado',true),
  ('demo-user-uuid', 'Ana Pereira (Demo)',  CURRENT_DATE - 1, '14:00', 250, 'Realizado', true);
*/

-- 4. Instrução: criar o usuário demo no painel do Supabase
--    Authentication > Users > "Add user"
--    Email: demo@managerclinic.app
--    Password: demo1234
--    Após criar, copie o UUID gerado e substitua 'demo-user-uuid' acima
