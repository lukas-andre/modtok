# Análisis Completo del CSV - Estructuras v5

## Resumen Ejecutivo

El CSV define la estructura de datos para **3 categorías principales**:
1. **Fábrica** (Fabricantes/Manufacturers)
2. **Casas** (Houses)
3. **Habilitación & Servicios** (Services)

**ELIMINADA**: Decoración (ya no se usa)

---

## Estructura de Columnas del CSV

| Columna | Descripción |
|---------|-------------|
| `Orden` | Orden de visualización del campo |
| `Categoria` | Fábrica / Casas / Habilitación & Servicios |
| `Feature Disponible` o `Familia` | Grupo al que pertenece el campo |
| `Etiqueta` o `Tipo` | Nombre visible del campo |
| `Filtro /Ubicacion` | Dónde aparece el filtro (Lateral, no) |
| `formulario admin` | Tipo de input en el admin |
| `Formato en Filtro` | checklist, slider, etc. |
| `Dato en Bloque Std` | ¿Se muestra en tarjeta Standard? (SI/NO) |
| `Dato en tarjeta Premium` | ¿Se muestra en tarjeta Premium? (SI/NO) |
| `Dato en tarjeta Destacada` | ¿Se muestra en tarjeta Destacada? (SI/NO) |
| `Dato en Landing` | ¿Se muestra en Landing/Página dedicada? (SI/NO) |
| `Observaciones` | Notas adicionales |
| `nombre_columna` | Nombre técnico del campo en BD |
| `logica columna` | Descripción de la lógica |
| `posibles valores` | Valores permitidos |

---

## CATEGORÍA 1: FÁBRICA (Fabricantes)

### Grupos de Features

#### **Servicios Disponibles** (10 campos - todos boolean)
| # | Feature | Columna BD | Filtro Lateral | Tarjeta Std | Premium | Destacada | Landing |
|---|---------|------------|----------------|-------------|---------|-----------|---------|
| 1 | Diseño estándar | `dise_std` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 2 | Diseño personalizado | `dise_pers` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 3 | Instalación premontada | `insta_premontada` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 4 | Construcción en terreno | `contr_terreno` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 5 | Instalación | `instalacion` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 6 | Kits de autoconstrucción | `kit_autocons` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 7 | Asesoría técnica | `ases_tecnica` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 8 | Asesoría legal | `ases_legal` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 9 | Logística y transporte | `logist_transporte` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 10 | Financiamiento | `financiamiento` | ✅ | ❌ | ✅ | ✅ | ✅ |

#### **Especialidad** (7 campos - todos boolean)
| # | Feature | Columna BD | Filtro Lateral | Tarjeta Std | Premium | Destacada | Landing |
|---|---------|------------|----------------|-------------|---------|-----------|---------|
| 11 | Tiny Houses | `tiny_houses` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 12 | Casas Modulares Panel SIP | `modulares_sip` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 13 | Casas Modulares Container | `modulares_container` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 14 | Casas Modulares Hormigón | `modulares_hormigon` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 15 | Casas Modulares Madera | `modulares_madera` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 16 | Casas Prefabricadas Madera | `prefabricada_tradicional` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 17 | Oficinas Modulares Container | `oficinas_modulares` | ✅ | ✅ | ✅ | ✅ | ✅ |

