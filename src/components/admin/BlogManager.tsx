import { useState, useEffect } from 'react';
import BlogPostForm from './BlogPostForm';
import type { BlogPost, BlogPostInsert, BlogPostUpdate } from '@/lib/database.types';

interface BlogManagerProps {
  user: any;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrev: boolean;
}

export default function BlogManager({ user }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrev: false
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // UI State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        sort_by: filters.sort_by,
        sort_order: filters.sort_order
      });

      const response = await fetch(`/api/admin/blog?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts || []);
        setPagination(data.pagination);
      } else {
        console.error('Error fetching posts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, filters]);

  // Create post
  const handleCreate = async (data: BlogPostInsert | BlogPostUpdate) => {
    try {
      const response = await fetch('/api/admin/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setShowCreateForm(false);
        fetchPosts();
        alert('Artículo creado exitosamente');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear artículo');
    }
  };

  // Update post
  const handleUpdate = async (data: BlogPostInsert | BlogPostUpdate) => {
    if (!editingPost) return;

    try {
      const response = await fetch(`/api/admin/blog/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setEditingPost(null);
        fetchPosts();
        alert('Artículo actualizado exitosamente');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error al actualizar artículo');
    }
  };

  // Delete post
  const handleDelete = async (postId: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPosts();
        alert('Artículo eliminado exitosamente');
      } else {
        const result = await response.json();
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar artículo');
    }
  };

  // Bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedPosts.length === 0) {
      alert('Selecciona una acción y al menos un artículo');
      return;
    }

    if (!confirm(`¿Aplicar "${bulkAction}" a ${selectedPosts.length} artículo(s)?`)) return;

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          post_ids: selectedPosts
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSelectedPosts([]);
        setBulkAction('');
        fetchPosts();
        alert(result.message);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error in bulk operation:', error);
      alert('Error en operación masiva');
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      draft: 'Borrador',
      pending_review: 'En revisión',
      published: 'Publicado',
      archived: 'Archivado'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Show form
  if (showCreateForm || editingPost) {
    return (
      <div>
        <button
          onClick={() => {
            setShowCreateForm(false);
            setEditingPost(null);
          }}
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver a la lista
        </button>
        <BlogPostForm
          post={editingPost || undefined}
          onSave={editingPost ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingPost(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="pending_review">En revisión</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            <option value="guias">Guías</option>
            <option value="tutoriales">Tutoriales</option>
            <option value="tendencias">Tendencias</option>
            <option value="consejos">Consejos</option>
            <option value="casos-exito">Casos de Éxito</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sort_by}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created_at">Fecha de creación</option>
            <option value="updated_at">Última actualización</option>
            <option value="published_at">Fecha de publicación</option>
            <option value="title">Título</option>
            <option value="views_count">Vistas</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            + Nuevo Artículo
          </button>

          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedPosts.length} seleccionado(s)
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg"
              >
                <option value="">Acción masiva...</option>
                <option value="publish">Publicar</option>
                <option value="unpublish">Despublicar</option>
                <option value="archive">Archivar</option>
                <option value="delete">Eliminar</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="bg-gray-600 text-white px-4 py-1 rounded-lg hover:bg-gray-700 text-sm"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando artículos...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay artículos</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === posts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(posts.map(p => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id]);
                        } else {
                          setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.category || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {post.status ? getStatusBadge(post.status) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(post as any).author?.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('es-CL')
                      : (post.created_at ? new Date(post.created_at).toLocaleDateString('es-CL') : '-')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={!pagination.hasMore}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
