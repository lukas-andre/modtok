MODTOK: Unified Product Vision & Technical Specification
Part I: Strategic and Technical Foundation
This initial section establishes the high-level vision and critical architectural decisions that will underpin the entire project. It defines the product positioning and target market and codifies the foundational technologies—Supabase and Astro.js—to ensure the MODTOK platform's success, scalability, and performance.

A. Executive Summary and Product Vision
Core Mandate
MODTOK is envisioned as a curated digital ecosystem designed to facilitate and enrich the process of building a modular second home in Chile. The vision transcends that of a simple provider aggregator; it seeks to position itself as a platform for inspiration and connection, linking future homeowners with manufacturers, products, and complementary services. The mission is to centralize and simplify a fragmented market, improving the visibility of available options and empowering users with effective decision-making tools.

Strategic Positioning
MODTOK's positioning is based on a strategic balance between robust functionality and superior aesthetic design. Unlike traditional classifieds portals, MODTOK will adopt a clean, intuitive, and visually appealing "look & feel," where high-quality content—especially images of projects and products—takes center stage. This approach aims not only to be a useful tool but also a source of inspiration, similar to niche platforms like ArchDaily or Houzz, but focused specifically on the Chilean modular market.

Editorial content will play a crucial role. Publishing blogs, featured projects, and interviews with relevant industry figures will socially validate MODTOK within the niche, transforming it from a simple directory into an industry benchmark.

B. Target Market & User Personas
The platform will serve three primary user personas, each with distinct needs and objectives:

The Informed Homebuyer: This profile represents an individual or family with a clear intention to build or acquire a modular home. They are research-oriented users, technically curious, and value detailed specifications over generic marketing language. This persona is the main consumer of the platform's advanced filtering capabilities, and their satisfaction is the primary driver of engagement and retention. Their decision-making process is based on concrete data such as material types, construction technologies, and included services.

The Manufacturer/Provider: This user is a business entity, ranging from a specialized workshop to a large factory. Their main objective in using Modtok is to generate qualified leads. They are the platform's primary customers and the direct target of the monetization model. Their willingness to pay for platform services will be directly correlated with the quality and volume of generated prospects.

The Service Contractor: This profile corresponds to a specialized company offering essential services to make a modular house functional and habitable (e.g., solar panel installers, well drillers, autonomous sewage system specialists). They represent a secondary but vital part of the ecosystem, whose presence on the platform significantly increases the value for the Informed Homebuyer by offering a more complete, end-to-end solution.

C. Commercial Model
The revenue model is based on a tiered freemium structure designed to offer clear incremental value to providers. This model allows for an exhaustive database (free tier) while monetizing visibility and advanced marketing tools (paid tiers).

Standard (Free): A basic, text-only listing that guarantees a presence on the platform. This tier is crucial for building a comprehensive database through scraping and on-demand registrations, ensuring MODTOK is the most complete aggregator in the market.

Featured (Paid): Offers a listing with an image and basic contact details. This intermediate level provides greater visual visibility in the listings, capturing the user's attention more effectively than the standard listing.

Premium (Paid): The highest tier, which includes a large-format card, a dedicated and SEO-optimized landing page, and access to marketing features like performance reports. This level is designed for providers who want to maximize their exposure and capture high-quality leads.

D. Recommended Technical Architecture
The following recommendations define the MODTOK technology stack. The selection prioritizes performance, search engine optimization (SEO), development speed, and long-term scalability.

1. Backend and Database: Supabase with PostgreSQL
Supabase is confirmed as the Backend-as-a-Service (BaaS) platform. This decision significantly accelerates development by providing a suite of essential pre-configured tools, all built on the robust and scalable PostgreSQL relational database. The Supabase ecosystem aligns perfectly with MODTOK's current and future needs:

Database (PostgreSQL): Ideal for handling the project's structured and relational data (manufacturers, houses, services, features). Its ACID compliance guarantees data integrity.

Authentication: Supabase Auth will natively manage user registration, login, and session management, providing a secure, out-of-the-box solution.

Storage: Supabase's S3-compatible object storage will be used for all media assets, especially the high-quality images that are a pillar of the user experience.

Edge Functions: These serverless functions will be used for backend logic such as processing scraped data, sending transactional emails, or generating weekly performance reports for Premium providers.

2. Frontend Framework (SEO Focus): Astro.js
For the frontend, Astro.js is firmly recommended. While other frameworks are popular, MODTOK's nature as a content-driven platform makes Astro's performance advantages decisive for achieving the main goal: ranking exceptionally well on Google.

Superior Performance and SEO: The success of MODTOK depends on its ability to rank for organic searches like "modular homes Chile." Astro's "zero-JS-by-default" architecture is designed to create ultra-fast static content sites. This directly translates into better Core Web Vitals scores, a critical Google ranking factor. Astro is, by design, the most search-engine-crawler-friendly option.

