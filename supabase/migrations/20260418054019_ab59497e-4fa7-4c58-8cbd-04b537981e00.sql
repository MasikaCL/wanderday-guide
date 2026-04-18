
-- Adventures table
CREATE TABLE public.adventures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  date DATE,
  cover_emoji TEXT NOT NULL DEFAULT '🗺️',
  shape_variant TEXT NOT NULL DEFAULT 'pink',
  current_stop_index INT NOT NULL DEFAULT 0,
  kid_mode BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stops table
CREATE TABLE public.stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adventure_id UUID NOT NULL REFERENCES public.adventures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  duration INT,
  notes TEXT,
  kid_description TEXT,
  walking_time_to_next INT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  google_maps_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  emoji TEXT NOT NULL DEFAULT '📍',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stops_adventure ON public.stops(adventure_id, order_index);
CREATE INDEX idx_adventures_user ON public.adventures(user_id);

-- RLS
ALTER TABLE public.adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own adventures select" ON public.adventures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own adventures insert" ON public.adventures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own adventures update" ON public.adventures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own adventures delete" ON public.adventures FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Own stops select" ON public.stops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own stops insert" ON public.stops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own stops update" ON public.stops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own stops delete" ON public.stops FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_adv_touch BEFORE UPDATE ON public.adventures
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_stops_touch BEFORE UPDATE ON public.stops
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-seed Venice on signup
CREATE OR REPLACE FUNCTION public.seed_venice_for_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  adv_id UUID;
BEGIN
  INSERT INTO public.adventures (user_id, name, city, date, cover_emoji, shape_variant)
  VALUES (NEW.id, 'Venice Family Adventure', 'Venice', CURRENT_DATE, '🏛️', 'pink')
  RETURNING id INTO adv_id;

  INSERT INTO public.stops (adventure_id, user_id, order_index, name, category, duration, notes, kid_description, walking_time_to_next, emoji, tags) VALUES
    (adv_id, NEW.id, 0,  'Santa Lucia Station',         'transport', 15, 'Arrive and get oriented. Bathrooms available inside.', 'Welcome to Venice! 🚂 This city has NO cars — only boats and walking!', 3, '🚉', ARRAY['kid-friendly']),
    (adv_id, NEW.id, 1,  'Pasticceria Dal Mas',         'food',      25, 'Great pastries and coffee. Counter service, fast. Try the croissants.', 'Time for yummy croissants! 🥐 Pick your favorite one from the counter!', 5, '☕', ARRAY['kid-friendly','quick-service','vegetarian']),
    (adv_id, NEW.id, 2,  'Grand Canal Vaporetto Ride',  'transport', 35, 'Take Line 1 from Ferrovia to San Marco. Sit outside for best views.', 'All aboard the water bus! 🚤 Can you count all the bridges we go under?', 2, '⛴️', ARRAY['kid-friendly']),
    (adv_id, NEW.id, 3,  'Piazza San Marco',            'sight',     40, 'Main square. Skip the basilica line with kids unless they''re patient. The pigeons and the square itself are the show.', 'Find the golden lions on the tower! 🦁 This square is 900 years old — older than dinosaur movies!', 12, '⛪', ARRAY['kid-friendly']),
    (adv_id, NEW.id, 4,  'Rialto Bridge',               'sight',     20, 'Walk across the famous bridge. Great photo spot. Shops on the bridge.', 'This bridge is almost 500 years old! 🌉 Can you see the fish market from up here?', 3, '🌉', ARRAY['kid-friendly']),
    (adv_id, NEW.id, 5,  'Antico Forno',                'food',      30, 'Amazing pizza al taglio (by the slice). Affordable, quick, kid-approved. Near Rialto.', 'Pizza time! 🍕 Point at the one you want and they''ll cut you a big slice!', 8, '🍕', ARRAY['kid-friendly','quick-service','vegetarian']),
    (adv_id, NEW.id, 6,  'Suso Gelatoteca',             'gelato',    15, 'Best gelato near Rialto. Try pistachio or stracciatella. Pregnancy-safe (pasteurized).', 'GELATO TIME! 🍦 Pick two flavors — you deserve it after all that walking!', 10, '🍦', ARRAY['kid-friendly','quick-service','vegetarian','pregnancy-safe']),
    (adv_id, NEW.id, 7,  'Campo San Polo',              'break',     30, 'Biggest campo in Venice. Kids can run around safely. Benches for parents. Fountain.', 'Run around time! 🏃 This is the biggest playground-square in all of Venice!', 15, '🌳', ARRAY['kid-friendly']),
    (adv_id, NEW.id, 8,  'Cannaregio Canal Walk',       'sight',     25, 'Quieter area, beautiful canal views. Less crowded than San Marco area. Jewish Ghetto nearby.', 'A quiet, magical walk by the water 🌊 Look for cats sleeping on windowsills!', 8, '🏘️', ARRAY['kid-friendly']),
    (adv_id, NEW.id, 9,  'Trattoria al Mariner',        'food',      45, 'Family-friendly restaurant. Pasta and seafood. Reservations recommended. High chairs available.', 'Dinner! 🍝 Try the spaghetti — it''s the best in Venice! (Maybe in the world!)', 10, '🍝', ARRAY['kid-friendly','vegetarian']),
    (adv_id, NEW.id, 10, 'Hotel / Rest',                'transport',  0, 'Head back to your accommodation. Great job today!', 'You explored all of Venice today! 🌟 Time for a cozy bed. Sweet dreams!', NULL, '🏨', ARRAY[]::TEXT[]);

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_seed_venice
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_venice_for_new_user();
