DROP POLICY IF EXISTS "Own adventures select" ON public.adventures;

CREATE POLICY "Own adventures select"
ON public.adventures
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Own adventures insert" ON public.adventures;

CREATE POLICY "Own adventures insert"
ON public.adventures
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);