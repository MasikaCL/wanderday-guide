-- 1. Add new columns to stops
ALTER TABLE public.stops
  ADD COLUMN IF NOT EXISTS start_time TEXT,
  ADD COLUMN IF NOT EXISTS facts TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS spot_it TEXT;

-- 2. Backfill start times for already-seeded Venice stops
UPDATE public.stops SET start_time = '08:30' WHERE name = 'Santa Lucia Station';
UPDATE public.stops SET start_time = '08:50' WHERE name = 'Pasticceria Dal Mas';
UPDATE public.stops SET start_time = '09:30' WHERE name = 'Grand Canal Vaporetto Ride';
UPDATE public.stops SET start_time = '10:30' WHERE name = 'Piazza San Marco';
UPDATE public.stops SET start_time = '11:30' WHERE name = 'Rialto Bridge';
UPDATE public.stops SET start_time = '12:00' WHERE name = 'Suso Gelatoteca';
UPDATE public.stops SET start_time = '12:30' WHERE name = 'Campo Santa Margherita';
UPDATE public.stops SET start_time = '13:30' WHERE name = 'Gallerie dell''Accademia';
UPDATE public.stops SET start_time = '14:30' WHERE name = 'Punta della Dogana';
UPDATE public.stops SET start_time = '15:15' WHERE name = 'Giardini della Biennale';
UPDATE public.stops SET start_time = '16:30' WHERE name = 'Trattoria al Mariner';

-- 3. Backfill sights facts + spot-it
UPDATE public.stops SET
  facts = ARRAY[
    '🛶 4 km long, lined with 170 palaces',
    '🏛 Was Venice''s main street for 1000 years',
    '🚤 Only powered boats and gondolas allowed'
  ],
  spot_it = 'Count the gondolas you pass — who gets the highest number?'
WHERE name = 'Grand Canal Vaporetto Ride';

UPDATE public.stops SET
  facts = ARRAY[
    '⛪ Built in 828 AD',
    '🌊 Floods about 100 times a year',
    '🇫🇷 Napoleon called it Europe''s drawing room'
  ],
  spot_it = 'Find the golden lion on the bell tower — it has been there for 600 years!'
WHERE name = 'Piazza San Marco';

UPDATE public.stops SET
  facts = ARRAY[
    '🏗 Built in 1591',
    '🌉 Was the only Grand Canal crossing for 300 years',
    '🪵 Stands on 12,000 wooden piles'
  ],
  spot_it = 'Look for the stone merchants'' relief carvings on the archway sides'
WHERE name = 'Rialto Bridge';

UPDATE public.stops SET
  facts = ARRAY[
    '🖼 Holds Venice''s greatest paintings',
    '🏛 Building dates to the 1300s',
    '🎨 Home to Bellini, Titian and Tintoretto'
  ],
  spot_it = 'Find the biggest painting in the museum — how many people can you count in it?'
WHERE name = 'Gallerie dell''Accademia';

UPDATE public.stops SET
  facts = ARRAY[
    '📍 Where the Grand Canal meets St Mark''s Basin',
    '🌬 The golden ball on top spins like a weathervane',
    '🏛 Once a customs house for arriving ships'
  ],
  spot_it = 'Find the two giant Atlas figures holding up the golden globe'
WHERE name = 'Punta della Dogana';

