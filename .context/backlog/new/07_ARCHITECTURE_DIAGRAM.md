# Diagramas de Arquitectura - MODTOK v2.0

## Diagrama de Base de Datos (ERD)

```mermaid
erDiagram
    profiles ||--o{ providers : "profile_id"
    providers ||--o{ provider_categories : "provider_id"
    providers ||--o{ houses : "provider_id"
    providers ||--o{ service_products : "provider_id"
    providers ||--o{ inquiries : "provider_id"
    profiles ||--o{ user_favorites : "user_id"
    profiles ||--o{ inquiries : "user_id"
    profiles ||--o{ blog_posts : "author_id"
    blog_posts ||--o{ blog_comments : "post_id"
    profiles ||--o{ blog_comments : "user_id"
    house_topologies ||--o{ houses : "topology_id"

    profiles {
        uuid id PK
        text email UK
        text full_name
        text phone
        text avatar_url
        enum role
        enum status
        text company_name
        jsonb social_links
        timestamptz created_at
    }

    providers {
        uuid id PK
        uuid profile_id FK
        enum primary_category
        text company_name
        text slug UK
        text logo_url
        text cover_image_url
        text description
        text description_long
        enum tier
        enum status
        text email
        text phone
        text region
        jsonb features
        text[] gallery_images
        timestamptz premium_until
        boolean has_quality_images
        boolean has_complete_info
        boolean editor_approved_for_premium
        integer views_count
        integer inquiries_count
    }

    provider_categories {
        uuid id PK
        uuid provider_id FK
        enum category
        boolean is_primary
    }

    houses {
        uuid id PK
        uuid provider_id FK
        text name
        text slug UK
        text model_code
        text description
        enum tier
        enum status
        text topology_code
        numeric area_m2
        numeric price
        jsonb features
        text main_image_url
        text[] gallery_images
        integer views_count
        integer saves_count
    }

    service_products {
        uuid id PK
        uuid provider_id FK
        text name
        text slug UK
        text service_family
        text service_type
        numeric price_from
        numeric price_to
        jsonb features
        text[] coverage_areas
        boolean is_available
    }

    house_topologies {
        uuid id PK
        text code UK
        integer bedrooms
        numeric bathrooms
        integer display_order
    }

    feature_definitions {
        uuid id PK
        enum category
        text group_name
        text feature_key UK
        text label
        enum data_type
        boolean is_filterable
        enum filter_type
        text filter_location
        boolean show_in_card_standard
        boolean show_in_card_destacado
        boolean show_in_card_premium
        boolean show_in_landing
        boolean requires_login
        integer display_order
    }

    user_favorites {
        uuid id PK
        uuid user_id FK
        text item_type
        uuid item_id
        text notes
        boolean is_archived
    }

    inquiries {
        uuid id PK
        uuid user_id FK
        uuid provider_id FK
        text item_type
        uuid item_id
        text name
        text email
        text phone
        text message
        text status
    }

    blog_posts {
        uuid id PK
        uuid author_id FK
        text title
        text slug UK
        text content
        text category
        enum status
        timestamptz published_at
    }

    blog_comments {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        uuid parent_id FK
        text content
        boolean is_approved
    }
```

---

## Flujo de Datos: Búsqueda y Filtrado

```mermaid
sequenceDiagram
    participant User as Usuario
    participant Frontend as Frontend
    participant API as API
    participant DB as PostgreSQL
    participant FD as feature_definitions

    User->>Frontend: Selecciona categoría "Fábrica"
    Frontend->>API: GET /api/features?category=fabrica
    API->>FD: SELECT * WHERE category='fabrica' AND is_filterable=true
    FD-->>API: Return filterable features
    API-->>Frontend: Feature definitions
    Frontend->>User: Render filtros dinámicos

    User->>Frontend: Aplica filtros (SIP=true, Tiny=true, Precio 800k-1.5M)
    Frontend->>API: GET /api/providers?filters={...}
    API->>DB: SELECT * FROM providers WHERE<br/>features->'especialidad'->>'tiny_houses'='true'<br/>AND features->'especialidad'->>'modulares_sip'='true'<br/>AND (features->'generales'->>'precio_ref_min_m2')::numeric >= 800000
    DB-->>API: Matching providers
    API-->>Frontend: Providers + features
    Frontend->>User: Render cards por tier
```

---

## Flujo de Renderizado por Tier

