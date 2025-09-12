import { useState, useEffect } from 'react';

interface SEOData {
  meta_title: string;
  meta_description: string;
  keywords: string[];
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  schema_markup: string;
}

interface ProviderSEOSettingsProps {
  providerId: string;
  companyName: string;
  initialData?: Partial<SEOData>;
  onDataChange?: (data: Partial<SEOData>) => void;
}

export default function ProviderSEOSettings({ 
  providerId, 
  companyName, 
  initialData = {},
  onDataChange 
}: ProviderSEOSettingsProps) {
  const [seoData, setSeoData] = useState<SEOData>({
    meta_title: initialData.meta_title || `${companyName} - Construcción Modular | MODTOK`,
    meta_description: initialData.meta_description || `${companyName} especialista en construcción modular y casas prefabricadas. Encuentra los mejores fabricantes en MODTOK.`,
    keywords: initialData.keywords || [],
    og_title: initialData.og_title || `${companyName} - MODTOK`,
    og_description: initialData.og_description || `Descubre ${companyName} y sus servicios de construcción modular`,
    og_image: initialData.og_image || '',
    canonical_url: initialData.canonical_url || `https://modtok.cl/providers/${providerId}`,
    schema_markup: initialData.schema_markup || generateDefaultSchema(companyName, providerId)
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [previewMode, setPreviewMode] = useState<'search' | 'social'>('search');

  useEffect(() => {
    if (onDataChange) {
      onDataChange(seoData);
    }
  }, [seoData, onDataChange]);

  function generateDefaultSchema(name: string, id: string) {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": name,
      "description": `${name} especialista en construcción modular y casas prefabricadas`,
      "url": `https://modtok.cl/providers/${id}`,
      "image": "",
      "@id": `https://modtok.cl/providers/${id}#organization`,
      "telephone": "",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CL"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "reviewCount": "1"
      },
      "priceRange": "$$"
    }, null, 2);
  }

  const updateSEOData = (field: keyof SEOData, value: any) => {
    setSeoData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seoData.keywords.includes(keywordInput.trim().toLowerCase())) {
      updateSEOData('keywords', [...seoData.keywords, keywordInput.trim().toLowerCase()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    updateSEOData('keywords', seoData.keywords.filter(k => k !== keyword));
  };

  const generateSuggestions = () => {
    const baseSuggestions = [
      'casas modulares',
      'construcción modular',
      'casas prefabricadas',
      'construcción sustentable',
      'arquitectura modular',
      'vivienda modular',
      'construcción rápida',
      'casas ecológicas',
      'construcción industrializada'
    ];
    
    return baseSuggestions.filter(suggestion => 
      !seoData.keywords.includes(suggestion) && 
      suggestion.toLowerCase().includes(companyName.toLowerCase().split(' ')[0])
    ).slice(0, 5);
  };

  const checkSEOScore = () => {
    let score = 0;
    let issues = [];

    // Meta title
    if (seoData.meta_title.length >= 30 && seoData.meta_title.length <= 60) score += 20;
    else issues.push(`Meta título debe tener entre 30-60 caracteres (actual: ${seoData.meta_title.length})`);

    // Meta description
    if (seoData.meta_description.length >= 120 && seoData.meta_description.length <= 160) score += 20;
    else issues.push(`Meta descripción debe tener entre 120-160 caracteres (actual: ${seoData.meta_description.length})`);

    // Keywords
    if (seoData.keywords.length >= 5 && seoData.keywords.length <= 15) score += 20;
    else issues.push(`Usar entre 5-15 keywords (actual: ${seoData.keywords.length})`);

    // Open Graph
    if (seoData.og_title && seoData.og_description) score += 20;
    else issues.push('Configurar Open Graph para redes sociales');

    // Schema markup
    try {
      JSON.parse(seoData.schema_markup);
      score += 20;
    } catch {
      issues.push('Schema markup debe ser JSON válido');
    }

    return { score, issues };
  };

  const { score, issues } = checkSEOScore();

  return (
    <div className="space-y-8">
      {/* SEO Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Configuración SEO</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">Score: {score}/100</span>
            </div>
          </div>
        </div>

        {issues.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Mejoras recomendadas:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Título *
              <span className={`ml-2 text-xs ${seoData.meta_title.length > 60 ? 'text-red-600' : 'text-gray-500'}`}>
                ({seoData.meta_title.length}/60)
              </span>
            </label>
            <input
              type="text"
              value={seoData.meta_title}
              onChange={(e) => updateSEOData('meta_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título que aparece en resultados de búsqueda"
              maxLength={70}
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Canónica
            </label>
            <input
              type="url"
              value={seoData.canonical_url}
              onChange={(e) => updateSEOData('canonical_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://modtok.cl/providers/..."
            />
          </div>

          {/* Meta Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Descripción *
              <span className={`ml-2 text-xs ${seoData.meta_description.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>
                ({seoData.meta_description.length}/160)
              </span>
            </label>
            <textarea
              value={seoData.meta_description}
              onChange={(e) => updateSEOData('meta_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción que aparece en resultados de búsqueda"
              maxLength={180}
            />
          </div>

          {/* Keywords */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Palabras Clave ({seoData.keywords.length})
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Agregar palabra clave"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>

            {/* Current Keywords */}
            {seoData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {seoData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Keyword Suggestions */}
            {generateSuggestions().length > 0 && (
              <div className="text-sm text-gray-600">
                <p className="mb-2">Sugerencias:</p>
                <div className="flex flex-wrap gap-2">
                  {generateSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => updateSEOData('keywords', [...seoData.keywords, suggestion])}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open Graph */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Open Graph (Redes Sociales)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Social
            </label>
            <input
              type="text"
              value={seoData.og_title}
              onChange={(e) => updateSEOData('og_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título para compartir en redes sociales"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen Social
            </label>
            <input
              type="url"
              value={seoData.og_image}
              onChange={(e) => updateSEOData('og_image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="URL de imagen para redes sociales"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Social
            </label>
            <textarea
              value={seoData.og_description}
              onChange={(e) => updateSEOData('og_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción para compartir en redes sociales"
            />
          </div>
        </div>
      </div>

      {/* Schema Markup */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Schema Markup (JSON-LD)</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Datos Estructurados
          </label>
          <textarea
            value={seoData.schema_markup}
            onChange={(e) => updateSEOData('schema_markup', e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="JSON-LD para datos estructurados"
          />
          <p className="text-xs text-gray-500 mt-2">
            Define los datos estructurados que los motores de búsqueda utilizarán para entender mejor el contenido.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Vista Previa</h4>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPreviewMode('search')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                previewMode === 'search'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Búsqueda
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('social')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                previewMode === 'social'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Social
            </button>
          </div>
        </div>

        {previewMode === 'search' ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-1">
              <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                {seoData.meta_title}
              </h3>
              <div className="text-green-700 text-sm">
                {seoData.canonical_url}
              </div>
              <p className="text-gray-600 text-sm">
                {seoData.meta_description}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="border border-gray-200 rounded-lg bg-white max-w-md">
              {seoData.og_image && (
                <img
                  src={seoData.og_image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              )}
              <div className="p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">MODTOK.CL</div>
                <h4 className="font-medium text-gray-900 mb-1">{seoData.og_title}</h4>
                <p className="text-sm text-gray-600">{seoData.og_description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}