#### **Generales** (14 campos - tipos mixtos)
| # | Feature | Columna BD | Tipo | Filtro | Tarjeta Std | Premium | Destacada | Landing |
|---|---------|------------|------|--------|-------------|---------|-----------|---------|
| 18 | Experiencia (años) | `experiencia` | number | ❌ | ❌ | Opcional | ✅ | ✅ |
| 19 | Nombre de la Empresa | `nombre_empresa` | text | ❌ | ✅ | ✅ | ✅ | ✅ |
| 20 | Descripción breve | `descripcion` | text | ❌ | ✅ | ✅ | ✅ | ✅ |
| 21 | Ubicación Dirección | `ubi_direccion` | text | ❌ | ❌ | ❌ | ❌ | ✅ |
| 22 | Ubicación Región | `ubi_region` | ISO region | ❌ | ✅ | ✅ | ✅ | ✅ |
| 23 | Instagram | `instagram` | text | ❌ | ❌ | ❌ | ❌ | ✅ |
| 24 | Instagram2 | `instagram2` | text | ❌ | ❌ | ❌ | ❌ | ❌ |
| 25 | Teléfono | `telefono` | text | ❌ | ❌ | ✅ (login) | ✅ | ✅ |
| 26 | Correo Electrónico | `email` | text | ❌ | ✅ (login) | ❌ | ✅ (login) | ✅ |
| 27 | Cobertura geográfica | `cobertura` | ISO regions[] | checklist | ❌ | ✅ | ✅ (login) | ✅ |
| 28 | Llave en Mano | `llave_en_mano` | boolean | checkbox | ❌ | ✅ | ✅ | ✅ |
| 29 | Publica precios | `publica_precios` | boolean | checkbox | ✅ | ❌ | ❌ | ❌ |
| 30 | Precio Ref Min/m² | `precio_ref_min_m2` | number | slider | ❌ | ✅ | ✅ | ❌ |
| 31 | Precio Ref Máx/m² | `precio_ref_max_m2` | number | slider | ❌ | ✅ | ✅ | ❌ |

**Total Fábrica: 31 campos**

---

## CATEGORÍA 2: CASAS

### Grupos de Features

#### **Servicios Disponibles** (5 campos - todos boolean)
| # | Feature | Columna BD | Filtro | Tarjeta Std | Premium | Destacada | Landing |
|---|---------|------------|--------|-------------|---------|-----------|---------|
| 1 | Instalación premontada | `insta_premontada` | checklist | ❌ | ❌ | ✅ | ✅ |
| 2 | Construcción en terreno | `contr_terreno` | checklist | ❌ | ❌ | ✅ | ✅ |
| 3 | Instalación | `instalacion` | checklist | ❌ | ❌ | ✅ | ✅ |
| 4 | Logística y transporte | `logist_transporte` | checklist | ❌ | ❌ | ✅ | ✅ |
| 5 | Financiamiento | `financiamiento` | checklist | ❌ | ❌ | ✅ | ✅ |

#### **Ventanas** (4 campos - todos boolean)
| # | Feature | Columna BD | Filtro Lateral | Tarjeta Std | Premium | Destacada | Landing |
|---|---------|------------|----------------|-------------|---------|-----------|---------|
| 6 | Termopanel | `vent_termopanel` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 7 | Marco de PVC | `vent_pvc` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 8 | Marco de Aluminio | `vent_aluminio` | ✅ | ❌ | ✅ | ✅ | ✅ |
| 9 | Marco de Madera | `vent_madera` | ✅ | ❌ | ✅ | ✅ | ✅ |

#### **Tecnología de Materiales** (15 campos - todos boolean)
| # | Feature | Columna BD | Filtro | Tarjeta Std | Premium | Destacada | Landing |
|---|---------|------------|--------|-------------|---------|-----------|---------|
| 10 | Paneles SIP | `tec_panel_sip` | checklist | ❌ | ✅ | ✅ | ✅ |
| 11 | Estructura Contenedor | `tec_estructura_contenedor` | checklist | ❌ | ✅ | ✅ | ✅ |
| 12 | Losa Radiante | `tec_losa_radiante` | checklist | ❌ | ✅ | ✅ | ✅ |
| 13 | Losa Hormigón Liviano | `tec_losa_liviano` | checklist | ❌ | ✅ | ✅ | ✅ |
| 14 | Jaula Acero Estructural | `tec_jaula_estructural` | checklist | ❌ | ✅ | ✅ | ✅ |
| 15 | Madera | `tec_madera` | checklist | ❌ | ✅ | ✅ | ✅ |
| 16 | Materiales Ecoamigables | `tec_materiales_ecoamigables` | checklist | ❌ | ✅ | ✅ | ✅ |
| 17 | Acero Reciclado | `tec_acero_reciclado` | checklist | ❌ | ✅ | ✅ | ✅ |
| 18 | Acero Galvanizado | `tec_acero_galvanizado` | checklist | ❌ | ✅ | ✅ | ✅ |
| 19 | Paneles de Poliuretano | `tec_paneles_poliuretano` | checklist | ❌ | ✅ | ✅ | ✅ |
| 20 | Zinc | `tec_zinc` | checklist | ❌ | ✅ | ✅ | ✅ |
| 21 | Fibrocemento | `tec_fibrocemento` | checklist | ❌ | ✅ | ✅ | ✅ |
| 22 | OSB | `tec_osb` | checklist | ❌ | ✅ | ✅ | ✅ |
| 23 | Poliestireno Expandido | `tec_poliestireno_expandido` | checklist | ❌ | ✅ | ✅ | ✅ |
| 24 | Acero Container Marítimo | `tec_acero_marítimo` | checklist | ❌ | ✅ | ✅ | ✅ |
| 25 | Vulcometal | `tec_vulcometal` | checklist | ❌ | ✅ | ✅ | ✅ |
| 26 | Metalcon | `tec_metalcon` | checklist | ❌ | ✅ | ✅ | ✅ |