```mermaid
flowchart TD
    Start([Provider Data]) --> CheckTier{¿Cuál es el tier?}

    CheckTier -->|Premium| LoadPremiumFeatures[Cargar features para Premium]
    CheckTier -->|Destacado| LoadDestacadoFeatures[Cargar features para Destacado]
    CheckTier -->|Standard| LoadStandardFeatures[Cargar features para Standard]

    LoadPremiumFeatures --> FilterFeaturesPremium[Filtrar: show_in_card_premium = true]
    LoadDestacadoFeatures --> FilterFeaturesDestacado[Filtrar: show_in_card_destacado = true]
    LoadStandardFeatures --> FilterFeaturesStandard[Filtrar: show_in_card_standard = true]

    FilterFeaturesPremium --> CheckAuth{¿Usuario autenticado?}
    FilterFeaturesDestacado --> CheckAuth
    FilterFeaturesStandard --> CheckAuth

    CheckAuth -->|Sí| ShowAll[Mostrar todos los campos filtrados]
    CheckAuth -->|No| FilterLogin[Ocultar campos con requires_login=true]

    FilterLogin --> ShowFiltered[Mostrar campos sin login]
    ShowAll --> RenderCard[Renderizar Card]
    ShowFiltered --> RenderCard

    RenderCard --> IsPremium{¿Es Premium?}
    IsPremium -->|Sí| ShowLandingLink[Mostrar link a landing]
    IsPremium -->|No| ShowContactBtn[Mostrar botón contacto]

    ShowLandingLink --> End([Card Renderizada])
    ShowContactBtn --> End
```

---

## Flujo de Control Editorial (Premium)

```mermaid
flowchart TD
    Start([Provider solicita Premium]) --> CheckImages{¿Imágenes de calidad?}

    CheckImages -->|No| RejectImages[has_quality_images = false]
    CheckImages -->|Sí| ApproveImages[has_quality_images = true]

    RejectImages --> NotifyProvider[Notificar al proveedor:<br/>Mejorar calidad de imágenes]
    ApproveImages --> CheckInfo{¿Información completa?}

    CheckInfo -->|No| RejectInfo[has_complete_info = false]
    CheckInfo -->|Sí| ApproveInfo[has_complete_info = true]

    RejectInfo --> NotifyProvider
    ApproveInfo --> EditorReview[Editor revisa contenido]

    EditorReview --> EditorDecision{¿Contenido aprobado?}

    EditorDecision -->|No| RejectPremium[editor_approved_for_premium = false]
    EditorDecision -->|Sí| ApprovePremium[editor_approved_for_premium = true]

    RejectPremium --> ProviderStaysInTier[Proveedor permanece en tier actual]
    ApprovePremium --> SetPremium[tier = 'premium']

    SetPremium --> CreateLanding[Generar landing page]
    CreateLanding --> PublishPremium[Publicar como Premium]

    NotifyProvider --> End([Fin])
    ProviderStaysInTier --> End
    PublishPremium --> End
```

---

## Arquitectura de Componentes (Frontend)

```mermaid
flowchart TB
    subgraph Pages
        ListPage[/providers/index.astro]
        DetailPage[/provider/[slug].astro]
        AdminPage[/admin/providers/[id].astro]
    end

    subgraph Components
        ProviderCard[ProviderCard.astro]
        FeatureDisplay[FeatureDisplay.tsx]
        FilterSidebar[FilterSidebar.tsx]
        FeatureFormBuilder[FeatureFormBuilder.tsx]
    end

    subgraph Lib
        FeatureHelpers[features.ts]
        SupabaseClient[supabase.ts]
        Types[database.types.ts]
    end

    subgraph Database
        Providers[(providers)]
        Features[(feature_definitions)]
        Houses[(houses)]
    end

    ListPage --> FilterSidebar
    ListPage --> ProviderCard
    DetailPage --> FeatureDisplay
    AdminPage --> FeatureFormBuilder

    ProviderCard --> FeatureHelpers
    FeatureDisplay --> FeatureHelpers
    FilterSidebar --> FeatureHelpers
    FeatureFormBuilder --> FeatureHelpers

    FeatureHelpers --> SupabaseClient
    SupabaseClient --> Types

    SupabaseClient --> Providers
    SupabaseClient --> Features
    SupabaseClient --> Houses
```

---

## Flujo de Migración

