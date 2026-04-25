-- Folders for organizing adventures
CREATE TABLE public.adventure_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🗺',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.adventure_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Folders select own" ON public.adventure_folders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Folders insert own" ON public.adventure_folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Folders update own" ON public.adventure_folders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Folders delete own" ON public.adventure_folders
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER adventure_folders_touch
BEFORE UPDATE ON public.adventure_folders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Add folder_id to adventures
ALTER TABLE public.adventures
  ADD COLUMN folder_id UUID REFERENCES public.adventure_folders(id) ON DELETE SET NULL;

CREATE INDEX idx_adventures_folder_id ON public.adventures(folder_id);