"Islands" Architecture for Interactivity: MODTOK requires application-like features such as user login and watchlist management. "Astro Islands" allow for "hydrating" specific components with JavaScript only where necessary (using any UI framework like React or Vue). This offers the best of both worlds: maximum performance for static content seen by search engines and anonymous visitors, and targeted, efficient interactivity for registered users.

Alignment with Design Vision: The product vision calls for a clean design where the focus is on images. Astro's minimalist approach ensures the framework doesn't add unnecessary weight, resulting in faster load times and a smoother user experience.

3. Content Management System (CMS) Strategy
For the initial phase and the Minimum Viable Product (MVP), no separate headless CMS will be implemented. Instead, the Supabase dashboard will be used as the administrative interface for all data management (providers, houses, blogs, etc.). This strategy reduces initial complexity and cost, provides a single source of truth for data, and allows the team to focus on core MVP features. When the platform scales to a point where a non-technical content team is needed, a headless CMS like Payload can be integrated.

Part II: Functional Specifications: Epics & User Stories
This section translates the product vision into an actionable development backlog, structured under an agile framework.

User Roles & Permissions

Role	Description	Key Permissions
Unregistered Visitor	Any user accessing the site without logging in.	View all public content, use all search filters, access Premium provider landings. Cannot save to watchlist.
Registered Customer	A user who has created an account.	All Visitor permissions, plus create/manage a personal "watchlist," and manage their profile.
Provider (Standard, Featured, Premium)	A business listed on the platform.	Their visibility and accessible data fields are determined by their commercial tier. Only admin can manage their profiles initially.
Platform Administrator	A member of the MODTOK team.	Full CRUD access to all platform data (providers, listings, content, users).

Exportar a Hojas de cálculo
Epic 1: Core Platform & Content Discovery
Goal: To allow any visitor to discover, filter, and view providers and products, demonstrating the platform's value and encouraging registration.

User Story 1.1: As a visitor, I want to see the homepage to get an overview of the platform's offerings.

AC: The homepage displays sections for Premium, Featured, HotSpots, and Blog/News content.

User Story 1.2: As a visitor, I want to use the main category filter (Houses, Manufacturers, Services, etc.) to narrow down content.

AC: Selecting a category reloads all page sections to show only content from that category.

User Story 1.3: As a visitor, I want to use detailed side filters to find providers or products that match specific criteria.

AC: Side filters are contextual and change dynamically based on the main category selected (e.g., checklists for multiple selections, sliders for price ranges).

User Story 1.4: As a visitor, I want to see listings in three distinct formats (Premium, Featured, Standard) to understand the different levels of information.

User Story 1.5: As a visitor, I want to view the dedicated landing page of a Premium Provider to get detailed information.

AC: The landing page URL is clean and SEO-friendly (e.g., /manufacturers/company-name-slug).

User Story 1.6: As an unregistered visitor, I want to be prompted to register when I try to use interaction features (e.g., "add to my list").

AC: Clicking the "add to my list" button shows a modal inviting the user to log in or create an account.

Epic 2: Customer Account & Engagement
Goal: To provide registered customers with tools to save, manage, and track their research, thereby capturing their purchase intent.

User Story 2.1: As a potential customer, I want to register for a new account using my email.

User Story 2.2: As a registered customer, I want to be able to securely log in and out of my account.

User Story 2.3: As a registered customer, I want to add any provider or product to my personal "watchlist" to save it for later.

User Story 2.4: As a registered customer, I want to view my account dashboard, which displays my watchlist, grouped by category.

User Story 2.5: As a registered customer, I want to be able to remove items from my watchlist at any time.

Epic 3: Provider Tiers & Presentation
Goal: To ensure the platform correctly displays provider information according to their commercial tier, delivering the promised value for paid plans.

User Story 3.1: As a Premium Provider, I want my profile and products displayed in the Premium section with maximum visual appeal and data visibility.

User Story 3.2: As a Premium Provider, I want to have a dedicated, SEO-optimized landing page.

User Story 3.3: As a Premium Provider, I want to receive a basic weekly performance report via email.

AC (MVP): The email shows the number of times the provider was added to and removed from user watchlists.

User Story 3.4: As a Featured Provider, I want my profile to be displayed in the Featured section with my logo/image and key contact details.

User Story 3.5: As a Standard Provider, I want my business to appear in the listings with basic text information to ensure I am visible on the platform.

Epic 4: Content Engine & SEO
Goal: To build a robust content platform that drives organic traffic and establishes MODTOK as an authority in the niche.

User Story 4.1: As a visitor, I want to browse and read articles in the "Blogs / Projects / News" section.

AC: Each article has a unique, SEO-friendly URL (slug).

User Story 4.2: As a visitor, I want to explore "HotSpots," which are dedicated landing pages for specific geographic locations.

AC: Each HotSpot page (e.g., /hotspots/pucon) aggregates and highlights providers and projects relevant to that area.

User Story 4.3: As an SEO manager, I want the platform to automatically generate a sitemap.xml file for efficient search engine crawling.

User Story 4.4: As an SEO manager, I want to be able to define metadata (title, description) and structured data (JSON-LD) for all content types to improve search visibility and enable rich snippets.

