import { useState } from 'react';

interface ProviderPageBuilderProps {
  providerId: string;
  companyName: string;
  tier: 'standard' | 'premium' | 'destacado';
}

export default function ProviderPageBuilder({ 
  providerId, 
  companyName, 
  tier 
}: ProviderPageBuilderProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'sections' | 'preview'>('templates');

  // Check if user has access to page builder (only premium providers)
  const hasAccess = tier === 'premium';

  const ComingSoonCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6 text-center">
      <div className="absolute top-3 right-3">
        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
          PRÓXIMAMENTE
        </span>
      </div>
      <div className="text-blue-600 mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      <button
        disabled
        className="mt-4 px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-sm font-medium"
      >
        Disponible Pronto
      </button>
    </div>
  );

  if (!hasAccess) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-amber-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Constructor de Páginas Premium</h3>
        <p className="text-gray-600 mb-6">
          El constructor de páginas avanzado está disponible exclusivamente para proveedores Premium.
          Mejora tu plan para acceder a esta funcionalidad.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-blue-900 font-medium mb-2">Características Premium Incluidas:</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Editor visual drag & drop</li>
            <li>• Plantillas personalizables</li>
            <li>• Secciones dinámicas</li>
            <li>• Galería de imágenes avanzada</li>
            <li>• Configuración SEO completa</li>
            <li>• Vista previa en tiempo real</li>
          </ul>
        </div>

        <button
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          onClick={() => alert('Redirigir a la página de upgrade del plan')}
        >
          Actualizar a Premium
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Constructor de Páginas</h3>
          <p className="text-gray-600">Personaliza la página de {companyName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
            PREMIUM
          </span>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            onClick={() => window.open(`/providers/${providerId}/preview`, '_blank')}
          >
            🔍 Vista Previa
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'templates', label: 'Plantillas', icon: '🎨' },
            { id: 'sections', label: 'Secciones', icon: '📝' },
            { id: 'preview', label: 'Vista Previa', icon: '👁️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComingSoonCard
                title="Plantilla Moderna"
                description="Diseño limpio y minimalista perfecto para fabricantes de casas modulares"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h4a1 1 0 011 1v5m-4-5V9a1 1 0 011-1h2a1 1 0 011 1v4.01" />
                  </svg>
                }
              />

              <ComingSoonCard
                title="Plantilla Showcase"
                description="Ideal para mostrar proyectos y galería de trabajos realizados"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />

              <ComingSoonCard
                title="Plantilla Corporativa"
                description="Diseño profesional para empresas consolidadas con múltiples servicios"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" />
                  </svg>
                }
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-900 font-medium mb-1">Sistema de Plantillas</h4>
                  <p className="text-blue-800 text-sm">
                    Nuestro sistema de plantillas te permitirá elegir entre diferentes diseños predefinidos,
                    personalizarlos según tu marca y crear una experiencia única para tus clientes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComingSoonCard
                title="Secciones Dinámicas"
                description="Arrastra y suelta secciones personalizables para crear tu página única"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                }
              />

              <ComingSoonCard
                title="Editor Visual"
                description="Editor WYSIWYG para personalizar cada sección sin conocimientos técnicos"
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Secciones Disponibles (Próximamente)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Hero Banner', desc: 'Encabezado principal con imagen y texto destacado' },
                  { name: 'Servicios', desc: 'Lista de servicios con iconos y descripciones' },
                  { name: 'Proyectos', desc: 'Galería de trabajos realizados' },
                  { name: 'Testimonios', desc: 'Reseñas y opiniones de clientes' },
                  { name: 'Contacto', desc: 'Formulario y datos de contacto' },
                  { name: 'FAQ', desc: 'Preguntas frecuentes desplegables' },
                  { name: 'Proceso', desc: 'Pasos del proceso de trabajo' },
                  { name: 'Equipo', desc: 'Presentación del equipo de trabajo' },
                  { name: 'Certificaciones', desc: 'Mostrar certificaciones y reconocimientos' }
                ].map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 text-center opacity-60">
                    <h5 className="font-medium text-gray-900 mb-1">{section.name}</h5>
                    <p className="text-xs text-gray-600">{section.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Vista Previa en Tiempo Real</h4>
              <p className="text-gray-600 mb-6">
                Una vez que el editor visual esté disponible, podrás ver los cambios en tiempo real
                antes de publicar tu página personalizada.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Desktop</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Mobile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Tablet</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  onClick={() => window.open(`/providers/${providerId}`, '_blank')}
                >
                  Ver Página Actual
                </button>
                <button
                  disabled
                  className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                >
                  Vista Previa Avanzada (Próximamente)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}