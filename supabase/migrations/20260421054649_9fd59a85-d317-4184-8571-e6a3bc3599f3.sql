-- Remove permissive policies
DROP POLICY IF EXISTS "Invitation read by token holder" ON public.adventure_invitations;
DROP POLICY IF EXISTS "Invitation update by token holder to mark accepted" ON public.adventure_invitations;

-- Server function to look up an invitation by token (used by accept page)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token TEXT)
RETURNS TABLE (
  adventure_id UUID,
  email TEXT,
  role public.adventure_role,
  accepted_at TIMESTAMPTZ,
  adventure_name TEXT,
  adventure_city TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT i.adventure_id, i.email, i.role, i.accepted_at, a.name, a.city
  FROM public.adventure_invitations i
  JOIN public.adventures a ON a.id = i.adventure_id
  WHERE i.token = _token
  LIMIT 1;
$$;