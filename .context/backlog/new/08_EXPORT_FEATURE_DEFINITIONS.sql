  -- ============================================
  -- EXPORT feature_definitions to JSON
  -- ============================================
  -- Este query genera el JSON completo agrupado por categoría y grupo

  SELECT json_build_object(
    'fabrica', (
      SELECT json_object_agg(
        group_name,
        (
          SELECT json_agg(
            json_build_object(
              'feature_key', feature_key,
              'label', label,
              'group_name', group_name,
              'category', category,
              'data_type', data_type,
              'is_filterable', is_filterable,
              'filter_type', filter_type,
              'filter_location', filter_location,
              'filter_format', filter_format,
              'show_in_card_standard', show_in_card_standard,
              'show_in_card_destacado', show_in_card_destacado,
              'show_in_card_premium', show_in_card_premium,
              'show_in_landing', show_in_landing,
              'requires_login', requires_login,
              'admin_input_type', admin_input_type,
              'display_order', display_order,
              'validation_rules', validation_rules,
              'description', description
            ) ORDER BY display_order
          )
          FROM feature_definitions
          WHERE category = 'fabrica' AND group_name = g.group_name
        )
      )
      FROM (SELECT DISTINCT group_name FROM feature_definitions WHERE category = 'fabrica') g
    ),
    'casas', (
      SELECT json_object_agg(
        group_name,
        (
          SELECT json_agg(
            json_build_object(
              'feature_key', feature_key,
              'label', label,
              'group_name', group_name,
              'category', category,
              'data_type', data_type,
              'is_filterable', is_filterable,
              'filter_type', filter_type,
              'filter_location', filter_location,
              'filter_format', filter_format,
              'show_in_card_standard', show_in_card_standard,
              'show_in_card_destacado', show_in_card_destacado,
              'show_in_card_premium', show_in_card_premium,
              'show_in_landing', show_in_landing,
              'requires_login', requires_login,
              'admin_input_type', admin_input_type,
              'display_order', display_order,
              'validation_rules', validation_rules,
              'description', description
            ) ORDER BY display_order
          )
          FROM feature_definitions
          WHERE category = 'casas' AND group_name = g.group_name
        )
      )
      FROM (SELECT DISTINCT group_name FROM feature_definitions WHERE category = 'casas') g
    ),
    'habilitacion_servicios', (
      SELECT json_object_agg(
        group_name,
        (
          SELECT json_agg(
            json_build_object(
              'feature_key', feature_key,
              'label', label,
              'group_name', group_name,
              'category', category,
              'data_type', data_type,
              'is_filterable', is_filterable,
              'filter_type', filter_type,
              'filter_location', filter_location,
              'filter_format', filter_format,
              'show_in_card_standard', show_in_card_standard,
              'show_in_card_destacado', show_in_card_destacado,
              'show_in_card_premium', show_in_card_premium,
              'show_in_landing', show_in_landing,
              'requires_login', requires_login,
              'admin_input_type', admin_input_type,
              'display_order', display_order,
              'validation_rules', validation_rules,
              'description', description
            ) ORDER BY display_order
          )
          FROM feature_definitions
          WHERE category = 'habilitacion_servicios' AND group_name = g.group_name
        )
      )
      FROM (SELECT DISTINCT group_name FROM feature_definitions WHERE category = 'habilitacion_servicios') g
    )
  ) AS features_json;