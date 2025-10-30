import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';

interface Slot {
  id: string;
  slot_type: 'premium' | 'destacado';
  content_type: 'provider' | 'house' | 'service_product' | null;
  content_id: string | null;
  monthly_price: number | null;
  start_date: string;
  end_date: string;
  rotation_order: number;
  is_active: boolean;
  notes: string | null;
  content?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Provider {
  id: string;
  company_name: string;
}

interface House {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

export default function SlotsManager() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  // Filters
  const [filterSlotType, setFilterSlotType] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    slot_type: 'destacado' as 'premium' | 'destacado',
    content_type: 'provider' as 'provider' | 'house' | 'service_product',
    content_id: '',
    monthly_price: '',
    start_date: '',
    end_date: '',
    rotation_order: '0',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [filterSlotType, filterActive]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load slots with filters
      const params = new URLSearchParams();
      if (filterSlotType) params.append('slot_type', filterSlotType);
      if (filterActive) params.append('is_active', filterActive);

      const [slotsRes, providersRes, housesRes, servicesRes] = await Promise.all([
        fetch(`/api/admin/slots?${params.toString()}`),
        fetch('/api/admin/providers'),
        fetch('/api/admin/houses'),
        fetch('/api/admin/services')
      ]);

      const slotsData = await slotsRes.json();
      const providersData = await providersRes.json();
      const housesData = await housesRes.json();
      const servicesData = await servicesRes.json();

      setSlots(slotsData.slots || []);
      setProviders(providersData.providers || []);
      setHouses(housesData.houses || []);
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSlot(null);
    setFormData({
      slot_type: 'destacado',
      content_type: 'provider',
      content_id: '',
      monthly_price: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rotation_order: '0',
      is_active: true,
      notes: ''
    });
    setShowForm(true);
  };

  const handleEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setFormData({
      slot_type: slot.slot_type,
      content_type: slot.content_type || 'provider',
      content_id: slot.content_id || '',
      monthly_price: slot.monthly_price?.toString() || '',
      start_date: slot.start_date,
      end_date: slot.end_date,
      rotation_order: slot.rotation_order.toString(),
      is_active: slot.is_active,
      notes: slot.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      monthly_price: formData.monthly_price ? parseFloat(formData.monthly_price) : null,
      rotation_order: parseInt(formData.rotation_order) || 0
    };

    try {
      const url = editingSlot
        ? `/api/admin/slots/${editingSlot.id}`
        : '/api/admin/slots';

      const res = await fetch(url, {
        method: editingSlot ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingSlot ? 'Slot actualizado' : 'Slot creado');
        setShowForm(false);
        loadData();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving slot:', error);
      alert('Error saving slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este slot?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/slots/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Slot eliminado');
        loadData();
      } else {
        alert('Error eliminando slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error deleting slot');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (slot: Slot) => {
    try {
      await fetch(`/api/admin/slots/${slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !slot.is_active })
      });
      loadData();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const getContentOptions = () => {
    if (formData.content_type === 'provider') {
      return providers.map(p => ({ value: p.id, label: p.company_name }));
    } else if (formData.content_type === 'house') {
      return houses.map(h => ({ value: h.id, label: h.name }));
    } else {
      return services.map(s => ({ value: s.id, label: s.name }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Slots Manager</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestionar slots premium y destacados en homepage
          </p>
        </div>
        <Button onClick={handleCreate} disabled={loading}>
          + Nuevo Slot
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Tipo de Slot"
            name="filter_slot_type"
            value={filterSlotType}
            onChange={(e) => setFilterSlotType(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'premium', label: 'Premium' },
              { value: 'destacado', label: 'Destacado' }
            ]}
          />
          <SelectField
            label="Estado"
            name="filter_active"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'true', label: 'Activos' },
              { value: 'false', label: 'Inactivos' }
            ]}
          />
        </div>
      </div>

      {/* Slots List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contenido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : slots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No hay slots
                  </td>
                </tr>
              ) : (
                slots.map((slot) => (
                  <tr key={slot.id} className={slot.is_active ? '' : 'bg-gray-50 opacity-60'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        slot.slot_type === 'premium'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {slot.slot_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {slot.content?.name || 'Sin contenido'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {slot.content_type || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{new Date(slot.start_date).toLocaleDateString()}</div>
                      <div>{new Date(slot.end_date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slot.monthly_price ? `$${slot.monthly_price.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slot.rotation_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(slot)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          slot.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {slot.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingSlot ? 'Editar Slot' : 'Nuevo Slot'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Tipo de Slot"
                    name="slot_type"
                    value={formData.slot_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, slot_type: e.target.value as any }))}
                    required
                    options={[
                      { value: 'premium', label: 'Premium' },
                      { value: 'destacado', label: 'Destacado' }
                    ]}
                  />

                  <SelectField
                    label="Tipo de Contenido"
                    name="content_type"
                    value={formData.content_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value as any, content_id: '' }))}
                    required
                    options={[
                      { value: 'provider', label: 'Proveedor' },
                      { value: 'house', label: 'Casa' },
                      { value: 'service_product', label: 'Servicio' }
                    ]}
                  />

                  <SelectField
                    label="Contenido"
                    name="content_id"
                    value={formData.content_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_id: e.target.value }))}
                    options={[
                      { value: '', label: 'Seleccionar...' },
                      ...getContentOptions()
                    ]}
                    className="md:col-span-2"
                  />

                  <InputField
                    type="date"
                    label="Fecha Inicio"
                    name="start_date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />

                  <InputField
                    type="date"
                    label="Fecha Fin"
                    name="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />

                  <InputField
                    type="number"
                    label="Precio Mensual (CLP)"
                    name="monthly_price"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_price: e.target.value }))}
                    min={0}
                  />

                  <InputField
                    type="number"
                    label="Orden de Rotación"
                    name="rotation_order"
                    value={formData.rotation_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, rotation_order: e.target.value }))}
                    min={0}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
                    Activo
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="default" disabled={loading}>
                    {loading ? 'Guardando...' : editingSlot ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