#### **Generales** (6 campos - tipos mixtos)
| # | Feature | Columna BD | Tipo | Filtro Lateral | Tarjeta Std | Premium | Destacada | Landing |
|---|---------|------------|------|----------------|-------------|---------|-----------|---------|
| 27 | Fábrica | `fabrica` | reference | ❌ | ✅ | ✅ | ✅ | ✅ |
| 28 | Topología | `topologia` | checklist | ✅ | ❌ | ✅ | ✅ | ✅ |
| 29 | m² | `m2` | number | slider | ✅ | ✅ | ✅ | ✅ |
| 30 | Precio | `precio` | number | slider | ✅ | ✅ | ✅ | ✅ |
| 31 | Precio Oportunidad | `precio_oportunidad` | number | criteria | ✅ | ✅ (login) | ✅ (login) | ✅ |
| 32 | Llave en Mano | `llave_en_mano` | boolean | checklist | ❌ | ✅ | ✅ | ✅ |
| 33 | Modelo | `modelo` | text | ❌ | ✅ | ✅ | ✅ | ✅ |
| 34 | Descripción Breve | `descripcion` | text | ❌ | ✅ | ✅ | ✅ | ✅ |

**Total Casas: 34 campos**

---

## CATEGORÍA 3: HABILITACIÓN & SERVICIOS

### Familias de Servicios

#### **Agua & Sanitarios** (6 campos - todos boolean laterales)
- Perforación de pozos (`agu_perforación_pozos`)
- Captación de Aguas Lluvia (`agu_checklist_todos`)
- Alcantarillado Autónomo (`agu_alcantarillado_autónomo`)
- Baños Secos (`agu_baños_secos`)
- Reciclaje y Compostaje (`agu_reciclaje_compostaje`)
- Sistemas de Riego (`agu_sistemas_riego`)

#### **Contratistas** (4 campos - todos boolean laterales)
- Construcción de Accesos y Caminos (`con_construcción_caminos`)
- Mantenimiento de Vías Rurales (`con_mantenimiento_rurales`)
- Invernadores y Huertos (`con_invernadores_huertos`)
- Cercos y Portones (`con_cercos_portones`)

#### **Energía** (3 campos - todos boolean laterales)
- Energía Solar (`ene_paneles_solares`)
- Generadores Eléctricos (`ene_generadores_eléctricos`)
- Energía Eólica (`ene_energía_eólica`)

#### **Climatización** (3 campos - todos boolean laterales)
- Estufas a Leña o Pellet (`cal_estufas_pellet`)
- Calefacción Solar (`cal_calefacción_solar`)
- Aislamiento Térmico (`cal_aislamiento_térmico`)

#### **Pisos** (4 campos - todos boolean laterales)
- Pisos Deck (`pis_pisos_deck`)
- Pisos de Madera (`pis_pisos_madera`)
- Pisos Vinílicos (`pis_pisos_vinilicos`)
- Alfombras (`pis_alfombras`)

#### **Revestimientos** (4 campos - todos boolean laterales)
- Interior Madera (`rev_madera`)
- Exterior Madera (`rev_madera`)
- Exterior Metal (`rev_metal`)
- Exterior Fibra Mineral (`rev_fibra_mineral`)

