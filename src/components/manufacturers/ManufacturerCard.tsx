interface Manufacturer {
  provider_id: string;
  company_name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  hq_region_code: string | null;
  regions: string[];

  // Flags
  llave_en_mano: boolean;
  publica_precios: boolean;
  has_verified: boolean;
  verified_by_admin: boolean;

  // Metrics
  house_count: number;
  house_premium_count: number;
  price_m2_min: number | null;
  price_m2_max: number | null;
  experiencia_years: number | null;

  // Services (top 3)
  dise_pers: boolean;
  instalacion: boolean;
  financiamiento: boolean;

  // Specialties (top 3)
  tiny_houses: boolean;
  modulares_sip: boolean;
  modulares_madera: boolean;
}

interface ManufacturerCardProps {
  manufacturer: Manufacturer;
}

const REGION_NAMES: Record<string, string> = {
  'XV': 'Arica',
  'I': 'Tarapacá',
  'II': 'Antofagasta',
  'III': 'Atacama',
  'IV': 'Coquimbo',
  'V': 'Valparaíso',
  'RM': 'Metropolitana',
  'VI': "O'Higgins",
  'VII': 'Maule',
  'XVI': 'Ñuble',
  'VIII': 'Biobío',
  'IX': 'Araucanía',
  'XIV': 'Los Ríos',
  'X': 'Los Lagos',
  'XI': 'Aisén',
  'XII': 'Magallanes'
};

export default function ManufacturerCard({ manufacturer }: ManufacturerCardProps) {
  const {
    company_name,
    slug,
    logo_url,
    cover_image_url,
    regions,
    house_count,
    house_premium_count,
    price_m2_min,
    price_m2_max,
    llave_en_mano,
    has_verified,
    verified_by_admin,
    experiencia_years,
    dise_pers,
    instalacion,
    financiamiento,
    tiny_houses,
    modulares_sip,
    modulares_madera
  } = manufacturer;

  // Build services list
  const services = [];
  if (dise_pers) services.push('Diseño Personalizado');
  if (instalacion) services.push('Instalación');
  if (financiamiento) services.push('Financiamiento');

  // Build specialties list
  const specialties = [];
  if (tiny_houses) specialties.push('Tiny Houses');
  if (modulares_sip) specialties.push('SIP');
  if (modulares_madera) specialties.push('Madera');

  // Format price range
  const priceRange = price_m2_min && price_m2_max
    ? `$${(price_m2_min / 1000).toFixed(0)}k - $${(price_m2_max / 1000).toFixed(0)}k/m²`
    : price_m2_min
    ? `Desde $${(price_m2_min / 1000).toFixed(0)}k/m²`
    : null;

  return (
    <a
      href={`/fabricantes/${slug}`}
      className="group block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {cover_image_url ? (
          <img
            src={cover_image_url}
            alt={`${company_name} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}

        {/* Logo Overlay */}
        {logo_url && (
          <div className="absolute top-3 left-3 w-16 h-16 bg-white rounded-lg shadow-md p-2 border border-gray-100">
            <img
              src={logo_url}
              alt={`${company_name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Verification Badge */}
        {verified_by_admin && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-md flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verificado
          </div>
        )}

        {/* Premium Badge */}
        {house_premium_count > 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded shadow-md">
            ⭐ Premium
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Company Name */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
          {company_name}
        </h3>

        {/* Meta Info */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          {/* Houses Count */}
          {house_count > 0 && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {house_count} {house_count === 1 ? 'modelo' : 'modelos'}
            </span>
          )}

          {/* Experience */}
          {experiencia_years && experiencia_years > 0 && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {experiencia_years} años
            </span>
          )}

          {/* Llave en Mano */}
          {llave_en_mano && (
            <span className="flex items-center text-green-600 font-medium">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Llave en Mano
            </span>
          )}
        </div>

        {/* Price Range */}
        {priceRange && (
          <div className="mt-3 px-3 py-2 bg-gray-50 rounded-md">
            <div className="text-sm font-semibold text-gray-900">{priceRange}</div>
            <div className="text-xs text-gray-500">Precio referencial</div>
          </div>
        )}

        {/* Regions */}
        {regions && regions.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-700 mb-1">Regiones:</div>
            <div className="flex flex-wrap gap-1">
              {regions.slice(0, 5).map((code) => (
                <span
                  key={code}
                  className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {REGION_NAMES[code] || code}
                </span>
              ))}
              {regions.length > 5 && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  +{regions.length - 5} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Services */}
        {services.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-700 mb-1">Servicios:</div>
            <div className="flex flex-wrap gap-1">
              {services.map((service) => (
                <span
                  key={service}
                  className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-700 mb-1">Especialidad:</div>
            <div className="flex flex-wrap gap-1">
              {specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {has_verified ? (
              <span className="text-xs text-green-600 font-medium">✓ Verificado</span>
            ) : (
              <span className="text-xs text-gray-500">Perfil declarado</span>
            )}
            <span className="text-sm font-medium text-primary group-hover:text-primary/80 flex items-center">
              Ver detalle
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
