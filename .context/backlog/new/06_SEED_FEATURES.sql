-- ============================================
-- SEED SCRIPT: Feature Definitions COMPLETO
-- ============================================
-- Populate feature_definitions table with ALL features
-- from CSV analysis (Estructuras_v5.csv)
-- TOTAL: 123 features (Fábrica: 31, Casas: 34, Habilitación: 58)
-- ============================================

-- Delete existing features (if any)
TRUNCATE TABLE feature_definitions CASCADE;

-- ============================================
-- FABRICA (31 features)
-- ============================================

-- Servicios Disponibles (10 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label, description,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('fabrica', 'servicios_disponibles', 'dise_std', 'Diseño estándar',
  'Solo entrega casas con diseño standard sin personalización',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 1),

('fabrica', 'servicios_disponibles', 'dise_pers', 'Diseño personalizado',
  'La empresa tiene opciones para personalizar el diseño o la construcción de la casa',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 2),

('fabrica', 'servicios_disponibles', 'insta_premontada', 'Instalación premontada',
  'La casa es transportada ensamblada al terreno de instalación',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 3),

('fabrica', 'servicios_disponibles', 'contr_terreno', 'Construcción en terreno',
  'La casa es construida en el terreno',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 4),

('fabrica', 'servicios_disponibles', 'instalacion', 'Instalación',
  'La empresa ofrece el servicio de instalación',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 5),

('fabrica', 'servicios_disponibles', 'kit_autocons', 'Kits de autoconstrucción',
  'La empresa vende kits de construcción de casas sin ensamblar',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 6),

('fabrica', 'servicios_disponibles', 'ases_tecnica', 'Asesoría técnica',
  'La empresa ofrece asesorías técnicas',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 7),

('fabrica', 'servicios_disponibles', 'ases_legal', 'Asesoría legal',
  'La empresa ofrece asesoría legal',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 8),

('fabrica', 'servicios_disponibles', 'logist_transporte', 'Logística y transporte',
  'La empresa ofrece el servicio de logística o transporte de la casa al terreno',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 9),

('fabrica', 'servicios_disponibles', 'financiamiento', 'Financiamiento',
  'La empresa ofrece opciones de crédito o financiamiento',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 10);

-- Especialidad (7 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label, description,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('fabrica', 'especialidad', 'tiny_houses', 'Tiny Houses',
  'La empresa fabrica tiny houses',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  true, true, true, true, false, '(true or false)', 11),

('fabrica', 'especialidad', 'modulares_sip', 'Casas Modulares Panel SIP',
  'La empresa fabrica casas de panel SIP',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  true, true, true, true, false, '(true or false)', 12),

('fabrica', 'especialidad', 'modulares_container', 'Casas Modulares Container',
  'La empresa fabrica casas modulares en base a containers',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  true, true, true, true, false, '(true or false)', 13),

('fabrica', 'especialidad', 'modulares_hormigon', 'Casas Modulares Hormigón',
  'La empresa fabrica casas de hormigón',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  true, true, true, true, false, '(true or false)', 14),

('fabrica', 'especialidad', 'modulares_madera', 'Casas Modulares Madera',
  'La empresa fabrica casas de madera',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  true, true, true, true, false, '(true or false)', 15),

('fabrica', 'especialidad', 'prefabricada_tradicional', 'Casas Prefabricadas Madera',
  'La empresa fabrica casas prefabricadas tradicionales no modulares',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  true, true, true, true, false, '(true or false)', 16),

('fabrica', 'especialidad', 'oficinas_modulares', 'Oficinas Modulares Container',
  'La empresa fabrica oficinas modulares basadas en containers',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  true, true, true, true, false, '(true or false)', 17);

-- Generales (14 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label, description,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order, validation_rules
) VALUES
('fabrica', 'generales', 'experiencia', 'Experiencia',
  'Años de experiencia de la empresa',
  'number', false, null, null, null,
  false, false, true, true, false, 'input text número', 18, '{"min": 0, "max": 100}'),

('fabrica', 'generales', 'nombre_empresa', 'Nombre de la Empresa',
  'Nombre comercial de la fábrica',
  'text', false, null, null, null,
  true, true, true, true, false, 'input text string', 19, '{}'),

('fabrica', 'generales', 'descripcion', 'Descripción breve',
  'Descripción corta de la empresa',
  'text', false, null, null, null,
  true, true, true, true, false, 'textarea', 20, '{}'),

('fabrica', 'generales', 'ubi_direccion', 'Ubicación Dirección',
  'Dirección física de la empresa',
  'text', false, null, null, null,
  false, false, false, true, false, 'input text string', 21, '{}'),

('fabrica', 'generales', 'ubi_region', 'Ubicación Región',
  'Región donde está ubicada la empresa',
  'text', false, null, null, null,
  true, true, true, true, false, 'select ISO region', 22, '{}'),

('fabrica', 'generales', 'instagram', 'Instagram',
  'Usuario de Instagram de la empresa',
  'text', false, null, null, null,
  false, false, false, true, false, 'input text string', 23, '{}'),

('fabrica', 'generales', 'instagram2', 'Instagram2',
  'Usuario secundario de Instagram',
  'text', false, null, null, null,
  false, false, false, false, false, 'input text string', 24, '{}'),

('fabrica', 'generales', 'telefono', 'Teléfono',
  'Número de contacto',
  'text', false, null, null, null,
  false, true, true, true, true, 'input text string', 25, '{}'),

('fabrica', 'generales', 'email', 'Correo Electrónico',
  'Email de contacto',
  'text', false, null, null, null,
  false, false, true, true, true, 'input text email', 26, '{}'),

('fabrica', 'generales', 'cobertura', 'Cobertura geográfica',
  'Regiones donde la empresa ofrece servicios',
  'text_array', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, 'checklist ISO regions', 27, '{}'),

('fabrica', 'generales', 'llave_en_mano', 'Llave en Mano',
  'La fábrica entrega casas llave en mano',
  'boolean', true, 'checkbox', 'lateral', 'checkbox',
  false, true, true, true, false, '(true or false)', 28, '{}'),

('fabrica', 'generales', 'publica_precios', 'Publica precios',
  'La empresa publica sus precios públicamente',
  'boolean', true, 'checkbox', null, 'checkbox',
  true, false, false, false, false, '(true or false)', 29, '{}'),

('fabrica', 'generales', 'precio_ref_min_m2', 'Precio Referencia Mínimo/m²',
  'Entre todas las casas del catálogo, el precio por m² más económico',
  'number', true, 'slider', 'lateral', 'slider',
  false, true, true, false, false, 'input text número', 30, '{"min": 0}'),

('fabrica', 'generales', 'precio_ref_max_m2', 'Precio Referencia Máximo/m²',
  'Entre todas las casas del catálogo, el precio por m² más caro',
  'number', true, 'slider', 'lateral', 'slider',
  false, true, true, false, false, 'input text número', 31, '{"min": 0}');

-- ============================================
-- CASAS (34 features)
-- ============================================

-- Servicios Disponibles (5 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label, description,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('casas', 'servicios_disponibles', 'insta_premontada', 'Instalación premontada',
  'La casa se entrega previamente ensamblada',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 1),

('casas', 'servicios_disponibles', 'contr_terreno', 'Construcción en terreno',
  'La casa se construye o ensambla en el terreno de destino',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 2),

('casas', 'servicios_disponibles', 'instalacion', 'Instalación',
  'La casa tiene opción de instalación incluida',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 3),

('casas', 'servicios_disponibles', 'logist_transporte', 'Logística y transporte',
  'La casa tiene opción de transporte al terreno de instalación',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 4),

('casas', 'servicios_disponibles', 'financiamiento', 'Financiamiento',
  'La casa puede ser comprada con opciones de financiamiento de la fábrica',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 5);

-- Ventanas (4 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label, description,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('casas', 'ventanas', 'vent_termopanel', 'Termopanel',
  'La casa tiene ventanas de termopanel',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 6),

('casas', 'ventanas', 'vent_pvc', 'Marco de PVC',
  'La casa tiene ventanas de PVC',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 7),

('casas', 'ventanas', 'vent_aluminio', 'Marco de Aluminio',
  'La casa tiene ventanas de aluminio',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 8),

('casas', 'ventanas', 'vent_madera', 'Marco de Madera',
  'La casa tiene ventanas de madera',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 9);

-- Tecnología de Materiales (17 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label, description,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('casas', 'tecnologia_materiales', 'tec_panel_sip', 'Paneles SIP',
  'El material principal de la casa es panel SIP',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 10),

('casas', 'tecnologia_materiales', 'tec_estructura_contenedor', 'Estructura Contenedor',
  'El material principal de la casa es contenedor marítimo',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 11),

('casas', 'tecnologia_materiales', 'tec_losa_radiante', 'Losa Radiante',
  'La casa tiene losa radiante',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 12),

('casas', 'tecnologia_materiales', 'tec_losa_liviano', 'Losa Hormigón Liviano',
  'La casa tiene losa de hormigón liviano',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 13),

('casas', 'tecnologia_materiales', 'tec_jaula_estructural', 'Jaula Acero Estructural',
  'La casa tiene jaula de acero estructural',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 14),

('casas', 'tecnologia_materiales', 'tec_madera', 'Madera',
  'El material principal de la casa es madera',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 15),

('casas', 'tecnologia_materiales', 'tec_materiales_ecoamigables', 'Materiales Ecoamigables',
  'El material principal de la casa son materiales ecoamigables',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 16),

('casas', 'tecnologia_materiales', 'tec_acero_reciclado', 'Acero Reciclado',
  'La casa utiliza acero reciclado',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 17),

('casas', 'tecnologia_materiales', 'tec_acero_galvanizado', 'Acero Galvanizado',
  'La casa utiliza acero galvanizado',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 18),

('casas', 'tecnologia_materiales', 'tec_paneles_poliuretano', 'Paneles de Poliuretano',
  'La casa utiliza paneles de poliuretano',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 19),

('casas', 'tecnologia_materiales', 'tec_zinc', 'Zinc',
  'La casa utiliza zinc',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 20),

('casas', 'tecnologia_materiales', 'tec_fibrocemento', 'Fibrocemento',
  'La casa utiliza fibrocemento',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 21),

('casas', 'tecnologia_materiales', 'tec_osb', 'OSB',
  'La casa utiliza OSB',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 22),

('casas', 'tecnologia_materiales', 'tec_poliestireno_expandido', 'Poliestireno Expandido',
  'La casa utiliza poliestireno expandido',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 23),

('casas', 'tecnologia_materiales', 'tec_acero_marítimo', 'Acero Container Marítimo',
  'La casa utiliza acero de container marítimo',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 24),

('casas', 'tecnologia_materiales', 'tec_vulcometal', 'Vulcometal',
  'La casa utiliza vulcometal',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 25),

('casas', 'tecnologia_materiales', 'tec_metalcon', 'Metalcon',
  'La casa utiliza metalcon',
  'boolean', true, 'checklist', null, 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 26);

-- Generales (8 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label, description,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order, validation_rules
) VALUES
('casas', 'generales', 'fabrica', 'Fábrica',
  'Fábrica que produce esta casa',
  'text', false, null, null, null,
  true, true, true, true, false, 'select provider_id', 27, '{}'),

('casas', 'generales', 'topologia', 'Topología',
  'Nomenclatura para número de dormitorios y baños (ej: 2D-1B)',
  'text', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, 'checklist tipologias', 28, '{}'),

('casas', 'generales', 'm2', 'm²',
  'Metros cuadrados de la casa',
  'number', true, 'slider', 'lateral', 'slider',
  true, true, true, true, false, 'input text número', 29, '{"min": 0, "max": 1000}'),

('casas', 'generales', 'precio', 'Precio',
  'Precio base de la casa',
  'number', true, 'slider', 'lateral', 'slider',
  true, true, true, true, false, 'input text número', 30, '{"min": 0}'),

('casas', 'generales', 'precio_oportunidad', 'Precio Oportunidad',
  'Precio especial u oferta',
  'number', false, null, null, null,
  true, true, true, true, true, 'input text número', 31, '{"min": 0}'),

('casas', 'generales', 'llave_en_mano', 'Llave en Mano',
  'Casa entregada llave en mano',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 32, '{}'),

('casas', 'generales', 'modelo', 'Modelo',
  'Nombre del modelo de la casa',
  'text', false, null, null, null,
  true, true, true, true, false, 'input text string', 33, '{}'),

('casas', 'generales', 'descripcion', 'Descripción Breve',
  'Descripción corta de la casa',
  'text', false, null, null, null,
  true, true, true, true, false, 'textarea', 34, '{}');

-- ============================================
-- HABILITACIÓN & SERVICIOS (58 features)
-- ============================================

-- Agua & Sanitarios (6 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'agua_sanitarios', 'agu_perforacion_pozos', 'Perforación de pozos',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 1),

('habilitacion_servicios', 'agua_sanitarios', 'agu_captacion_aguas', 'Captación de Aguas Lluvia',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 2),

('habilitacion_servicios', 'agua_sanitarios', 'agu_alcantarillado_autonomo', 'Alcantarillado Autónomo',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 3),

('habilitacion_servicios', 'agua_sanitarios', 'agu_banos_secos', 'Baños Secos',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 4),

('habilitacion_servicios', 'agua_sanitarios', 'agu_reciclaje_compostaje', 'Reciclaje y Compostaje',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 5),

('habilitacion_servicios', 'agua_sanitarios', 'agu_sistemas_riego', 'Sistemas de Riego',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 6);

-- Contratistas (4 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'contratistas', 'con_construccion_caminos', 'Construcción de Accesos y Caminos',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 7),

('habilitacion_servicios', 'contratistas', 'con_mantenimiento_rurales', 'Mantenimiento de Vías Rurales',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 8),

('habilitacion_servicios', 'contratistas', 'con_invernadores_huertos', 'Invernadores y Huertos',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 9),

('habilitacion_servicios', 'contratistas', 'con_cercos_portones', 'Cercos y Portones',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 10);

-- Energía (3 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'energia', 'ene_paneles_solares', 'Energía Solar',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 11),

('habilitacion_servicios', 'energia', 'ene_generadores_electricos', 'Generadores Eléctricos',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 12),

('habilitacion_servicios', 'energia', 'ene_energia_eolica', 'Energía Eólica',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 13);

-- Climatización (3 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'climatizacion', 'cal_estufas_pellet', 'Estufas a Leña o Pellet',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 14),

('habilitacion_servicios', 'climatizacion', 'cal_calefaccion_solar', 'Calefacción Solar',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 15),

('habilitacion_servicios', 'climatizacion', 'cal_aislamiento_termico', 'Aislamiento Térmico',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 16);

-- Pisos (4 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'pisos', 'pis_pisos_deck', 'Pisos Deck',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 17),

('habilitacion_servicios', 'pisos', 'pis_pisos_madera', 'Pisos de Madera',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 18),

('habilitacion_servicios', 'pisos', 'pis_pisos_vinilicos', 'Pisos Vinílicos',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 19),

('habilitacion_servicios', 'pisos', 'pis_alfombras', 'Alfombras',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 20);

-- Revestimientos (4 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'revestimientos', 'rev_interior_madera', 'Interior Madera',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 21),

('habilitacion_servicios', 'revestimientos', 'rev_exterior_madera', 'Exterior Madera',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 22),

('habilitacion_servicios', 'revestimientos', 'rev_exterior_metal', 'Exterior Metal',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 23),

('habilitacion_servicios', 'revestimientos', 'rev_fibra_mineral', 'Exterior Fibra Mineral',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 24);

-- Ventanas (4 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'ventanas', 'ven_termopanel', 'Termopanel',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 25),

('habilitacion_servicios', 'ventanas', 'ven_marco_pvc', 'Marco de PVC',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 26),

('habilitacion_servicios', 'ventanas', 'ven_marco_aluminio', 'Marco de Aluminio',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 27),

('habilitacion_servicios', 'ventanas', 'ven_marco_madera', 'Marco de Madera',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 28);

-- Cortasoles (3 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'cortasoles', 'cor_madera', 'Madera',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 29),

('habilitacion_servicios', 'cortasoles', 'cor_accionables', 'Accionables',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 30),

('habilitacion_servicios', 'cortasoles', 'cor_folding_shutter', 'Folding/Sliding Shutter',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 31);

-- Fachadas (2 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'fachadas', 'fac_paneles_aislantes', 'Paneles Aislantes',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 32),

('habilitacion_servicios', 'fachadas', 'fac_fachadas_madera', 'Fachadas de Madera',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 33);

-- Seguridad & Comunicación (5 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'seguridad_comunicacion', 'seg_instalacion_repetidores', 'Instalación Antenas y Repetidores',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 34),

('habilitacion_servicios', 'seguridad_comunicacion', 'seg_internet_satelital', 'Internet Satelital',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 35),

('habilitacion_servicios', 'seguridad_comunicacion', 'seg_camaras_remota', 'Cámaras y Vigilancia Remota',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 36),

('habilitacion_servicios', 'seguridad_comunicacion', 'seg_domotica', 'Domótica',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 37),

('habilitacion_servicios', 'seguridad_comunicacion', 'seg_sistemas_seguridad', 'Sistemas de Seguridad',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 38);

-- Control Solar (3 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'control_solar', 'con_cortinas_persianas', 'Cortinas y Persianas',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 39),

('habilitacion_servicios', 'control_solar', 'con_toldos', 'Toldos',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 40),

('habilitacion_servicios', 'control_solar', 'con_pergolas_quinchos', 'Pérgolas y quinchos',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 41);

-- Muebles (2 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'muebles', 'mue_modulares', 'Muebles Modulares',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 42),

('habilitacion_servicios', 'muebles', 'mue_personalizados', 'Muebles Personalizados',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 43);

-- Techo (1 feature)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'techo', 'techo_impermeabilizacion', 'Impermeabilización',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 44);

-- Decoración (2 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'decoracion', 'deco_interiorismo', 'Interiorismo',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 45),

('habilitacion_servicios', 'decoracion', 'deco_paisajismo', 'Paisajismo',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 46);

-- Arquitectura (1 feature)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order
) VALUES
('habilitacion_servicios', 'arquitectura', 'arquitectura', 'Arquitectura y Diseño',
  'boolean', true, 'checklist', 'lateral', 'checklist|varios|todos',
  false, true, true, true, false, '(true or false)', 47);

-- Generales (11 features)
INSERT INTO feature_definitions (
  category, group_name, feature_key, label, description,
  data_type, is_filterable, filter_type, filter_location, filter_format,
  show_in_card_standard, show_in_card_destacado, show_in_card_premium, show_in_landing,
  requires_login, admin_input_type, display_order, validation_rules
) VALUES
('habilitacion_servicios', 'generales', 'experiencia', 'Experiencia',
  'Años de experiencia de la empresa',
  'number', false, null, null, null,
  false, false, true, true, false, 'input text número', 48, '{"min": 0, "max": 100}'),

('habilitacion_servicios', 'generales', 'nombre_empresa', 'Nombre de la Empresa',
  'Nombre comercial de la empresa',
  'text', false, null, null, null,
  true, true, true, true, false, 'input text string', 49, '{}'),

('habilitacion_servicios', 'generales', 'descripcion', 'Descripción breve',
  'Descripción corta de la empresa',
  'text', false, null, null, null,
  true, true, true, true, false, 'textarea', 50, '{}'),

('habilitacion_servicios', 'generales', 'ubi_direccion', 'Ubicación Dirección',
  'Dirección física de la empresa',
  'text', false, null, null, null,
  false, false, false, true, false, 'input text string', 51, '{}'),

('habilitacion_servicios', 'generales', 'ubi_region', 'Ubicación Región',
  'Región donde está ubicada la empresa',
  'text', false, null, null, null,
  true, true, true, true, false, 'select ISO region', 52, '{}'),

('habilitacion_servicios', 'generales', 'instagram', 'Instagram',
  'Usuario de Instagram de la empresa',
  'text', false, null, null, null,
  false, false, false, true, false, 'input text string', 53, '{}'),

('habilitacion_servicios', 'generales', 'instagram2', 'Instagram2',
  'Usuario secundario de Instagram',
  'text', false, null, null, null,
  false, false, false, false, false, 'input text string', 54, '{}'),

('habilitacion_servicios', 'generales', 'telefono', 'Teléfono',
  'Número de contacto',
  'text', false, null, null, null,
  false, true, true, true, true, 'input text string', 55, '{}'),

('habilitacion_servicios', 'generales', 'email', 'Correo Electrónico',
  'Email de contacto',
  'text', false, null, null, null,
  false, false, true, true, true, 'input text email', 56, '{}'),

('habilitacion_servicios', 'generales', 'cobertura', 'Cobertura geográfica',
  'Regiones donde la empresa ofrece servicios',
  'text_array', false, null, null, null,
  false, true, true, true, false, 'checklist ISO regions', 57, '{}'),

('habilitacion_servicios', 'generales', 'publica_precios', 'Publica precios',
  'La empresa publica sus precios públicamente',
  'boolean', false, null, null, null,
  true, false, false, false, false, '(true or false)', 58, '{}');

-- ============================================
-- SUMMARY & VALIDATION
-- ============================================

-- Expected output:
-- fabrica              | 31 | 3  | ~28
-- casas                | 34 | 4  | ~31
-- habilitacion_servicios | 58 | 16 | ~55
-- TOTAL                | 123

SELECT
  category,
  COUNT(*) as total_features,
  COUNT(DISTINCT group_name) as total_groups,
  COUNT(CASE WHEN is_filterable THEN 1 END) as filterable_features
FROM feature_definitions
GROUP BY category
ORDER BY category;

COMMENT ON TABLE feature_definitions IS 'Metadata completa de 123 features dinámicas por categoría. Define qué campos mostrar en cada tier y cómo filtrarlos.';