#### **Ventanas** (4 campos - todos boolean laterales)
- Termopanel (`ven_termopanel`)
- Marco de PVC (`ven_marco_pvc`)
- Marco de Aluminio (`ven_marco_aluminio`)
- Marco de Madera (`ven_marco_madera`)

#### **Cortasoles** (3 campos - todos boolean laterales)
- Madera (`cor_madera`)
- Accionables (`cor_accionables`)
- Folding/Sliding Shutter (`cor_folding_shutter`)

#### **Fachadas** (2 campos - todos boolean laterales)
- Paneles Aislantes (`fac_paneles_aislantes`)
- Fachadas de Madera (`fac_fachadas_madera`)

#### **Seguridad & Comunicación** (5 campos - todos boolean laterales)
- Instalación Antenas y Repetidores (`seg_instalación_repetidores`)
- Internet Satelital (`seg_internet_satelital`)
- Cámaras y Vigilancia Remota (`seg_camaras_remota`)
- Domótica (`seg_domótica`)
- Sistemas de Seguridad (`seg_sistemas_seguridad`)

#### **Control Solar** (3 campos - todos boolean laterales)
- Cortinas y Persianas (`con_cortinas_persianas`)
- Toldos (`con_toldos`)
- Pérgolas y quinchos (`con_pérgolas_quinchos`)

#### **Muebles** (2 campos - todos boolean laterales)
- Muebles Modulares (`mue_modulares`)
- Muebles Personalizados (`mue_personalizados`)

#### **Techo** (1 campo - boolean lateral)
- Impermeabilización (`techo_impermeabilizacion`)

#### **Decoración** (2 campos - todos boolean laterales)
- Interiorismo (`deco_interiorismo`)
- Paisajismo (`deco_paisajismo`)

#### **Arquitectura** (1 campo - boolean lateral)
- Arquitectura y Diseño (`arquitectura`)

#### **Generales** (11 campos - tipos mixtos)
| # | Feature | Columna BD | Tipo | Filtro | Tarjeta Std | Premium | Destacada | Landing |
|---|---------|------------|------|--------|-------------|---------|-----------|---------|
| 1 | Experiencia (años) | `experiencia` | number | ❌ | ❌ | Opcional | ✅ | ✅ |
| 2 | Nombre de la Empresa | `nombre_empresa` | text | ❌ | ✅ | ✅ | ✅ | ✅ |
| 3 | Descripción breve | `descripcion` | text | ❌ | ✅ | ✅ | ✅ | ✅ |
| 4 | Ubicación Dirección | `ubi_direccion` | text | ❌ | ❌ | ❌ | ❌ | ✅ |
| 5 | Ubicación Región | `ubi_region` | ISO region | ❌ | ✅ | ✅ | ✅ | ✅ |
| 6 | Instagram | `instagram` | text | ❌ | ❌ | ❌ | ❌ | ✅ |
| 7 | Instagram2 | `instagram2` | text | ❌ | ❌ | ❌ | ❌ | ❌ |
| 8 | Teléfono | `telefono` | text | ❌ | ❌ | ✅ (login) | ✅ | ✅ |
| 9 | Correo Electrónico | `email` | text | ❌ | ✅ (login) | ❌ | ✅ (login) | ✅ |
| 10 | Cobertura geográfica | `cobertura` | ISO regions[] | ❌ | ❌ | ✅ (login) | ✅ (login) | ✅ |
| 11 | Publica precios | `publica_precios` | boolean | ❌ | ✅ | ❌ | ❌ | ❌ |

**Total Habilitación & Servicios: ~48 campos**

---

## REGLAS DE VISUALIZACIÓN POR TIER

### Tarjeta **STANDARD**
- Campos mínimos esenciales
- Sin acceso a información de contacto (requiere login)
- Sin servicios detallados
- Solo especialidades principales

### Tarjeta **DESTACADA**
- Más información que Standard
- Algunos datos requieren login (teléfono, email, cobertura)
- Muestra servicios principales
- 4 tarjetas por columna

### Tarjeta **PREMIUM**
- **MÁS ESPACIO**: 2 tarjetas por columna o 1 tarjeta completa
- Toda la información visible
- Algunos datos premium requieren login
- **LANDING DEDICADA**: Página completa del proveedor
- Editor tiene control para aprobar contenido basado en calidad

