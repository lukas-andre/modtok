import { useState, useEffect } from 'react';
import type { HomepageSlot, Provider, House, ServiceProduct } from "@/lib/database.helpers";

interface SlotWithContent extends HomepageSlot {
  content?: {
    name: string;
    main_image_url?: string;
    slug?: string;
  };
}

interface SlotManagementUIProps {
  initialSlots?: SlotWithContent[];
}

type SlotType = 'premium' | 'destacado' | 'standard';
type ContentType = 'provider' | 'house' | 'service_product';

interface SlotFormData {
  slot_position: number;
  slot_type: SlotType;
  content_type: ContentType | '';
  content_id: string;
  monthly_price: string;
  start_date: string;
  end_date: string;
  rotation_order: number;
  is_active: boolean;
}

const SLOT_TYPE_CONFIG = {
  premium: {
    label: 'Premium',
    description: '2 slots visibles, rotación automática',
    visibleCount: 2,
    color: 'purple',
    icon: '👑'
  },
  destacado: {
    label: 'Destacado',
    description: '4 slots visibles, rotación automática',
    visibleCount: 4,
    color: 'blue',
    icon: '⭐'
  },
  standard: {
    label: 'Standard',
    description: 'Listado estándar sin rotación',
    visibleCount: Infinity,
    color: 'gray',
    icon: '📋'
  }
};

const CONTENT_TYPE_CONFIG = {
  provider: { label: 'Proveedor', icon: '🏢' },
  house: { label: 'Casa', icon: '🏠' },
  service_product: { label: 'Servicio', icon: '🔧' }
};

