-- Fridge to Meals — initial schema for Supabase PostgreSQL
--
-- AUTH DECISION (Option B): Keep public.users + password_hash + refresh_tokens.
-- This matches the prior Spring Boot app and avoids migrating passwords into Supabase Auth.
-- Next.js Route Handlers validate JWT, then use the service role for DB access.
-- RLS is enabled for defense-in-depth; the service role bypasses RLS. Direct anon/authenticated
-- access to these tables remains blocked unless you add explicit policies later.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    email varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE public.fridge_items (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    category varchar(64) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_fridge_items_user_name_lower ON public.fridge_items (user_id, lower(name::text));

CREATE TABLE public.favorite_recipes (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipe_json jsonb NOT NULL,
    title text,
    image_url text,
    meal_type text,
    prep_time text,
    difficulty text,
    main_ingredients text,
    photographer text,
    photographer_url text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    last_used_at timestamptz,
    user_agent text,
    ip text,
    CONSTRAINT chk_expires_after_created CHECK ((expires_at > created_at))
);

CREATE INDEX idx_refresh_tokens_expires_at ON public.refresh_tokens USING btree (expires_at);
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);

CREATE TABLE public.today_picks_cache (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    pick_date date NOT NULL,
    fridge_hash varchar(128) NOT NULL,
    response_json text NOT NULL,
    used_ingredients_json text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT today_picks_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_today_picks_cache_user_date ON public.today_picks_cache (user_id, pick_date);
CREATE INDEX idx_today_picks_cache_user_date_desc ON public.today_picks_cache (user_id, pick_date DESC);

CREATE TABLE public.user_preferences (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_cuisines jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_preferences_user_id ON public.user_preferences (user_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fridge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.today_picks_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- No policies: deny direct table access for anon/authenticated roles via PostgREST.
-- Application uses service_role from trusted server code only.