Epic 5: Platform Administration
Goal: To provide the MODTOK team with the necessary tools to manage the platform's content, users, and providers.

User Story 5.1: As an administrator, I want to log in to a secure administration panel (the Supabase dashboard).

User Story 5.2: As an administrator, I want to perform CRUD (Create, Read, Update, Delete) operations on all providers, products, and services.

User Story 5.3: As an administrator, I want to be able to assign a commercial tier (Premium, Featured, Standard) to each provider.

User Story 5.4: As an administrator, I want to create, edit, and publish content for the Blog and HotSpots sections.

User Story 5.5: As an administrator, I want to manage the lists of filterable features (e.g., add a new "Material Technology" or "Window Type").

Part III: Data Architecture and Model
This section provides the detailed blueprint for the PostgreSQL database, translating business requirements into a normalized, efficient, and scalable schema. The proposed model abstracts the concept of a "Feature," allowing filters to be entirely data-driven. An administrator can add a new filterable option by simply inserting a row into a table, and the frontend will update automatically without a code deployment.

Main Tables (PostgreSQL Schema)

users (Managed by Supabase Auth)

id (uuid, PK), email (varchar), created_at (timestamp), marketing_consent (boolean)

providers

id (uuid, PK), name (varchar), tier (enum: 'standard', 'featured', 'premium'), experience_years (integer), contact_email (varchar), phone (varchar)

listings

id (uuid, PK), provider_id (uuid, FK -> providers.id), listing_category (enum: 'house', 'manufacturer', 'service', 'decoration'), name (varchar), slug (varchar, unique), description (text), price_min_clp (numeric), is_active (boolean)

locations

id (serial, PK), region (varchar), comuna (varchar)

provider_coverage (Join Table)

provider_id (uuid, FK), location_id (integer, FK)

Feature & Filter System Tables

feature_groups

id (serial, PK), name (varchar, unique) - e.g., "Available Services", "Material Technology"

features

id (serial, PK), group_id (integer, FK), name (varchar) - e.g., "Turnkey", "SIP Panels" filter_type (enum: 'checklist', 'slider', 'check')

listing_features (Join Table)

listing_id (uuid, FK), feature_id (integer, FK)

Interaction & Content Tables

watchlist_items (Join Table)

user_id (uuid, FK), listing_id (uuid, FK)

content_articles

id (uuid, PK), content_type (enum: 'blog', 'hotspot'), title (varchar), slug (varchar, unique), body (text), published_at (timestamp)

media

id (uuid, PK), listing_id (uuid, FK), article_id (uuid, FK), storage_url (varchar), alt_text (varchar), is_primary (boolean)

Part IV: Implementation and Launch Strategy
This final section outlines a phased development plan and a strategy for acquiring and managing the initial data, crucial elements for a successful launch.

A. Phased Development Roadmap (MVP)
Phase 1: Foundation & Core Discovery (MVP Launch)

Scope: Implement Epics 1 (Core Platform) and 5 (Administration).

Data: Manually populate the database with an initial set of 30-50 providers, ensuring high-quality representation in the Featured and Premium tiers to demonstrate platform value.

Content: Create initial content for the Blog section and 2-3 HotSpot pages to start generating SEO traction from day one.

Launch: Launch the platform to the public. Customer registration (Epic 2) may be disabled to focus on validating the core value proposition of content discovery.

Phase 2: User Engagement & Lead Generation

Scope: Implement Epic 2 (Customer Account).

Functionality: Enable user registration, login, and full "watchlist" functionality.

Provider Value: Implement the basic performance report for Premium providers (Story 3.3) to begin demonstrating ROI.

Phase 3: Scalability & Automation (Post-MVP)

Scope: Develop self-service tools for providers to register and manage their own profiles (a future epic).

Technology: Evaluate and integrate a headless CMS (like Payload) if content workflows become complex enough to justify it.

Analytics: Expand analytics tools for providers, offering more detailed metrics on views, clicks, and interactions.

B. Data Acquisition and Management Plan
Initial Population:

Web Scraping: Use scraping techniques to build the initial database of Standard tier providers, aiming to be the most comprehensive aggregator.

Manual Curation: The MODTOK team will directly contact key providers to onboard them into the Featured and Premium tiers, ensuring maximum quality for the most visible profiles.

Data Standardization: All data, whether scraped or manually provided, must be mapped and standardized according to the normalized database schema. This is critical for the filters to function correctly.

Continuous Update: Establish a process for periodic data updates, including re-running scrapers quarterly and providing an on-demand registration form for new providers.

Conclusion
This document presents a comprehensive plan for the development and launch of MODTOK. The strategic and technical decisions described are designed to build a robust, scalable, and highly effective platform with the primary goal of dominating organic positioning in the modular homes niche in Chile. The recommended architecture, with Supabase as the backend and Astro.js on the frontend, offers an optimal combination of development speed, exceptional performance, and a solid foundation for future growth.