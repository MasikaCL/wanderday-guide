-- Recreate the INSERT policy with explicit role targeting
DROP POLICY IF EXISTS "Own adventures insert" ON public.adventures;

CREATE POLICY "Own adventures insert"
  ON public.adventures
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);