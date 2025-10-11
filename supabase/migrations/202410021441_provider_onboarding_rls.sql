DO $$
BEGIN
  IF to_regclass('public.providers') IS NULL THEN
    RAISE NOTICE 'providers table not found; skipping provider policies.';
  ELSE
    EXECUTE 'ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Providers can create own listing" ON public.providers';
    EXECUTE 'CREATE POLICY "Providers can create own listing" ON public.providers FOR INSERT WITH CHECK (profile_id = auth.uid())';
  END IF;

  IF to_regclass('public.provider_categories') IS NULL THEN
    RAISE NOTICE 'provider_categories table not found; skipping provider_categories policies.';
  ELSE
    EXECUTE 'ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Providers manage own provider categories" ON public.provider_categories';
    EXECUTE $p$
      CREATE POLICY "Providers manage own provider categories"
      ON public.provider_categories
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.providers p
          WHERE p.id = provider_categories.provider_id
            AND p.profile_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.providers p
          WHERE p.id = provider_categories.provider_id
            AND p.profile_id = auth.uid()
        )
      )
    $p$;
  END IF;
END
$$;