```mermaid
flowchart LR
    subgraph Old Schema
        OldProviders[(providers<br/>50+ columns)]
        OldDecorations[(decorations)]
        OldEnum[enum: 4 categories]
    end

    subgraph Migration
        Backup[Backup DB]
        UpdateEnum[Update enum<br/>3 categories]
        MigrateFeatures[Migrate to JSONB]
        AddFields[Add editorial fields]
        ConvertDeco[Convert/Delete<br/>decorations]
    end

    subgraph New Schema
        NewProviders[(providers<br/>features JSONB)]
        FeatureDefs[(feature_definitions)]
        ServiceProducts[(service_products)]
        NewEnum[enum: 3 categories]
    end

    OldProviders --> Backup
    OldDecorations --> Backup
    OldEnum --> Backup

    Backup --> UpdateEnum
    UpdateEnum --> MigrateFeatures
    MigrateFeatures --> AddFields
    AddFields --> ConvertDeco

    ConvertDeco --> NewProviders
    ConvertDeco --> ServiceProducts
    UpdateEnum --> NewEnum
    MigrateFeatures --> FeatureDefs
```

---

## Stack Tecnológico

```mermaid
flowchart TB
    subgraph Frontend
        Astro[Astro.js]
        React[React Components]
        Tailwind[Tailwind CSS]
    end

    subgraph Backend
        Supabase[Supabase]
        PostgreSQL[(PostgreSQL 15)]
        Auth[Supabase Auth]
        Storage[Supabase Storage]
    end

    subgraph Tools
        TypeScript[TypeScript]
        pnpm[pnpm]
        Vitest[Vitest]
    end

    subgraph Deploy
        Railway[Railway]
        Vercel[Vercel/Cloudflare]
    end

    Astro --> React
    Astro --> Tailwind
    Astro --> TypeScript

    React --> Supabase
    Supabase --> PostgreSQL
    Supabase --> Auth
    Supabase --> Storage

    TypeScript --> pnpm
    pnpm --> Vitest

    Astro --> Railway
    Astro --> Vercel
```

---

## Indexación y Performance

```mermaid
flowchart TD
    Query[User Query] --> Router{Tipo de Consulta}

    Router -->|Por ID| PK[PRIMARY KEY Index<br/>O(1)]
    Router -->|Por Slug| UK[UNIQUE Index<br/>O(log n)]
    Router -->|Por Categoría| Cat[B-tree Index<br/>category]
    Router -->|Por Tier| Tier[B-tree Index<br/>tier]
    Router -->|Por Features| GIN[GIN Index<br/>features JSONB]

    GIN --> JSONBOps[JSONB Operators:<br/>->, ->>, @>, ?]
    JSONBOps --> FastSearch[Búsqueda Rápida<br/>en JSONB]

    PK --> Result[Resultado]
    UK --> Result
    Cat --> Result
    Tier --> Result
    FastSearch --> Result

    Result --> Cache{¿En Cache?}
    Cache -->|Sí| ReturnCache[Return from Cache]
    Cache -->|No| Execute[Execute & Cache]

    ReturnCache --> End([Response])
    Execute --> End
```

---

## Sistema de Features (Metadata Pattern)

```mermaid
classDiagram
    class FeatureDefinition {
        +UUID id
        +CategoryType category
        +String group_name
        +String feature_key
        +String label
        +DataType data_type
        +Boolean is_filterable
        +FilterType filter_type
        +Boolean show_in_card_standard
        +Boolean show_in_card_destacado
        +Boolean show_in_card_premium
        +Boolean show_in_landing
        +Boolean requires_login
    }

    class Provider {
        +UUID id
        +String company_name
        +CategoryType primary_category
        +Tier tier
        +JSONB features
        +getFeatureValue(group, key)
    }

    class House {
        +UUID id
        +UUID provider_id
        +String name
        +JSONB features
        +getFeatureValue(group, key)
    }

    class FeatureHelper {
        +shouldShowFeature(definition, tier, isAuth)
        +getFeatureValue(entity, group, key)
        +getFilterableFeatures(category)
    }

    FeatureDefinition --> Provider : defines structure
    FeatureDefinition --> House : defines structure
    FeatureHelper --> FeatureDefinition : uses
    FeatureHelper --> Provider : operates on
    FeatureHelper --> House : operates on
```

---

## Conclusión

Estos diagramas ilustran:

1. **ERD**: Estructura completa de la base de datos
2. **Flujos**: Búsqueda, renderizado, control editorial
3. **Componentes**: Arquitectura del frontend
4. **Migración**: Proceso de transición
5. **Stack**: Tecnologías utilizadas
6. **Performance**: Estrategia de indexación
7. **Metadata Pattern**: Sistema de features dinámicas

Para más detalles, consultar:
- [README.md](./README.md) - Guía principal
- [02_NEW_SCHEMA.sql](./02_NEW_SCHEMA.sql) - Schema completo
- [04_TIER_SYSTEM.md](./04_TIER_SYSTEM.md) - Sistema de tiers
