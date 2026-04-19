-- Update seed function with coordinates
CREATE OR REPLACE FUNCTION public.seed_venice_for_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  adv_id UUID;
BEGIN
  INSERT INTO public.adventures (user_id, name, city, date, cover_emoji, shape_variant)
  VALUES (NEW.id, 'Venice Family Adventure', 'Venice', CURRENT_DATE, '🏛️', 'pink')
  RETURNING id INTO adv_id;

  INSERT INTO public.stops (adventure_id, user_id, order_index, name, category, duration, notes, kid_description, walking_time_to_next, emoji, tags, lat, lng) VALUES
    (adv_id, NEW.id, 0,  'Santa Lucia Station',         'transport', 15, 'Arrive and get oriented. Bathrooms available inside.', 'Welcome to Venice! 🚂 This city has NO cars — only boats and walking!', 3, '🚉', ARRAY['kid-friendly'], 45.4414, 12.3202),
    (adv_id, NEW.id, 1,  'Pasticceria Dal Mas',         'food',      25, 'Great pastries and coffee. Counter service, fast. Try the croissants.', 'Time for yummy croissants! 🥐 Pick your favorite one from the counter!', 5, '☕', ARRAY['kid-friendly','quick-service','vegetarian'], 45.4408, 12.3218),
    (adv_id, NEW.id, 2,  'Grand Canal Vaporetto Ride',  'transport', 35, 'Take Line 1 from Ferrovia to San Marco. Sit outside for best views.', 'All aboard the water bus! 🚤 Can you count all the bridges we go under?', 2, '⛴️', ARRAY['kid-friendly'], 45.4401, 12.3220),
    (adv_id, NEW.id, 3,  'Piazza San Marco',            'sight',     40, 'Main square. Skip the basilica line with kids unless they''re patient. The pigeons and the square itself are the show.', 'Find the golden lions on the tower! 🦁 This square is 900 years old — older than dinosaur movies!', 12, '⛪', ARRAY['kid-friendly'], 45.4341, 12.3388),
    (adv_id, NEW.id, 4,  'Rialto Bridge',               'sight',     20, 'Walk across the famous bridge. Great photo spot. Shops on the bridge.', 'This bridge is almost 500 years old! 🌉 Can you see the fish market from up here?', 3, '🌉', ARRAY['kid-friendly'], 45.4380, 12.3359),
    (adv_id, NEW.id, 5,  'Suso Gelatoteca',             'gelato',    15, 'Best gelato near Rialto. Try pistachio or stracciatella. Pregnancy-safe (pasteurized).', 'GELATO TIME! 🍦 Pick two flavors — you deserve it after all that walking!', 10, '🍦', ARRAY['kid-friendly','quick-service','vegetarian','pregnancy-safe'], 45.4375, 12.3350),
    (adv_id, NEW.id, 6,  'Campo Santa Margherita',      'break',     30, 'Lively campo. Kids can run around safely. Benches for parents.', 'Run around time! 🏃 A big square just for playing!', 8, '🌳', ARRAY['kid-friendly'], 45.4359, 12.3244),
    (adv_id, NEW.id, 7,  'Gallerie dell''Accademia',    'sight',     45, 'World-class art museum. Skip if kids are tired.', 'A castle full of paintings! 🖼️ Find your favorite one.', 6, '🖼️', ARRAY['kid-friendly'], 45.4314, 12.3272),
    (adv_id, NEW.id, 8,  'Punta della Dogana',          'sight',     20, 'Beautiful viewpoint at the tip of Dorsoduro. Great photo spot.', 'Stand at the pointy tip of the island! 📸 Wave at the boats!', 12, '📸', ARRAY['kid-friendly'], 45.4307, 12.3358),
    (adv_id, NEW.id, 9,  'Giardini della Biennale',     'break',     30, 'Quiet park to rest. Benches and shade.', 'Tree time! 🌳 Take a deep breath and a snack break.', 10, '🌳', ARRAY['kid-friendly','shade-rest'], 45.4328, 12.3502),
    (adv_id, NEW.id, 10, 'Trattoria al Mariner',        'food',      45, 'Family-friendly restaurant near San Marco. Pasta and seafood. High chairs available.', 'Dinner! 🍝 Try the spaghetti — it''s the best in Venice!', NULL, '🍝', ARRAY['kid-friendly','vegetarian'], 45.4345, 12.3390);

  RETURN NEW;
END; $$;

-- Backfill existing Venice stops by name
UPDATE public.stops SET lat = 45.4414, lng = 12.3202 WHERE name = 'Santa Lucia Station' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4408, lng = 12.3218 WHERE name = 'Pasticceria Dal Mas' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4401, lng = 12.3220 WHERE name = 'Grand Canal Vaporetto Ride' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4341, lng = 12.3388 WHERE name = 'Piazza San Marco' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4380, lng = 12.3359 WHERE name = 'Rialto Bridge' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4375, lng = 12.3350 WHERE name = 'Suso Gelatoteca' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4375, lng = 12.3350 WHERE name = 'Antico Forno' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4359, lng = 12.3244 WHERE name IN ('Campo Santa Margherita','Campo San Polo') AND lat IS NULL;
UPDATE public.stops SET lat = 45.4314, lng = 12.3272 WHERE name LIKE 'Gallerie%' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4307, lng = 12.3358 WHERE name = 'Punta della Dogana' AND lat IS NULL;
UPDATE public.stops SET lat = 45.4328, lng = 12.3502 WHERE name IN ('Giardini della Biennale','Cannaregio Canal Walk') AND lat IS NULL;
UPDATE public.stops SET lat = 45.4345, lng = 12.3390 WHERE name IN ('Trattoria al Mariner','Hotel / Rest') AND lat IS NULL;