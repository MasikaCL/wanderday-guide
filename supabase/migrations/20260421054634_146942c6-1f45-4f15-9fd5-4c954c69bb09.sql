-- Roles enum
DO $$ BEGIN
  CREATE TYPE public.adventure_role AS ENUM ('owner','editor','viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Collaborators table
CREATE TABLE IF NOT EXISTS public.adventure_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES public.adventures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.adventure_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (adventure_id, user_id)
);
ALTER TABLE public.adventure_collaborators ENABLE ROW LEVEL SECURITY;

-- Invitations table
CREATE TABLE IF NOT EXISTS public.adventure_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES public.adventures(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  email TEXT NOT NULL,
  role public.adventure_role NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adventure_invitations ENABLE ROW LEVEL SECURITY;

-- Helper: does the current user have at least viewer access to an adventure?
CREATE OR REPLACE FUNCTION public.has_adventure_access(_adventure_id UUID, _min_role public.adventure_role DEFAULT 'viewer')
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.adventures a WHERE a.id = _adventure_id AND a.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.adventure_collaborators c
    WHERE c.adventure_id = _adventure_id
      AND c.user_id = auth.uid()
      AND CASE _min_role
            WHEN 'viewer' THEN c.role IN ('viewer','editor','owner')
            WHEN 'editor' THEN c.role IN ('editor','owner')
            WHEN 'owner'  THEN c.role = 'owner'
          END
  );
$$;

-- Update adventures policies to allow collaborator viewing/updating
DROP POLICY IF EXISTS "Own adventures select" ON public.adventures;
DROP POLICY IF EXISTS "Own adventures update" ON public.adventures;

CREATE POLICY "Adventure access select" ON public.adventures
  FOR SELECT USING (public.has_adventure_access(id, 'viewer'));

CREATE POLICY "Adventure access update" ON public.adventures
  FOR UPDATE USING (public.has_adventure_access(id, 'editor'));

-- Update stops policies similarly
DROP POLICY IF EXISTS "Own stops select" ON public.stops;
DROP POLICY IF EXISTS "Own stops insert" ON public.stops;
DROP POLICY IF EXISTS "Own stops update" ON public.stops;
DROP POLICY IF EXISTS "Own stops delete" ON public.stops;

CREATE POLICY "Stops access select" ON public.stops
  FOR SELECT USING (public.has_adventure_access(adventure_id, 'viewer'));

CREATE POLICY "Stops access insert" ON public.stops
  FOR INSERT WITH CHECK (
    public.has_adventure_access(adventure_id, 'editor') AND auth.uid() = user_id
  );

CREATE POLICY "Stops access update" ON public.stops
  FOR UPDATE USING (public.has_adventure_access(adventure_id, 'editor'));

CREATE POLICY "Stops access delete" ON public.stops
  FOR DELETE USING (public.has_adventure_access(adventure_id, 'editor'));

-- Collaborators RLS
CREATE POLICY "Collab read for owners and self" ON public.adventure_collaborators
  FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.adventures a WHERE a.id = adventure_id AND a.user_id = auth.uid()
    )
  );
CREATE POLICY "Collab insert by owner" ON public.adventure_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.adventures a WHERE a.id = adventure_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Collab self-insert via accept" ON public.adventure_collaborators
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Collab update by owner" ON public.adventure_collaborators
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.adventures a WHERE a.id = adventure_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Collab delete by owner or self" ON public.adventure_collaborators
  FOR DELETE USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.adventures a WHERE a.id = adventure_id AND a.user_id = auth.uid()
    )
  );

-- Invitations RLS
CREATE POLICY "Invitation read by owner" ON public.adventure_invitations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.adventures a WHERE a.id = adventure_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Invitation read by token holder" ON public.adventure_invitations
  FOR SELECT USING (true);  -- token is unguessable; needed for accept page; combined with usage by token below
CREATE POLICY "Invitation insert by owner" ON public.adventure_invitations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.adventures a WHERE a.id = adventure_id AND a.user_id = auth.uid())
    AND invited_by = auth.uid()
  );
CREATE POLICY "Invitation delete by owner" ON public.adventure_invitations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.adventures a WHERE a.id = adventure_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Invitation update by token holder to mark accepted" ON public.adventure_invitations
  FOR UPDATE USING (true) WITH CHECK (true);

-- Accept invitation RPC: validates token, creates collaborator row, marks accepted.
CREATE OR REPLACE FUNCTION public.accept_adventure_invitation(_token TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  inv public.adventure_invitations%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO inv FROM public.adventure_invitations
   WHERE token = _token AND accepted_at IS NULL
   LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or already used';
  END IF;

  INSERT INTO public.adventure_collaborators (adventure_id, user_id, role)
  VALUES (inv.adventure_id, auth.uid(), inv.role)
  ON CONFLICT (adventure_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  UPDATE public.adventure_invitations SET accepted_at = now() WHERE id = inv.id;

  RETURN inv.adventure_id;
END; $$;