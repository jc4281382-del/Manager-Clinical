-- ============================================================================
-- SQL DE POLÍTICAS RLS (Row Level Security) - SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================================

-- 1. Habilitar RLS nas tabelas
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DA TABELA `professionals`
-- Profissionais só podem ver, atualizar e deletar o próprio registro.
-- A criação é permitida para usuários autenticados criando para si mesmos.
-- ============================================================================

CREATE POLICY "Profissionais podem inserir seu próprio registro" 
ON public.professionals FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profissionais podem ver seu próprio registro" 
ON public.professionals FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Profissionais podem atualizar seu próprio registro" 
ON public.professionals FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profissionais podem deletar seu próprio registro" 
ON public.professionals FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ============================================================================
-- POLÍTICAS DA TABELA `patients`
-- Pacientes pertencem a um profissional (professional_id = professionals.id).
-- Para verificar acesso, cruzamos o id do profissional com auth.uid().
-- ============================================================================

CREATE POLICY "Profissionais podem gerenciar seus pacientes (INSERT)" 
ON public.patients FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem ver seus pacientes (SELECT)" 
ON public.patients FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem atualizar seus pacientes (UPDATE)" 
ON public.patients FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem deletar seus pacientes (DELETE)" 
ON public.patients FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
);

-- ============================================================================
-- POLÍTICAS DA TABELA `appointments`
-- Agendamentos e financeiro pertencem a um profissional.
-- Funciona de forma similar à tabela patients.
-- ============================================================================

CREATE POLICY "Profissionais podem gerenciar seus agendamentos (INSERT)" 
ON public.appointments FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem ver seus agendamentos (SELECT)" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem atualizar seus agendamentos (UPDATE)" 
ON public.appointments FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem deletar seus agendamentos (DELETE)" 
ON public.appointments FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = professional_id AND p.user_id = auth.uid()
  )
);
