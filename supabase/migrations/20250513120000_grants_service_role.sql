-- PostgREST uses the service_role JWT from SUPABASE_SERVICE_ROLE_KEY.
-- Tables created via raw SQL are not automatically granted to service_role; without GRANT you get:
-- "permission denied for table users" (and similar for other tables).
-- service_role still bypasses RLS in Supabase; anon/authenticated are unchanged.

GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.fridge_items TO service_role;
GRANT ALL ON TABLE public.favorite_recipes TO service_role;
GRANT ALL ON TABLE public.refresh_tokens TO service_role;
GRANT ALL ON TABLE public.today_picks_cache TO service_role;
GRANT ALL ON TABLE public.user_preferences TO service_role;
GRANT ALL ON TABLE public.catalog_recipes TO service_role;
GRANT ALL ON TABLE public.catalog_recipe_ingredients TO service_role;
