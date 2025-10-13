import React from 'react';
import DataTable from './catalog/DataTable';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  status: string;
  author_name: string | null;
  views_count: number | null;
  likes_count: number | null;
  shares_count: number | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  created_at: string | null;
}

interface BlogTableProps {
  posts: BlogPost[];
  userRole: string;
}

const getCategoryLabel = (category: string | null) => {
  const labels: Record<string, string> = {
    'tendencias': 'Tendencias',
    'guias': 'Guías',
    'casos_exito': 'Casos de Éxito',
    'noticias': 'Noticias',
    'tutoriales': 'Tutoriales'
  };
  return category ? labels[category] || category : 'Sin categoría';
};

const getCategoryVariant = (category: string | null) => {
  const variants: Record<string, 'primary' | 'success' | 'secondary' | 'warning' | 'info'> = {
    'tendencias': 'primary',
    'guias': 'info',
    'casos_exito': 'success',
    'noticias': 'warning',
    'tutoriales': 'secondary'
  };
  return category ? variants[category] || 'neutral' as const : 'neutral' as const;
};

export default function BlogTable({ posts, userRole }: BlogTableProps) {
  const columns = [
    {
      key: 'title',
      label: 'Post',
      sortable: true,
      render: (_: any, row: BlogPost) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {row.featured_image_url ? (
              <img
                className="h-16 w-16 rounded-lg object-cover shadow-apple-sm"
                src={row.featured_image_url}
                alt={row.title}
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-brand-green-light to-brand-green flex items-center justify-center shadow-apple-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <a
              href={`/admin/content/blog/${row.id}/edit`}
              className="text-sm font-semibold text-gray-900 hover:text-accent-blue transition-colors block truncate"
            >
              {row.title}
            </a>
            {row.excerpt && (
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {row.excerpt}
              </div>
            )}
            {row.reading_time_minutes && (
              <div className="text-xs text-accent-blue mt-0.5">
                {row.reading_time_minutes} min lectura
              </div>
            )}
          </div>
        </div>
      ),
      width: '320px'
    },
    {
      key: 'category',
      label: 'Categoría',
      sortable: true,
      render: (_: any, row: BlogPost) => (
        <Badge variant={getCategoryVariant(row.category)} size="sm">
          {getCategoryLabel(row.category)}
        </Badge>
      ),
      width: '140px'
    },
    {
      key: 'author_name',
      label: 'Autor',
      render: (_: any, row: BlogPost) => (
        <div className="text-sm text-gray-900">
          {row.author_name || <span className="text-gray-400 italic">Sin autor</span>}
        </div>
      ),
      width: '160px'
    },
    {
      key: 'published_at',
      label: 'Fecha',
      sortable: true,
      render: (_: any, row: BlogPost) => (
        <div className="text-sm text-gray-600">
          {row.published_at ? (
            <>
              <div className="font-medium">
                {new Date(row.published_at).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(row.published_at).toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </>
          ) : (
            <span className="text-gray-400 italic">No publicado</span>
          )}
        </div>
      ),
      width: '140px'
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      width: '120px'
    },
    {
      key: 'metrics',
      label: 'Engagement',
      render: (_: any, row: BlogPost) => (
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{row.views_count || 0} vistas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{row.likes_count || 0} likes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>{row.shares_count || 0} compartidos</span>
          </div>
        </div>
      ),
      width: '160px'
    },
  ];

  const handleView = (post: BlogPost) => {
    window.location.href = `/blog/${post.slug}`;
  };

  const handleEdit = (post: BlogPost) => {
    window.location.href = `/admin/content/blog/${post.id}/edit`;
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`¿Estás seguro que deseas eliminar el post "${post.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        alert('Error al eliminar post: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión al eliminar post');
    }
  };

  return (
    <DataTable
      data={posts}
      columns={columns}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={userRole === 'super_admin' ? handleDelete : undefined}
      searchable
      selectable
    />
  );
}
