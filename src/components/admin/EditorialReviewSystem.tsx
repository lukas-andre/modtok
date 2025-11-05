import { useState, useEffect } from 'react';
import type { Provider, House, ServiceProduct } from "@/lib/database.helpers";

interface VerificationItem {
  id: string;
  name: string;
  type: 'provider' | 'house' | 'service_product';
  tier: string;
  main_image_url?: string;
  has_quality_images: boolean;
  has_complete_info: boolean;
  editor_approved_for_premium: boolean;
  status: string;
  created_at: string;
}

interface BulkActionResult {
  success: number;
  failed: number;
  errors: string[];
}

type FilterType = 'all' | 'provider' | 'house' | 'service_product';
type FilterStatus = 'all' | 'pending' | 'approved' | 'needs_review';

export default function EditorialReviewSystem() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [filterTier, setFilterTier] = useState<string>('all');

  useEffect(() => {
    loadItems();
  }, [filterType, filterStatus, filterTier]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterTier !== 'all') params.set('tier', filterTier);

      const response = await fetch(`/api/admin/editorial/pending?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) {
      alert('Selecciona al menos un elemento');
      return;
    }

    if (!confirm(`¿Aprobar ${selectedItems.size} elemento(s) para tier premium?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/editorial/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_ids: Array.from(selectedItems),
          items: items.filter(item => selectedItems.has(item.id))
        })
      });

      if (response.ok) {
        const result: BulkActionResult = await response.json();
        alert(`Aprobados: ${result.success} | Errores: ${result.failed}`);
        setSelectedItems(new Set());
        await loadItems();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al aprobar elementos');
      }
    } catch (error) {
      console.error('Error in bulk approve:', error);
      alert('Error al aprobar elementos');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.size === 0) {
      alert('Selecciona al menos un elemento');
      return;
    }

    if (!confirm(`¿Rechazar ${selectedItems.size} elemento(s) para tier premium?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/editorial/bulk-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_ids: Array.from(selectedItems),
          items: items.filter(item => selectedItems.has(item.id))
        })
      });

      if (response.ok) {
        const result: BulkActionResult = await response.json();
        alert(`Rechazados: ${result.success} | Errores: ${result.failed}`);
        setSelectedItems(new Set());
        await loadItems();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al rechazar elementos');
      }
    } catch (error) {
      console.error('Error in bulk reject:', error);
      alert('Error al rechazar elementos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFlags = async (itemId: string, flags: Partial<VerificationItem>) => {
    setLoading(true);
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const response = await fetch(`/api/admin/editorial/${item.type}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flags)
      });

      if (response.ok) {
        await loadItems();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al actualizar flags');
      }
    } catch (error) {
      console.error('Error updating flags:', error);
      alert('Error al actualizar flags');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (item: VerificationItem) => {
    if (item.editor_approved_for_premium) {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">✓ Aprobado Premium</span>;
    }
    if (item.has_quality_images && item.has_complete_info) {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded">⏳ Listo para Revisión</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">○ Pendiente</span>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'provider': return '🏢';
      case 'house': return '🏠';
      case 'service_product': return '🔧';
      default: return '📦';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'provider': return 'Proveedor';
      case 'house': return 'Casa';
      case 'service_product': return 'Servicio';
      default: return type;
    }
  };

  const filteredItems = items;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revisión Editorial - Quality Flags</h2>
          <p className="text-gray-600 mt-1">Revisa y aprueba contenido para tier premium</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedItems.size > 0 && (
            <>
              <span className="text-sm text-gray-600">{selectedItems.size} seleccionados</span>
              <button
                onClick={handleBulkReject}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                ✕ Rechazar Selección
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                ✓ Aprobar Selección
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contenido</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos</option>
              <option value="provider">🏢 Proveedores</option>
              <option value="house">🏠 Casas</option>
              <option value="service_product">🔧 Servicios</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos</option>
              <option value="pending">⏳ Pendientes</option>
              <option value="approved">✓ Aprobados</option>
              <option value="needs_review">⚠️ Necesita Revisión</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos</option>
              <option value="premium">👑 Premium</option>
              <option value="destacado">⭐ Destacado</option>
              <option value="standard">📋 Standard</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadItems}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === items.length && items.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contenido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flags Editoriales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No hay elementos que coincidan con los filtros</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getTypeIcon(item.type)}</span>
                        <span className="text-sm text-gray-600">{getTypeLabel(item.type)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {item.main_image_url && (
                          <img
                            src={item.main_image_url}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        item.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                        item.tier === 'destacado' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.tier === 'premium' ? '👑' : item.tier === 'destacado' ? '⭐' : '📋'} {item.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-1">
                        <label className="flex items-center space-x-2 text-xs">
                          <input
                            type="checkbox"
                            checked={item.has_quality_images}
                            onChange={(e) => handleUpdateFlags(item.id, { has_quality_images: e.target.checked })}
                            className="w-3 h-3 text-purple-600 border-gray-300 rounded"
                          />
                          <span className={item.has_quality_images ? 'text-green-700' : 'text-gray-500'}>
                            {item.has_quality_images ? '✓' : '○'} Imágenes de calidad
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs">
                          <input
                            type="checkbox"
                            checked={item.has_complete_info}
                            onChange={(e) => handleUpdateFlags(item.id, { has_complete_info: e.target.checked })}
                            className="w-3 h-3 text-purple-600 border-gray-300 rounded"
                          />
                          <span className={item.has_complete_info ? 'text-green-700' : 'text-gray-500'}>
                            {item.has_complete_info ? '✓' : '○'} Info completa
                          </span>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(item)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {!item.editor_approved_for_premium && item.has_quality_images && item.has_complete_info && (
                          <button
                            onClick={() => handleUpdateFlags(item.id, { editor_approved_for_premium: true })}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                          >
                            ✓ Aprobar
                          </button>
                        )}
                        {item.editor_approved_for_premium && (
                          <button
                            onClick={() => handleUpdateFlags(item.id, { editor_approved_for_premium: false })}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                          >
                            ✕ Revocar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Criterios de Aprobación Premium</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">✓ Imágenes de Calidad:</h4>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Mínimo 1200x800px</li>
              <li>• Bien iluminadas y enfocadas</li>
              <li>• Sin marcas de agua intrusivas</li>
              <li>• Representativas del producto/servicio</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">✓ Información Completa:</h4>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Descripción detallada y precisa</li>
              <li>• Especificaciones técnicas completas</li>
              <li>• Precio y disponibilidad actualizados</li>
              <li>• Datos de contacto verificados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