-- 4. Update the seed function so future signups get the same data
CREATE OR REPLACE FUNCTION public.seed_venice_for_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  adv_id UUID;
BEGIN
  INSERT INTO public.adventures (user_id, name, city, date, cover_emoji, shape_variant)
  VALUES (NEW.id, 'Venice Family Adventure', 'Venice', CURRENT_DATE, '🏛️', 'pink')
  RETURNING id INTO adv_id;

  INSERT INTO public.stops (adventure_id, user_id, order_index, name, category, duration, notes, kid_description, walking_time_to_next, emoji, tags, lat, lng, start_time, facts, spot_it) VALUES
    (adv_id, NEW.id, 0,  'Santa Lucia Station',         'transport', 15, 'Arrive and get oriented. Bathrooms available inside.', 'Welcome to Venice! 🚂 This city has NO cars — only boats and walking!', 3, '🚉', ARRAY['kid-friendly'], 45.4414, 12.3202, '08:30', ARRAY[]::TEXT[], NULL),
    (adv_id, NEW.id, 1,  'Pasticceria Dal Mas',         'food',      25, 'Great pastries and coffee. Counter service, fast. Try the croissants.', 'Time for yummy croissants! 🥐 Pick your favorite one from the counter!', 5, '☕', ARRAY['kid-friendly','quick-service','vegetarian'], 45.4408, 12.3218, '08:50', ARRAY[]::TEXT[], NULL),
    (adv_id, NEW.id, 2,  'Grand Canal Vaporetto Ride',  'transport', 35, 'Take Line 1 from Ferrovia to San Marco. Sit outside for best views.', 'All aboard the water bus! 🚤 Can you count all the bridges we go under?', 2, '⛴️', ARRAY['kid-friendly'], 45.4401, 12.3220, '09:30',
      ARRAY['🛶 4 km long, lined with 170 palaces','🏛 Was Venice''s main street for 1000 years','🚤 Only powered boats and gondolas allowed'],
      'Count the gondolas you pass — who gets the highest number?'),
    (adv_id, NEW.id, 3,  'Piazza San Marco',            'sight',     40, 'Main square. Skip the basilica line with kids unless they''re patient. The pigeons and the square itself are the show.', 'Find the golden lions on the tower! 🦁 This square is 900 years old — older than dinosaur movies!', 12, '⛪', ARRAY['kid-friendly'], 45.4341, 12.3388, '10:30',
      ARRAY['⛪ Built in 828 AD','🌊 Floods about 100 times a year','🇫🇷 Napoleon called it Europe''s drawing room'],
      'Find the golden lion on the bell tower — it has been there for 600 years!'),
    (adv_id, NEW.id, 4,  'Rialto Bridge',               'sight',     20, 'Walk across the famous bridge. Great photo spot. Shops on the bridge.', 'This bridge is almost 500 years old! 🌉 Can you see the fish market from up here?', 3, '🌉', ARRAY['kid-friendly'], 45.4380, 12.3359, '11:30',
      ARRAY['🏗 Built in 1591','🌉 Was the only Grand Canal crossing for 300 years','🪵 Stands on 12,000 wooden piles'],
      'Look for the stone merchants'' relief carvings on the archway sides'),
    (adv_id, NEW.id, 5,  'Suso Gelatoteca',             'gelato',    15, 'Best gelato near Rialto. Try pistachio or stracciatella. Pregnancy-safe (pasteurized).', 'GELATO TIME! 🍦 Pick two flavors — you deserve it after all that walking!', 10, '🍦', ARRAY['kid-friendly','quick-service','vegetarian','pregnancy-safe'], 45.4375, 12.3350, '12:00', ARRAY[]::TEXT[], NULL),
    (adv_id, NEW.id, 6,  'Campo Santa Margherita',      'break',     30, 'Lively campo. Kids can run around safely. Benches for parents.', 'Run around time! 🏃 A big square just for playing!', 8, '🌳', ARRAY['kid-friendly'], 45.4359, 12.3244, '12:30', ARRAY[]::TEXT[], NULL),
    (adv_id, NEW.id, 7,  'Gallerie dell''Accademia',    'sight',     45, 'World-class art museum. Skip if kids are tired.', 'A castle full of paintings! 🖼️ Find your favorite one.', 6, '🖼️', ARRAY['kid-friendly'], 45.4314, 12.3272, '13:30',
      ARRAY['🖼 Holds Venice''s greatest paintings','🏛 Building dates to the 1300s','🎨 Home to Bellini, Titian and Tintoretto'],
      'Find the biggest painting in the museum — how many people can you count in it?'),
    (adv_id, NEW.id, 8,  'Punta della Dogana',          'sight',     20, 'Beautiful viewpoint at the tip of Dorsoduro. Great photo spot.', 'Stand at the pointy tip of the island! 📸 Wave at the boats!', 12, '📸', ARRAY['kid-friendly'], 45.4307, 12.3358, '14:30',
      ARRAY['📍 Where the Grand Canal meets St Mark''s Basin','🌬 The golden ball on top spins like a weathervane','🏛 Once a customs house for arriving ships'],
      'Find the two giant Atlas figures holding up the golden globe'),
    (adv_id, NEW.id, 9,  'Giardini della Biennale',     'break',     30, 'Quiet park to rest. Benches and shade.', 'Tree time! 🌳 Take a deep breath and a snack break.', 10, '🌳', ARRAY['kid-friendly','shade-rest'], 45.4328, 12.3502, '15:15', ARRAY[]::TEXT[], NULL),
    (adv_id, NEW.id, 10, 'Trattoria al Mariner',        'food',      45, 'Family-friendly restaurant near San Marco. Pasta and seafood. High chairs available.', 'Dinner! 🍝 Try the spaghetti — it''s the best in Venice!', NULL, '🍝', ARRAY['kid-friendly','vegetarian'], 45.4345, 12.3390, '16:30', ARRAY[]::TEXT[], NULL);

  RETURN NEW;
END; $function$;