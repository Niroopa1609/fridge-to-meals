    -- Curated recipe catalog for fast matching before AI generation.

    CREATE TABLE public.catalog_recipes (
        id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        slug text NOT NULL,
        title text NOT NULL,
        cuisine text NOT NULL,
        meal_type text NOT NULL,
        prep_time_bucket text,
        cooking_style text,
        is_vegetarian boolean NOT NULL DEFAULT false,
        recipe_json jsonb NOT NULL,
        image_url text NOT NULL DEFAULT '/images/default-food.jpg',
        image_alt text NOT NULL DEFAULT '',
        photographer text NOT NULL DEFAULT '',
        photographer_url text NOT NULL DEFAULT '',
        source text NOT NULL DEFAULT 'seed',
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT catalog_recipes_slug_unique UNIQUE (slug)
    );

    CREATE INDEX idx_catalog_recipes_cuisine_meal ON public.catalog_recipes (cuisine, meal_type);
    CREATE INDEX idx_catalog_recipes_meal_type ON public.catalog_recipes (meal_type);

    CREATE TABLE public.catalog_recipe_ingredients (
        recipe_id uuid NOT NULL REFERENCES public.catalog_recipes (id) ON DELETE CASCADE,
        ingredient_token text NOT NULL,
        is_required boolean NOT NULL DEFAULT true,
        PRIMARY KEY (recipe_id, ingredient_token)
    );

    CREATE INDEX idx_catalog_recipe_ingredients_token ON public.catalog_recipe_ingredients (ingredient_token);

    ALTER TABLE public.catalog_recipes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.catalog_recipe_ingredients ENABLE ROW LEVEL SECURITY;

    GRANT ALL ON TABLE public.catalog_recipes TO service_role;
    GRANT ALL ON TABLE public.catalog_recipe_ingredients TO service_role;
