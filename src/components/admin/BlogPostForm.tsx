import { useState, useEffect, useCallback } from 'react';
import TipTapEditor from './TipTapEditor';
import type { Database } from '@/lib/database.types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

interface BlogPostFormProps {
  post?: BlogPost;
  onSave: (data: BlogPostInsert | BlogPostUpdate) => Promise<void>;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: 'guias', label: 'Guías' },
  { value: 'tutoriales', label: 'Tutoriales' },
  { value: 'tendencias', label: 'Tendencias' },
  { value: 'consejos', label: 'Consejos' },
  { value: 'casos-exito', label: 'Casos de Éxito' }
];

const STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'archived', label: 'Archivado' }
];

export default function BlogPostForm({ post, onSave, onCancel }: BlogPostFormProps) {
  const [formData, setFormData] = useState<Partial<BlogPostInsert>>({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || 'guias',
    tags: post?.tags || [],
    featured_image_url: post?.featured_image_url || '',
    featured_image_alt: post?.featured_image_alt || '',
    author_name: post?.author_name || '',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    keywords: post?.keywords || [],
    og_image_url: post?.og_image_url || '',
    canonical_url: post?.canonical_url || '',
    status: post?.status || 'draft',
    published_at: post?.published_at || null,
    scheduled_for: post?.scheduled_for || null
  });

  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  // Auto-generate slug from title
  useEffect(() => {
    if (!post && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, post]);

  // Auto-save drafts (debounced)
  useEffect(() => {
    if (!formData.title) return;

    const timer = setTimeout(() => {
      if (formData.status === 'draft') {
        handleAutoSave();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = async () => {
    // Require minimum content for auto-save to prevent API errors
    if (!formData.title || formData.title.length < 5) return;
    if (!formData.content || formData.content.length < 50) return;

    try {
      setSaveMessage('Guardando borrador...');
      await onSave(formData);
      setSaveMessage('✓ Guardado');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveMessage('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.slug || formData.slug.length < 3) {
      newErrors.slug = 'El slug es requerido (mínimo 3 caracteres)';
    }

    if (!formData.content || formData.content.length < 100) {
      newErrors.content = 'El contenido debe tener al menos 100 caracteres';
    }

    if (formData.status === 'published' && !formData.published_at) {
      newErrors.published_at = 'Debes establecer una fecha de publicación';
    }

    if (formData.status === 'scheduled' && !formData.scheduled_for) {
      newErrors.scheduled_for = 'Debes establecer una fecha programada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Set published_at if publishing for first time
      const dataToSave = { ...formData };
      if (formData.status === 'published' && !formData.published_at) {
        dataToSave.published_at = new Date().toISOString();
      }

      await onSave(dataToSave);
      setSaveMessage('✓ Post guardado exitosamente');
    } catch (error: any) {
      setSaveMessage('❌ Error al guardar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const generateSlug = () => {
    if (!formData.title) return;

    const slug = formData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setFormData(prev => ({ ...prev, slug }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with tabs and save status */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contenido
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'seo'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            SEO & Metadata
          </button>
        </div>

        {saveMessage && (
          <span className="text-sm text-gray-600">{saveMessage}</span>
        )}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título del artículo"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="titulo-del-articulo"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors whitespace-nowrap"
                title="Generar slug desde el título"
              >
                🔄 Generar
              </button>
            </div>
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            <p className="mt-1 text-sm text-gray-500">
              URL: /blog/{formData.slug || 'slug'}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extracto
            </label>
            <textarea
              value={formData.excerpt || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Breve resumen del artículo (aparece en listados)"
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.category || 'guias'}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'guias' | 'tutoriales' | 'tendencias' | 'consejos' | 'casos-exito' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Agregar tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen Destacada (URL)
              </label>
              <input
                type="url"
                value={formData.featured_image_url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text de Imagen
              </label>
              <input
                type="text"
                value={formData.featured_image_alt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción de la imagen"
              />
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Autor
            </label>
            <input
              type="text"
              value={formData.author_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MODTOK Editorial"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido *
            </label>
            <TipTapEditor
              content={formData.content || ''}
              onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
              placeholder="Escribe tu artículo aquí..."
            />
            {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content}</p>}
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="space-y-6">
          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title (SEO)
            </label>
            <input
              type="text"
              value={formData.meta_title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título optimizado para SEO (max 60 caracteres)"
              maxLength={60}
            />
            <p className="mt-1 text-sm text-gray-500">
              {(formData.meta_title || '').length}/60 caracteres
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description (SEO)
            </label>
            <textarea
              value={formData.meta_description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción optimizada para motores de búsqueda (max 160 caracteres)"
              maxLength={160}
            />
            <p className="mt-1 text-sm text-gray-500">
              {(formData.meta_description || '').length}/160 caracteres
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (SEO)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Agregar keyword"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.keywords?.map(keyword => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Open Graph Image (URL)
            </label>
            <input
              type="url"
              value={formData.og_image_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, og_image_url: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://... (1200x630px recomendado)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Imagen para compartir en redes sociales
            </p>
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canonical URL
            </label>
            <input
              type="url"
              value={formData.canonical_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://modtok.cl/blog/slug"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL canónica (dejar vacío para usar URL por defecto)
            </p>
          </div>
        </div>
      )}

      {/* Publishing Options */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Opciones de Publicación</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              value={formData.status || 'draft'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' | 'archived' }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {formData.status === 'published' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Publicación
              </label>
              <input
                type="datetime-local"
                value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.published_at && <p className="mt-1 text-sm text-red-600">{errors.published_at}</p>}
            </div>
          )}

          {formData.status === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programar Para
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_for ? new Date(formData.scheduled_for).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.scheduled_for && <p className="mt-1 text-sm text-red-600">{errors.scheduled_for}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end border-t pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Guardando...' : (post ? 'Actualizar Post' : 'Crear Post')}
        </button>
      </div>
    </form>
  );
}
