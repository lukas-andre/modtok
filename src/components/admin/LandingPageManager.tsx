import { useState, useEffect } from 'react';

interface LandingPageData {
  enabled: boolean;
  slug: string;
  template: string;
  editorial_status: 'draft' | 'review' | 'published';
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  sections: Record<string, any>;
  published_at: string | null;
}

interface ProviderData {
  id: string;
  company_name: string;
  slug: string;
  tier: 'premium' | 'destacado' | 'standard';
}

interface LandingPageManagerProps {
  providerId: string;
}

export default function LandingPageManager({ providerId }: LandingPageManagerProps) {
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [landing, setLanding] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLandingConfig();
  }, [providerId]);

  const fetchLandingConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/providers/${providerId}/landing`);

      if (!response.ok) {
        throw new Error('Failed to fetch landing config');
      }

      const data = await response.json();
      setProvider(data.provider);
      setLanding(data.landing);
    } catch (error: any) {
      console.error('Error fetching landing config:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!landing) return;

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(`/api/admin/providers/${providerId}/landing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(landing),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save landing config');
      }

      const data = await response.json();
      setLanding(data.landing);
      setMessage({ type: 'success', text: 'Landing page configuration saved successfully!' });

      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving landing config:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const updateLanding = (field: keyof LandingPageData, value: any) => {
    setLanding(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading landing page configuration...</span>
        </div>
      </div>
    );
  }

  if (!provider || !landing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <p className="text-red-600">Failed to load landing page configuration</p>
      </div>
    );
  }

  const isPremium = provider.tier === 'premium';
  const landingUrl = `/fabricantes/${landing.slug}`;
  const isVisible = isPremium && landing.enabled && landing.editorial_status === 'published';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Landing Page Configuration</h2>
        <p className="text-gray-600 mt-1">
          Manage the public landing page for {provider.company_name}
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Tier Warning */}
      {!isPremium && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Premium Tier Requerido</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Este fabricante está en tier <strong>{provider.tier}</strong>.
                Las landing pages solo están disponibles para tier <strong>premium</strong>.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Ve a la sección <strong>"Tier y Visibilidad"</strong> arriba y cambia el tier a Premium para habilitar la configuración de landing page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Landing Page Status</h3>
            <p className="text-sm text-gray-600 mt-1">
              {isVisible ? (
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="font-medium text-green-700">Visible to public</span>
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  <span className="font-medium text-gray-700">Not visible</span>
                </span>
              )}
            </p>
          </div>
          {isVisible && (
            <a
              href={landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Page
            </a>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Enabled Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1">
            <label htmlFor="enabled" className="text-sm font-medium text-gray-900 block">
              Landing Page Enabled
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Enable or disable the landing page for this manufacturer
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateLanding('enabled', !landing.enabled)}
            disabled={!isPremium}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              landing.enabled ? 'bg-blue-600' : 'bg-gray-200'
            } ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              landing.enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-900 mb-2">
            URL Slug
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">/fabricantes/</span>
            <input
              type="text"
              id="slug"
              value={landing.slug}
              onChange={(e) => updateLanding('slug', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="manufacturer-slug"
            />
          </div>
          {landing.slug && (
            <p className="text-sm text-gray-500 mt-1">
              Full URL: {window.location.origin}{landingUrl}
            </p>
          )}
        </div>

        {/* Editorial Status */}
        <div>
          <label htmlFor="editorial_status" className="block text-sm font-medium text-gray-900 mb-2">
            Editorial Status
          </label>
          <select
            id="editorial_status"
            value={landing.editorial_status}
            onChange={(e) => updateLanding('editorial_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="published">Published</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {landing.editorial_status === 'draft' && 'Not ready for publication'}
            {landing.editorial_status === 'review' && 'Pending editorial review'}
            {landing.editorial_status === 'published' && 'Live and visible to public (if enabled and premium)'}
          </p>
        </div>

        {/* Template */}
        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-900 mb-2">
            Template
          </label>
          <select
            id="template"
            value={landing.template}
            onChange={(e) => updateLanding('template', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="manufacturer">Manufacturer (Default)</option>
            <option value="manufacturer-premium">Manufacturer Premium</option>
            <option value="manufacturer-showcase">Manufacturer Showcase</option>
          </select>
        </div>

        {/* SEO Fields */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-900 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                value={landing.meta_title || ''}
                onChange={(e) => updateLanding('meta_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`${provider.company_name} - Casas Modulares | MODTOK`}
              />
              <p className="text-sm text-gray-500 mt-1">
                {(landing.meta_title || '').length}/60 characters (optimal: 50-60)
              </p>
            </div>

            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-900 mb-2">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                value={landing.meta_description || ''}
                onChange={(e) => updateLanding('meta_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`${provider.company_name} especialista en construcción modular y casas prefabricadas.`}
              />
              <p className="text-sm text-gray-500 mt-1">
                {(landing.meta_description || '').length}/160 characters (optimal: 120-160)
              </p>
            </div>

            <div>
              <label htmlFor="og_image_url" className="block text-sm font-medium text-gray-900 mb-2">
                OG Image URL
              </label>
              <input
                type="url"
                id="og_image_url"
                value={landing.og_image_url || ''}
                onChange={(e) => updateLanding('og_image_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/og-image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Image for social media sharing (recommended: 1200x630px)
              </p>
            </div>
          </div>
        </div>

        {/* Published Date */}
        {landing.published_at && (
          <div className="text-sm text-gray-600">
            <strong>Published:</strong> {new Date(landing.published_at).toLocaleString()}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