export default function SlotManagementUI({ initialSlots = [] }: SlotManagementUIProps) {
  const [slots, setSlots] = useState<SlotWithContent[]>(initialSlots);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SlotWithContent | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [services, setServices] = useState<ServiceProduct[]>([]);
  const [selectedSlotType, setSelectedSlotType] = useState<SlotType>('premium');
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);

  const [formData, setFormData] = useState<SlotFormData>({
    slot_position: 1,
    slot_type: 'premium',
    content_type: '',
    content_id: '',
    monthly_price: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rotation_order: 0,
    is_active: true
  });

  // Load slots
  useEffect(() => {
    loadSlots();
  }, []);

  // Load content options
  useEffect(() => {
    loadContentOptions();
  }, [formData.content_type]);

  // Round-robin rotation simulation (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRotationIndex(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/slots');
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContentOptions = async () => {
    if (!formData.content_type) return;

    try {
      if (formData.content_type === 'provider') {
        const response = await fetch('/api/admin/providers?limit=100&status=active');
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || []);
        }
      } else if (formData.content_type === 'house') {
        const response = await fetch('/api/admin/houses?limit=100&status=active');
        if (response.ok) {
          const data = await response.json();
          setHouses(data.houses || []);
        }
      } else if (formData.content_type === 'service_product') {
        const response = await fetch('/api/admin/services?limit=100&status=active');
        if (response.ok) {
          const data = await response.json();
          setServices(data.services || []);
        }
      }
    } catch (error) {
      console.error('Error loading content options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingSlot
        ? `/api/admin/slots/${editingSlot.id}`
        : '/api/admin/slots';

      const method = editingSlot ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthly_price: parseFloat(formData.monthly_price) || null,
          content_type: formData.content_type || null,
          content_id: formData.content_id || null
        })
      });

      if (response.ok) {
        await loadSlots();
        resetForm();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar slot');
      }
    } catch (error) {
      console.error('Error saving slot:', error);
      alert('Error al guardar slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('¿Estás seguro de eliminar este slot?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/slots/${slotId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSlots();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al eliminar slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error al eliminar slot');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slot: SlotWithContent) => {
    setEditingSlot(slot);
    setFormData({
      slot_position: slot.slot_position,
      slot_type: slot.slot_type as SlotType,
      content_type: (slot.content_type as ContentType) || '',
      content_id: slot.content_id || '',
      monthly_price: slot.monthly_price?.toString() || '',
      start_date: slot.start_date || '',
      end_date: slot.end_date || '',
      rotation_order: slot.rotation_order || 0,
      is_active: slot.is_active !== false
    });
    setShowForm(true);
  };

  const toggleActive = async (slot: SlotWithContent) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/slots/${slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...slot,
          is_active: !slot.is_active
        })
      });

      if (response.ok) {
        await loadSlots();
      }
    } catch (error) {
      console.error('Error toggling slot:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingSlot(null);
    setFormData({
      slot_position: 1,
      slot_type: 'premium',
      content_type: '',
      content_id: '',
      monthly_price: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rotation_order: 0,
      is_active: true
    });
  };

  const getSlotsByType = (type: SlotType) => {
    return slots
      .filter(slot => slot.slot_type === type)
      .sort((a, b) => (a.rotation_order || 0) - (b.rotation_order || 0));
  };

  const getVisibleSlots = (type: SlotType) => {
    const typeSlots = getSlotsByType(type).filter(s => s.is_active);
    const config = SLOT_TYPE_CONFIG[type];

    if (config.visibleCount === Infinity) return typeSlots;

    const visibleSlots: SlotWithContent[] = [];
    const currentIndex = currentRotationIndex % (typeSlots.length || 1);

    for (let i = 0; i < Math.min(config.visibleCount, typeSlots.length); i++) {
      const index = (currentIndex + i) % typeSlots.length;
      visibleSlots.push(typeSlots[index]);
    }

    return visibleSlots;
  };

  const getContentOptions = () => {
    if (formData.content_type === 'provider') return providers;
    if (formData.content_type === 'house') return houses;
    if (formData.content_type === 'service_product') return services;
    return [];
  };

  const getNextRotationOrder = (type: SlotType) => {
    const typeSlots = getSlotsByType(type);
    return typeSlots.length > 0
      ? Math.max(...typeSlots.map(s => s.rotation_order || 0)) + 1
      : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Slots Homepage</h2>
          <p className="text-gray-600 mt-1">Sistema de rotación automática (round-robin)</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <span>{showForm ? '✕ Cancelar' : '+ Nuevo Slot'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSlot ? 'Editar Slot' : 'Crear Nuevo Slot'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Slot Type & Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Slot
                </label>
                <select
                  value={formData.slot_type}
                  onChange={(e) => {
                    const newType = e.target.value as SlotType;
                    setFormData({
                      ...formData,
                      slot_type: newType,
                      rotation_order: getNextRotationOrder(newType)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {Object.entries(SLOT_TYPE_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.icon} {config.label} - {config.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posición Visual
                </label>
                <input
                  type="number"
                  value={formData.slot_position}
                  onChange={(e) => setFormData({ ...formData, slot_position: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Content Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Contenido
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({
                    ...formData,
                    content_type: e.target.value as ContentType,
                    content_id: ''
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Sin contenido asignado</option>
                  {Object.entries(CONTENT_TYPE_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.content_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar {CONTENT_TYPE_CONFIG[formData.content_type as ContentType].label}
                  </label>
                  <select
                    value={formData.content_id}
                    onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar...</option>
                    {getContentOptions().map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name || item.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Pricing & Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Mensual (CLP)
                </label>
                <input
                  type="number"
                  value={formData.monthly_price}
                  onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="150000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Rotation Order & Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden de Rotación
                </label>
                <input
                  type="number"
                  value={formData.rotation_order}
                  onChange={(e) => setFormData({ ...formData, rotation_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Orden en el pool de rotación (0, 1, 2...)</p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Slot Activo</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : editingSlot ? 'Actualizar Slot' : 'Crear Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slot Type Tabs */}
      <div className="flex space-x-2 border-b">
        {Object.entries(SLOT_TYPE_CONFIG).map(([type, config]) => {
          const typeSlots = getSlotsByType(type as SlotType);
          const activeSlots = typeSlots.filter(s => s.is_active);

          return (
            <button
              key={type}
              onClick={() => setSelectedSlotType(type as SlotType)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedSlotType === type
                  ? `text-${config.color}-600 border-b-2 border-${config.color}-600`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {config.icon} {config.label} ({activeSlots.length}/{typeSlots.length})
            </button>
          );
        })}
      </div>

      {/* Rotation Preview */}
      {selectedSlotType !== 'standard' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Vista Previa - Homepage ({SLOT_TYPE_CONFIG[selectedSlotType].label})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Mostrando {SLOT_TYPE_CONFIG[selectedSlotType].visibleCount} de {getSlotsByType(selectedSlotType).filter(s => s.is_active).length} slots activos
              </p>
            </div>
            <div className="text-sm text-purple-600">
              🔄 Rotación cada 10s
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {getVisibleSlots(selectedSlotType).map((slot, index) => (
              <div
                key={slot.id}
                className="bg-white rounded-lg p-4 border-2 border-purple-300 shadow-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    Posición #{index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    Orden: {slot.rotation_order}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {slot.content?.name || 'Sin contenido'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {slot.content_type && CONTENT_TYPE_CONFIG[slot.content_type as ContentType]?.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slots List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {SLOT_TYPE_CONFIG[selectedSlotType].icon} Slots {SLOT_TYPE_CONFIG[selectedSlotType].label}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {SLOT_TYPE_CONFIG[selectedSlotType].description}
          </p>
        </div>

        <div className="divide-y">
          {getSlotsByType(selectedSlotType).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No hay slots de tipo {SLOT_TYPE_CONFIG[selectedSlotType].label}</p>
              <button
                onClick={() => {
                  resetForm();
                  setFormData({ ...formData, slot_type: selectedSlotType });
                  setShowForm(true);
                }}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                + Crear primer slot
              </button>
            </div>
          ) : (
            getSlotsByType(selectedSlotType).map((slot) => (
              <div
                key={slot.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !slot.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {slot.content_type && CONTENT_TYPE_CONFIG[slot.content_type as ContentType]?.icon}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {slot.content?.name || 'Sin contenido asignado'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>Posición: #{slot.slot_position}</span>
                          <span>Orden rotación: {slot.rotation_order}</span>
                          {slot.monthly_price && (
                            <span>${slot.monthly_price.toLocaleString()}/mes</span>
                          )}
                          <span>
                            {new Date(slot.start_date!).toLocaleDateString()} - {new Date(slot.end_date!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleActive(slot)}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        slot.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {slot.is_active ? '✓ Activo' : '○ Inactivo'}
                    </button>
                    <button
                      onClick={() => handleEdit(slot)}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
