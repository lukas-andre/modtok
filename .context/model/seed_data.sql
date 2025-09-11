-- MODTOK Marketplace Seed Data
-- Based on CSV structure from Estructuras_v3.xlsx
-- PostgreSQL seed data for development/testing

-- =============================================
-- FEATURES/ATTRIBUTES (Based on CSV data)
-- =============================================

-- First, let's get the category IDs we'll need
DO $$
DECLARE
    casas_cat_id UUID;
    fabricantes_cat_id UUID;
    servicios_cat_id UUID;
    decoracion_cat_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO casas_cat_id FROM categories WHERE type = 'casas';
    SELECT id INTO fabricantes_cat_id FROM categories WHERE type = 'fabricantes';
    SELECT id INTO servicios_cat_id FROM categories WHERE type = 'habilitacion_servicios';
    SELECT id INTO decoracion_cat_id FROM categories WHERE type = 'decoracion';

    -- =============================================
    -- FABRICANTES FEATURES (from cat_principales.csv)
    -- =============================================
    
    INSERT INTO features (category_id, name, slug, type, filter_location, filter_format, show_in_card_premium, show_in_card_featured, show_in_landing) VALUES
    -- Servicios Disponibles
    (fabricantes_cat_id, 'Llave en Mano', 'llave-en-mano', 'boolean', 'lateral', 'checkbox', true, false, true),
    (fabricantes_cat_id, 'Diseño Standard', 'diseno-standard', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Diseño Personalizado', 'diseno-personalizado', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Instalación Premontada', 'instalacion-premontada', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Construcción en Terreno', 'construccion-terreno', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Instalación', 'instalacion', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Kits de Autoconstrucción', 'kits-autoconstruccion', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Asesoría Técnica', 'asesoria-tecnica', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Asesoría Legal', 'asesoria-legal', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Construcción Personalizada', 'construccion-personalizada', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Logística y Transporte', 'logistica-transporte', 'boolean', null, 'label', false, true, false),
    (fabricantes_cat_id, 'Financiamiento', 'financiamiento', 'boolean', null, 'label', false, true, false),
    
    -- Ventanas
    (fabricantes_cat_id, 'Termopanel', 'ventanas-termopanel', 'boolean', 'lateral', 'checkbox', true, true, false),
    (fabricantes_cat_id, 'Marco de PVC', 'ventanas-pvc', 'boolean', 'lateral', 'checkbox', true, true, false),
    (fabricantes_cat_id, 'Marco de Aluminio', 'ventanas-aluminio', 'boolean', 'lateral', 'checkbox', true, true, false),
    (fabricantes_cat_id, 'Marco de Madera', 'ventanas-madera', 'boolean', 'lateral', 'checkbox', true, true, false),
    
    -- Tecnología de Materiales
    (fabricantes_cat_id, 'Paneles SIP', 'paneles-sip', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Estructura Contenedor', 'estructura-contenedor', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Losa Radiante', 'losa-radiante', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Losa Hormigón Liviano', 'losa-hormigon-liviano', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Jaula Acero Estructural', 'jaula-acero', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Madera', 'madera', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Cartón', 'carton', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Lana', 'lana', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Materiales Ecoamigables', 'materiales-eco', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Acero Reciclado', 'acero-reciclado', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Acero Galvanizado', 'acero-galvanizado', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Paneles de Poliuretano', 'paneles-poliuretano', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Zinc', 'zinc', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Fibrocemento', 'fibrocemento', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'OSB', 'osb', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Poliestireno Expandido', 'poliestireno-expandido', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Contenedor Marítimo', 'contenedor-maritimo', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Vulcometal', 'vulcometal', 'boolean', null, null, true, true, false),
    (fabricantes_cat_id, 'Metalcon', 'metalcon', 'boolean', null, null, true, true, false),
    
    -- Especialidades
    (fabricantes_cat_id, 'Tiny Houses', 'tiny-houses', 'boolean', 'lateral', 'checkbox', true, false, false),
    (fabricantes_cat_id, 'Casas Modulares Panel SIP', 'casas-panel-sip', 'boolean', 'lateral', 'checkbox', true, false, false),
    (fabricantes_cat_id, 'Casas Modulares Container', 'casas-container', 'boolean', 'lateral', 'checkbox', true, false, false),
    (fabricantes_cat_id, 'Casas Modulares Hormigón', 'casas-hormigon', 'boolean', 'lateral', 'checkbox', true, false, false),
    (fabricantes_cat_id, 'Casas Modulares Madera', 'casas-madera', 'boolean', 'lateral', 'checkbox', true, false, false),
    (fabricantes_cat_id, 'Casas Prefabricadas Madera', 'prefab-madera', 'boolean', 'lateral', 'checkbox', true, false, false),
    (fabricantes_cat_id, 'Oficinas Modulares Container', 'oficinas-container', 'boolean', 'lateral', 'checkbox', true, false, false);

    -- =============================================
    -- HABILITACIÓN & SERVICIOS FEATURES
    -- =============================================
    
    INSERT INTO features (category_id, name, slug, type, filter_location, filter_format, show_in_card_premium) VALUES
    -- Agua & Sanitarios
    (servicios_cat_id, 'Perforación de Pozos', 'perforacion-pozos', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Captación de Agua Lluvia', 'captacion-agua-lluvia', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Alcantarillado Autónomo', 'alcantarillado-autonomo', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Baños Secos', 'banos-secos', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Reciclaje y Compostaje', 'reciclaje-compostaje', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Sistemas de Riego', 'sistemas-riego', 'boolean', 'lateral', 'checkbox', true),
    
    -- Contratistas
    (servicios_cat_id, 'Construcción de Accesos y Caminos', 'construccion-accesos', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Mantenimiento de Vías Rurales', 'mantenimiento-vias', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Invernadores y Huertos', 'invernadores-huertos', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Cercos y Portones', 'cercos-portones', 'boolean', 'lateral', 'checkbox', true),
    
    -- Energía
    (servicios_cat_id, 'Paneles Solares', 'paneles-solares', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Generadores Eléctricos', 'generadores-electricos', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Energía Eólica', 'energia-eolica', 'boolean', 'lateral', 'checkbox', true),
    
    -- Calefacción
    (servicios_cat_id, 'Estufas a Leña o Pellet', 'estufas-lena-pellet', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Calefacción Solar', 'calefaccion-solar', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Aislamiento Térmico', 'aislamiento-termico', 'boolean', 'lateral', 'checkbox', true),
    
    -- Pisos
    (servicios_cat_id, 'Pisos Deck', 'pisos-deck', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Pisos de Madera', 'pisos-madera', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Pisos Vinílicos', 'pisos-vinilicos', 'boolean', 'lateral', 'checkbox', true),
    (servicios_cat_id, 'Alfombras', 'alfombras', 'boolean', 'lateral', 'checkbox', true),
    
    -- Revestimientos
    (servicios_cat_id, 'Revestimiento Interior Madera', 'revestimiento-interior-madera', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Revestimiento Exterior Madera', 'revestimiento-exterior-madera', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Revestimiento Exterior Metal', 'revestimiento-exterior-metal', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Revestimiento Exterior Fibra Mineral', 'revestimiento-fibra-mineral', 'boolean', 'lateral', null, true),
    
    -- Cortasoles
    (servicios_cat_id, 'Cortasoles Madera', 'cortasoles-madera', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Cortasoles Accionables', 'cortasoles-accionables', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Folding / Sliding Shutter', 'folding-sliding-shutter', 'boolean', 'lateral', null, true),
    
    -- Fachadas
    (servicios_cat_id, 'Paneles Aislantes', 'paneles-aislantes-fachada', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Fachadas de Madera', 'fachadas-madera', 'boolean', 'lateral', null, true),
    
    -- Seguridad & Comunicación
    (servicios_cat_id, 'Instalación Antenas y Repetidores', 'antenas-repetidores', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Internet Satelital', 'internet-satelital', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Cámaras y Vigilancia Remota', 'camaras-vigilancia', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Domótica', 'domotica', 'boolean', 'lateral', null, true),
    (servicios_cat_id, 'Sistemas de Seguridad', 'sistemas-seguridad', 'boolean', 'lateral', null, true);

    -- =============================================
    -- DECORACIÓN FEATURES
    -- =============================================
    
    INSERT INTO features (category_id, name, slug, type, filter_location, show_in_card_premium) VALUES
    (decoracion_cat_id, 'Cortinas y Persianas', 'cortinas-persianas', 'boolean', 'lateral', true),
    (decoracion_cat_id, 'Toldos', 'toldos', 'boolean', 'lateral', true),
    (decoracion_cat_id, 'Pérgolas y Quinchos', 'pergolas-quinchos', 'boolean', 'lateral', true),
    (decoracion_cat_id, 'Muebles Modulares / Equipamiento', 'muebles-modulares', 'boolean', 'lateral', true);

END $$;

-- =============================================
-- SAMPLE ADMIN USERS
-- =============================================

-- NOTE: These UUIDs should match actual auth.users entries
-- In a real deployment, these would be created through Supabase Auth

INSERT INTO profiles (id, email, full_name, role, status, bio) VALUES 
(gen_random_uuid(), 'admin@modtok.cl', 'Admin MODTOK', 'super_admin', 'active', 'Administrador principal de la plataforma'),
(gen_random_uuid(), 'editor@modtok.cl', 'Carlos Pérez', 'editor', 'active', 'Editor de contenido y aprobación de proveedores'),
(gen_random_uuid(), 'author@modtok.cl', 'María González', 'author', 'active', 'Redactora de contenido y blog');

-- =============================================
-- SAMPLE PROVIDERS (Based on HTML examples)
-- =============================================

-- Get some profile IDs for providers (in real scenario, these would be actual user accounts)
DO $$
DECLARE
    admin_id UUID;
    provider1_profile_id UUID := gen_random_uuid();
    provider2_profile_id UUID := gen_random_uuid();
    provider3_profile_id UUID := gen_random_uuid();
    provider4_profile_id UUID := gen_random_uuid();
    provider5_profile_id UUID := gen_random_uuid();
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE role = 'super_admin' LIMIT 1;

    -- Create provider profiles
    INSERT INTO profiles (id, email, full_name, role, status, company_name) VALUES 
    (provider1_profile_id, 'contacto@ecomodular.cl', 'EcoModular Pro', 'provider', 'active', 'EcoModular Pro'),
    (provider2_profile_id, 'contacto@araucaniamodular.cl', 'Araucanía Modular', 'provider', 'active', 'Araucanía Modular'),
    (provider3_profile_id, 'contacto@solarpucon.cl', 'Solar Pucón', 'provider', 'active', 'Solar Pucón'),
    (provider4_profile_id, 'contacto@pozosdelsur.cl', 'Pozos del Sur', 'provider', 'active', 'Pozos del Sur'),
    (provider5_profile_id, 'contacto@tinyhousechile.cl', 'Tiny House Chile', 'provider', 'active', 'Tiny House Chile');

    -- EcoModular Pro (Premium Manufacturer)
    INSERT INTO providers (
        profile_id, category_type, company_name, slug, description, description_long, tier, status,
        email, phone, whatsapp, website, city, region, 
        years_experience, specialties, services_offered, coverage_areas,
        price_range_min, price_range_max, price_per_m2_min, price_per_m2_max,
        llave_en_mano, financing_available, 
        gallery_images, certifications,
        meta_title, meta_description, keywords,
        approved_by, approved_at, featured_until, premium_until,
        features
    ) VALUES (
        provider1_profile_id, 'fabricantes', 'EcoModular Pro', 'ecomodular-pro',
        'Líderes en construcción modular sustentable con certificación LEED',
        'Con más de 15 años de experiencia en el mercado chileno, EcoModular Pro se ha consolidado como el líder en construcción modular sustentable.',
        'premium', 'active',
        'contacto@ecomodular.cl', '+56 2 2345 6789', '+56 9 8765 4321', 'https://ecomodular.cl',
        'Santiago', 'Región Metropolitana',
        15, ARRAY['Paneles SIP', 'Construcción Sustentable', 'Casas Modulares'],
        ARRAY['Llave en Mano', 'Diseño Personalizado', 'Financiamiento', 'Transporte'],
        ARRAY['Región Metropolitana', 'Valparaíso', 'Biobío', 'La Araucanía', 'Los Lagos'],
        45000000, 200000000, 65000, 120000,
        true, true,
        ARRAY['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'],
        '["LEED Certified", "ISO 9001", "NCh 433"]'::jsonb,
        'EcoModular Pro - Líder en Construcción Modular Sustentable', 
        'EcoModular Pro: 15 años de experiencia en construcción modular sustentable. Certificación LEED, garantía 10 años.',
        ARRAY['casas modulares', 'construcción sustentable', 'paneles sip', 'leed'],
        admin_id, NOW(), NOW() + INTERVAL '1 year', NOW() + INTERVAL '6 months',
        '{"paneles_sip": true, "llave_en_mano": true, "financiamiento": true, "diseno_personalizado": true, "materiales_eco": true}'::jsonb
    );

    -- Araucanía Modular (Featured Manufacturer)
    INSERT INTO providers (
        profile_id, category_type, company_name, slug, description, tier, status,
        email, phone, city, region, years_experience, 
        specialties, coverage_areas, price_range_min, price_range_max,
        llave_en_mano, approved_by, approved_at, featured_until,
        features
    ) VALUES (
        provider2_profile_id, 'fabricantes', 'Araucanía Modular', 'araucania-modular',
        'Especialistas en casas para clima de montaña. Aislación térmica superior.',
        'destacado', 'active',
        'contacto@araucaniamodular.cl', '+56 45 234 5678', 'Temuco', 'La Araucanía',
        12, ARRAY['Casas de Montaña', 'Aislación Térmica', 'Madera'],
        ARRAY['La Araucanía', 'Los Lagos', 'Los Ríos'],
        35000000, 120000000,
        true, admin_id, NOW(), NOW() + INTERVAL '3 months',
        '{"madera": true, "llave_en_mano": true, "aislamiento_termico": true}'::jsonb
    );

    -- Solar Pucón (Service Provider)
    INSERT INTO providers (
        profile_id, category_type, company_name, slug, description, tier, status,
        email, phone, city, region, years_experience,
        specialties, coverage_areas, price_range_min, price_range_max,
        approved_by, approved_at, featured_until,
        features
    ) VALUES (
        provider3_profile_id, 'habilitacion_servicios', 'Solar Pucón', 'solar-pucon',
        'Instalación de paneles solares y sistemas off-grid para zonas rurales.',
        'destacado', 'active',
        'contacto@solarpucon.cl', '+56 45 345 6789', 'Pucón', 'La Araucanía',
        8, ARRAY['Energía Solar', 'Sistemas Off-Grid'],
        ARRAY['La Araucanía', 'Los Lagos', 'Los Ríos'],
        5000000, 25000000,
        admin_id, NOW(), NOW() + INTERVAL '3 months',
        '{"paneles_solares": true, "energia_eolica": false}'::jsonb
    );

    -- Pozos del Sur (Service Provider)
    INSERT INTO providers (
        profile_id, category_type, company_name, slug, description, tier, status,
        email, phone, city, region, years_experience,
        specialties, coverage_areas, price_range_min, price_range_max,
        approved_by, approved_at, featured_until,
        features
    ) VALUES (
        provider4_profile_id, 'habilitacion_servicios', 'Pozos del Sur', 'pozos-del-sur',
        'Perforación de pozos profundos y sistemas de tratamiento de aguas.',
        'destacado', 'active',
        'contacto@pozosdelsur.cl', '+56 45 456 7890', 'Temuco', 'La Araucanía',
        10, ARRAY['Perforación de Pozos', 'Tratamiento de Aguas'],
        ARRAY['La Araucanía', 'Los Lagos', 'Biobío'],
        8000000, 15000000,
        admin_id, NOW(), NOW() + INTERVAL '3 months',
        '{"perforacion_pozos": true, "sistemas_riego": true}'::jsonb
    );

    -- Tiny House Chile (Manufacturer)
    INSERT INTO providers (
        profile_id, category_type, company_name, slug, description, tier, status,
        email, phone, city, region, years_experience,
        specialties, coverage_areas, price_range_min, price_range_max,
        llave_en_mano, approved_by, approved_at,
        features
    ) VALUES (
        provider5_profile_id, 'fabricantes', 'Tiny House Chile', 'tiny-house-chile',
        'Especialistas en casas pequeñas y móviles.',
        'standard', 'active',
        'contacto@tinyhousechile.cl', '+56 2 567 8901', 'Santiago', 'Región Metropolitana',
        5, ARRAY['Tiny Houses', 'Casas Móviles'],
        ARRAY['Región Metropolitana', 'Valparaíso'],
        20000000, 60000000,
        true, admin_id, NOW(),
        '{"tiny_houses": true, "casas_madera": true, "mobile": true}'::jsonb
    );

END $$;

-- =============================================
-- SAMPLE HOUSES (Based on HTML examples)
-- =============================================

DO $$
DECLARE
    ecomodular_id UUID;
    araucania_id UUID;
    tiny_chile_id UUID;
    topology_2b2b UUID;
    topology_3b2b UUID;
    topology_4b3b UUID;
    topology_1b1b UUID;
    topology_3b25b UUID;
BEGIN
    -- Get provider IDs
    SELECT id INTO ecomodular_id FROM providers WHERE slug = 'ecomodular-pro';
    SELECT id INTO araucania_id FROM providers WHERE slug = 'araucania-modular';
    SELECT id INTO tiny_chile_id FROM providers WHERE slug = 'tiny-house-chile';
    
    -- Get topology IDs
    SELECT id INTO topology_2b2b FROM house_topologies WHERE code = '2B2B';
    SELECT id INTO topology_3b2b FROM house_topologies WHERE code = '3B2B';
    SELECT id INTO topology_4b3b FROM house_topologies WHERE code = '4B3B';
    SELECT id INTO topology_1b1b FROM house_topologies WHERE code = '1B1B';
    SELECT id INTO topology_3b25b FROM house_topologies WHERE code = '3B2.5B';

    -- Casa Lago Premium (Premium)
    INSERT INTO houses (
        provider_id, name, slug, description, description_long, tier, status,
        topology_id, bedrooms, bathrooms, area_m2, area_built_m2,
        price, currency, price_per_m2,
        main_material, technology_materials, windows_type, services_included,
        llave_en_mano, sustainable, smart_home,
        main_image_url, gallery_images,
        delivery_time_days, assembly_time_days, warranty_years,
        meta_title, meta_description, keywords,
        features
    ) VALUES (
        ecomodular_id, 'Casa Lago Premium', 'casa-lago-premium',
        'Casa de lujo de 220m² con vista al lago. 4 habitaciones, 3 baños, terraza panorámica.',
        'Casa premium con diseño vanguardista de 220m², tecnología SIP de última generación. Incluye domótica y eficiencia energética A+.',
        'premium', 'active',
        topology_4b3b, 4, 3, 220.00, 200.00,
        185000000, 'CLP', 841000,
        'Paneles SIP', ARRAY['Paneles SIP', 'Acero Galvanizado'], ARRAY['Termopanel', 'Marco de Aluminio'],
        ARRAY['Llave en Mano', 'Financiamiento', 'Smart Home'],
        true, true, true,
        'https://images.unsplash.com/photo-1567428485548-c499e4931c10?w=400',
        ARRAY['https://images.unsplash.com/photo-1567428485548-c499e4931c10?w=400', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400'],
        90, 30, 10,
        'Casa Lago Premium - Casa Modular de Lujo 220m²',
        'Casa premium de 220m² con tecnología SIP, 4 habitaciones, domótica y vista al lago. Llave en mano.',
        ARRAY['casa premium', 'paneles sip', 'vista lago', 'smart home'],
        '{"paneles_sip": true, "smart_home": true, "sustainable": true, "termopanel": true}'::jsonb
    );

    -- Villa Moderna Sustentable (Premium)
    INSERT INTO houses (
        provider_id, name, slug, description, tier, status,
        topology_id, bedrooms, bathrooms, area_m2,
        price, currency, price_per_m2,
        main_material, technology_materials,
        llave_en_mano, sustainable, off_grid_ready,
        main_image_url,
        warranty_years,
        features
    ) VALUES (
        ecomodular_id, 'Villa Moderna Sustentable', 'villa-moderna-sustentable',
        'Diseño vanguardista de 180m² con certificación energética A+. Sistema solar incluido.',
        'premium', 'active',
        topology_3b25b, 3, 2.5, 180.00,
        165000000, 'CLP', 917000,
        'Paneles SIP', ARRAY['Paneles SIP', 'Materiales Ecoamigables'],
        true, true, true,
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400',
        10,
        '{"paneles_sip": true, "materiales_eco": true, "off_grid_ready": true, "paneles_solares": true}'::jsonb
    );

    -- Casa Montaña Deluxe (Premium) 
    INSERT INTO houses (
        provider_id, name, slug, description, tier, status,
        topology_id, bedrooms, bathrooms, area_m2,
        price, currency, price_per_m2,
        main_material, technology_materials,
        llave_en_mano,
        main_image_url,
        warranty_years,
        features
    ) VALUES (
        araucania_id, 'Casa Montaña Deluxe', 'casa-montana-deluxe',
        'Refugio de montaña de 150m² con acabados premium. Aislación térmica superior.',
        'premium', 'active',
        topology_3b2b, 3, 2, 150.00,
        145000000, 'CLP', 967000,
        'Madera', ARRAY['Madera', 'Aislamiento Térmico'],
        true,
        'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400',
        10,
        '{"madera": true, "aislamiento_termico": true, "estufas_lena_pellet": true}'::jsonb
    );

    -- Casa Familiar Modular (Featured)
    INSERT INTO houses (
        provider_id, name, slug, description, tier, status,
        topology_id, bedrooms, bathrooms, area_m2,
        price, currency, price_per_m2,
        main_material, technology_materials,
        main_image_url,
        features
    ) VALUES (
        ecomodular_id, 'Casa Familiar Modular', 'casa-familiar-modular',
        '120m², 3 habitaciones, 2 baños. Perfecta para familias.',
        'destacado', 'active',
        topology_3b2b, 3, 2, 120.00,
        85000000, 'CLP', 708000,
        'Paneles SIP', ARRAY['Paneles SIP'],
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400',
        '{"paneles_sip": true}'::jsonb
    );

    -- Tiny House Minimalista (Featured)
    INSERT INTO houses (
        provider_id, name, slug, description, tier, status,
        topology_id, bedrooms, bathrooms, area_m2,
        price, currency, price_per_m2,
        main_material, 
        mobile,
        main_image_url,
        features
    ) VALUES (
        tiny_chile_id, 'Tiny House Minimalista', 'tiny-house-minimalista',
        '35m² optimizados al máximo. Ideal para parejas o solteros.',
        'destacado', 'active',
        topology_1b1b, 1, 1, 35.00,
        28000000, 'CLP', 800000,
        'Madera',
        true,
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
        '{"madera": true, "mobile": true, "tiny_houses": true}'::jsonb
    );

END $$;

-- =============================================
-- SAMPLE SERVICES
-- =============================================

DO $$
DECLARE
    solar_pucon_id UUID;
    pozos_sur_id UUID;
    servicios_cat_id UUID;
BEGIN
    SELECT id INTO solar_pucon_id FROM providers WHERE slug = 'solar-pucon';
    SELECT id INTO pozos_sur_id FROM providers WHERE slug = 'pozos-del-sur';
    SELECT id INTO servicios_cat_id FROM categories WHERE type = 'habilitacion_servicios';

    INSERT INTO services (
        provider_id, category_id, name, slug, description, tier, status,
        service_type, price_from, price_to, price_unit,
        coverage_areas, main_image_url,
        meta_title, meta_description, keywords,
        features
    ) VALUES
    -- Solar Solutions
    (solar_pucon_id, servicios_cat_id, 'Instalación de Paneles Solares Residenciales', 'paneles-solares-residenciales',
     'Sistema completo de paneles solares para hogares. Incluye instalación, inversor y conexión.',
     'destacado', 'active',
     'Energía Solar', 8500000, 25000000, 'per_project',
     ARRAY['La Araucanía', 'Los Lagos', 'Los Ríos'],
     'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
     'Instalación de Paneles Solares - Solar Pucón',
     'Instalación profesional de paneles solares residenciales. Autonomía energética total para tu hogar.',
     ARRAY['paneles solares', 'energía solar', 'off grid', 'sustentable'],
     '{"paneles_solares": true, "generadores_electricos": false}'::jsonb
    ),
    
    -- Well Drilling
    (pozos_sur_id, servicios_cat_id, 'Perforación de Pozos Profundos', 'perforacion-pozos-profundos',
     'Perforación de pozos de agua potable hasta 150 metros de profundidad. Incluye bomba y sistema de distribución.',
     'destacado', 'active',
     'Agua y Saneamiento', 8000000, 15000000, 'per_project',
     ARRAY['La Araucanía', 'Los Lagos', 'Biobío'],
     'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400',
     'Perforación de Pozos Profundos - Pozos del Sur',
     'Perforación profesional de pozos profundos con garantía. Agua potable para tu hogar rural.',
     ARRAY['pozos profundos', 'agua potable', 'perforación', 'rural'],
     '{"perforacion_pozos": true, "sistemas_riego": true}'::jsonb
    );

END $$;

-- =============================================
-- SAMPLE HOTSPOTS
-- =============================================

INSERT INTO hotspots (
    name, slug, description, description_long, city, region,
    latitude, longitude, population, altitude_m, distance_santiago_km, nearest_airport,
    terrain_cost_min, terrain_cost_max, construction_cost_m2_avg,
    why_build_here, regulations_info, permits_info, restrictions,
    hero_image_url, gallery_images,
    meta_title, meta_description,
    providers_count, projects_count,
    climate_data, useful_links
) VALUES (
    'Pucón', 'pucon',
    'La capital del turismo aventura es también un destino ideal para tu casa modular.',
    'Pucón se ha convertido en uno de los destinos más codiciados para segundas viviendas en Chile. Su combinación única de belleza natural, actividades al aire libre y creciente infraestructura turística lo convierten en el lugar perfecto para tu casa modular.',
    'Pucón', 'La Araucanía',
    -39.2706, -71.9537, 28523, 227, 780, 'Temuco (100 km)',
    30000000, 60000000, 850000,
    'Entorno natural único rodeado por el Volcán Villarrica, el Lago Villarrica y múltiples parques nacionales. Alto potencial de arriendo turístico con ocupación promedio del 65% anual.',
    'Verifica la zonificación del terreno. Zonas rurales permiten construcciones de hasta 120m² sin permiso de edificación.',
    'Tiempo promedio de tramitación: 45-60 días. Costo aproximado: 1-2% del valor de la construcción.',
    'Algunas zonas tienen restricciones por cercanía a parques nacionales o cuerpos de agua. Consulta con la CONAF y DGA.',
    'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=1600',
    ARRAY['https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'],
    'Casas Modulares en Pucón - HotSpot MODTOK',
    'Descubre fabricantes y servicios de construcción modular en Pucón. Guía completa para construir tu casa modular en la zona lacustre.',
    15, 127,
    '{"avg_temp_summer": 22, "avg_temp_winter": 8, "rainfall_mm": 2600, "humidity": 65}'::jsonb,
    '[
        {"name": "Municipalidad de Pucón", "url": "https://pucon.cl"},
        {"name": "Plan Regulador Comunal", "url": "#"},
        {"name": "Guía de Permisos PDF", "url": "#"},
        {"name": "Terrenos Disponibles", "url": "#"},
        {"name": "Calculadora de Costos", "url": "#"}
    ]'::jsonb
);

-- =============================================
-- SAMPLE BLOG POSTS
-- =============================================

DO $$
DECLARE
    carlos_id UUID;
    admin_id UUID;
BEGIN
    SELECT id INTO carlos_id FROM profiles WHERE email = 'author@modtok.cl';
    SELECT id INTO admin_id FROM profiles WHERE role = 'super_admin' LIMIT 1;

    INSERT INTO blog_posts (
        author_id, editor_id, title, slug, excerpt, content, category, tags, status, published_at,
        meta_title, meta_description, keywords, reading_time_minutes, featured_image_url
    ) VALUES (
        carlos_id, admin_id,
        'Tendencias en Construcción Modular 2024',
        'tendencias-construccion-modular-2024',
        'Descubre las últimas innovaciones en tecnología y diseño que están transformando el mercado de viviendas modulares en Chile.',
        'El mercado de construcción modular en Chile está experimentando una transformación sin precedentes...',
        'tendencias',
        ARRAY['tendencias', 'sustentabilidad', 'tecnología', 'smart home', 'construcción modular', 'chile 2024'],
        'published', NOW() - INTERVAL '5 days',
        'Tendencias en Construcción Modular 2024 - MODTOK Blog',
        'Descubre las últimas innovaciones en tecnología y diseño que están transformando el mercado de viviendas modulares en Chile.',
        ARRAY['construcción modular', 'tendencias 2024', 'casas modulares chile', 'sustentabilidad'],
        8, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600'
    );

END $$;

-- =============================================
-- SAMPLE USER FAVORITES (Watchlist)
-- =============================================

-- Create a sample user
DO $$
DECLARE
    sample_user_id UUID := gen_random_uuid();
    casa_lago_id UUID;
    ecomodular_id UUID;
    solar_service_id UUID;
BEGIN
    -- Create sample user profile
    INSERT INTO profiles (id, email, full_name, role, status) VALUES 
    (sample_user_id, 'juan.perez@email.com', 'Juan Pérez', 'user', 'active');

    -- Get some item IDs
    SELECT id INTO casa_lago_id FROM houses WHERE slug = 'casa-lago-premium';
    SELECT id INTO ecomodular_id FROM providers WHERE slug = 'ecomodular-pro';
    SELECT id INTO solar_service_id FROM services WHERE slug = 'paneles-solares-residenciales';

    -- Add items to favorites with notes
    INSERT INTO user_favorites (user_id, item_type, item_id, notes, tags, priority) VALUES 
    (sample_user_id, 'house', casa_lago_id, 'Me encanta el diseño y la vista al lago. Revisar opciones de financiamiento.', ARRAY['favorito', 'lago'], 3),
    (sample_user_id, 'provider', ecomodular_id, 'Excelente reputación y certificación LEED. Contactar para cotización.', ARRAY['premium', 'sustentable'], 3),
    (sample_user_id, 'service', solar_service_id, 'Para complementar la casa modular con energía solar.', ARRAY['energia', 'off-grid'], 2);

END $$;

-- =============================================
-- SAMPLE INQUIRIES
-- =============================================

DO $$
DECLARE
    sample_user_id UUID;
    ecomodular_id UUID;
    casa_lago_id UUID;
BEGIN
    SELECT id INTO sample_user_id FROM profiles WHERE email = 'juan.perez@email.com';
    SELECT id INTO ecomodular_id FROM providers WHERE slug = 'ecomodular-pro';
    SELECT id INTO casa_lago_id FROM houses WHERE slug = 'casa-lago-premium';

    INSERT INTO inquiries (
        user_id, provider_id, item_type, item_id, name, email, phone,
        message, project_location, budget_min, budget_max, timeline, status
    ) VALUES (
        sample_user_id, ecomodular_id, 'house', casa_lago_id,
        'Juan Pérez', 'juan.perez@email.com', '+56 9 8765 4321',
        'Estoy interesado en la Casa Lago Premium. Me gustaría más información sobre opciones de financiamiento y tiempos de construcción.',
        'Pucón, La Araucanía', 150000000, 200000000, '6-8 meses',
        'pending'
    );

END $$;

-- =============================================
-- UPDATE COUNTERS
-- =============================================

-- Update provider counts in hotspots
UPDATE hotspots SET 
    providers_count = (
        SELECT COUNT(*) FROM providers 
        WHERE region = hotspots.region AND status = 'active'
    );

-- Add some sample analytics data
INSERT INTO analytics_events (
    user_id, session_id, event_type, event_category, event_action, 
    target_type, target_id, page_url, ip_address, device_type, browser, country
)
SELECT 
    (SELECT id FROM profiles WHERE email = 'juan.perez@email.com'),
    'session_' || generate_random_uuid()::text,
    'page_view',
    'house',
    'view_details',
    'house',
    id,
    '/houses/' || slug,
    '192.168.1.1'::inet,
    'desktop',
    'Chrome',
    'Chile'
FROM houses
WHERE tier = 'premium'
LIMIT 5;

-- =============================================
-- FINAL STATISTICS UPDATE
-- =============================================

-- Update view counts based on sample analytics
UPDATE houses SET views_count = 15 WHERE tier = 'premium';
UPDATE houses SET views_count = 8 WHERE tier = 'destacado';
UPDATE houses SET views_count = 3 WHERE tier = 'standard';

UPDATE providers SET views_count = 25 WHERE tier = 'premium';
UPDATE providers SET views_count = 12 WHERE tier = 'destacado';
UPDATE providers SET views_count = 5 WHERE tier = 'standard';

UPDATE blog_posts SET views_count = 1245 WHERE slug = 'tendencias-construccion-modular-2024';

-- =============================================
-- END OF SEED DATA
-- =============================================