### Landing (Página Dedicada)
- Solo para proveedores PREMIUM
- Muestra TODA la información
- Galería completa de imágenes
- Testimonios
- Formulario de contacto
- Información detallada de servicios
- Redes sociales

---

## FILTROS

### Tipos de Filtro
1. **Checklist** (varios/todos): Para features booleanas múltiples
2. **Slider**: Para rangos numéricos (precio, m²)
3. **Checkbox**: Para booleanos simples
4. **No filtro**: Solo datos informativos

### Ubicación de Filtros
- **Lateral**: Aparecen en la sidebar de filtros
- **No**: Solo informativos, no filtrables

---

## ESTRUCTURA DE DATOS TÉCNICA

### Approach 1: Columnas Dedicadas (Actual en schema)
```sql
-- En tabla providers
dise_std BOOLEAN,
dise_pers BOOLEAN,
tiny_houses BOOLEAN,
-- ... (todos los campos específicos)
```

**PROS**:
- Queries rápidas y simples
- Fácil de indexar
- Tipado fuerte

**CONTRAS**:
- Tabla muy ancha
- Poco flexible para agregar nuevas features
- Schema diferente por categoría

### Approach 2: JSONB Flexible (Recomendado)
```sql
-- En tabla providers
features JSONB DEFAULT '{
  "servicios_disponibles": {
    "dise_std": true,
    "dise_pers": false,
    ...
  },
  "especialidad": {
    "tiny_houses": true,
    ...
  },
  "generales": {
    "experiencia": 15,
    "llave_en_mano": true,
    ...
  }
}'
```

**PROS**:
- Súper flexible
- Fácil agregar nuevas features sin migración
- Schema unificado para todas las categorías
- Indexable con GIN index

**CONTRAS**:
- Queries más complejas
- Menos type-safety
- Requiere validación en app layer

### Approach 3: Tabla de Features Normalizada
```sql
CREATE TABLE provider_features (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES providers(id),
  feature_key TEXT NOT NULL,
  feature_value JSONB,
  display_order INTEGER,
  category TEXT, -- 'servicios', 'especialidad', 'generales'
  ...
)
```

**PROS**:
- Muy flexible
- Fácil de mantener
- Fácil de extender

**CONTRAS**:
- Más complejo de consultar
- Requiere JOINs
- Performance puede ser problema

---

## RECOMENDACIÓN FINAL

**ENFOQUE HÍBRIDO**:
1. **Campos core como columnas**: nombre, descripción, región, precio, tier, status
2. **Features dinámicas en JSONB**: Todas las features específicas por categoría
3. **GIN Index en JSONB** para búsquedas rápidas
4. **Tabla de definición de features** separada para metadata (labels, tipos, grupos, display rules)

```sql
-- Tabla de configuración de features
CREATE TABLE feature_definitions (
  id UUID PRIMARY KEY,
  category category_type NOT NULL, -- fabrica, casas, habilitacion_servicios
  group_name TEXT NOT NULL, -- 'servicios_disponibles', 'especialidad', etc.
  feature_key TEXT NOT NULL, -- 'dise_std', 'tiny_houses', etc.
  label TEXT NOT NULL, -- 'Diseño estándar', 'Tiny Houses', etc.
  data_type TEXT NOT NULL, -- 'boolean', 'number', 'text', 'text[]'
  filter_type TEXT, -- 'checklist', 'slider', 'checkbox', null
  filter_location TEXT, -- 'lateral', null
  show_in_card_standard BOOLEAN DEFAULT false,
  show_in_card_premium BOOLEAN DEFAULT false,
  show_in_card_featured BOOLEAN DEFAULT false,
  show_in_landing BOOLEAN DEFAULT false,
  requires_login BOOLEAN DEFAULT false,
  display_order INTEGER,
  UNIQUE(category, feature_key)
);
```

Esta estructura permite:
- ✅ Flexibilidad total para agregar features
- ✅ Control granular de visualización por tier
- ✅ Fácil mantención del admin
- ✅ Queries eficientes con índices apropiados
- ✅ Sistema de filtros dinámico basado en metadata
