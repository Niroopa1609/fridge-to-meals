CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    CONSTRAINT chk_password_reset_expires_after_created CHECK ((expires_at > created_at))
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.password_reset_tokens TO service_role;
