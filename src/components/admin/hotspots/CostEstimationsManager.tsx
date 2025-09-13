import React, { useState, useEffect } from 'react';

interface CostCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface CostEstimate {
  category_id: string;
  category_name: string;
  cost_min: number;
  cost_max: number;
  cost_avg: number;
  unit: string;
  notes?: string;
}

interface CostEstimationsManagerProps {
  hotspotId?: string;
  initialEstimates?: CostEstimate[];
  onEstimatesChange: (estimates: CostEstimate[]) => void;
}

const defaultCategories: CostCategory[] = [
  {
    id: 'terrain',
    name: 'Terreno',
    icon: '🏞️',
    description: 'Costo de adquisición de terreno'
  },
  {
    id: 'construction',
    name: 'Construcción',
    icon: '🏗️',
    description: 'Costo de construcción por m²'
  },
  {
    id: 'permits',
    name: 'Permisos',
    icon: '📋',
    description: 'Permisos municipales y legales'
  },
  {
    id: 'utilities',
    name: 'Servicios Básicos',
    icon: '⚡',
    description: 'Conexión de agua, luz, gas'
  },
  {
    id: 'transport',
    name: 'Transporte',
    icon: '🚛',
    description: 'Transporte de materiales y módulos'
  },
  {
    id: 'labor',
    name: 'Mano de Obra',
    icon: '👷',
    description: 'Costo de mano de obra local'
  },
  {
    id: 'materials',
    name: 'Materiales',
    icon: '🧱',
    description: 'Materiales locales adicionales'
  },
  {
    id: 'infrastructure',
    name: 'Infraestructura',
    icon: '🛤️',
    description: 'Accesos, fundaciones, etc.'
  }
];

const CostEstimationsManager: React.FC<CostEstimationsManagerProps> = ({
  hotspotId,
  initialEstimates = [],
  onEstimatesChange
}) => {
  const [estimates, setEstimates] = useState<CostEstimate[]>(initialEstimates);
  const [activeCategory, setActiveCategory] = useState<string>('terrain');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with default values if no estimates exist
  useEffect(() => {
    if (estimates.length === 0) {
      const defaultEstimates: CostEstimate[] = defaultCategories.map(category => ({
        category_id: category.id,
        category_name: category.name,
        cost_min: 0,
        cost_max: 0,
        cost_avg: 0,
        unit: category.id === 'terrain' || category.id === 'construction' ? 'CLP/m²' : 'CLP',
        notes: ''
      }));
      setEstimates(defaultEstimates);
      onEstimatesChange(defaultEstimates);
    }
  }, []);

  const updateEstimate = (categoryId: string, field: keyof CostEstimate, value: any) => {
    const updatedEstimates = estimates.map(estimate => {
      if (estimate.category_id === categoryId) {
        const updated = { ...estimate, [field]: value };
        // Auto-calculate average if min and max are provided
        if (field === 'cost_min' || field === 'cost_max') {
          const min = field === 'cost_min' ? value : estimate.cost_min;
          const max = field === 'cost_max' ? value : estimate.cost_max;
          if (min > 0 && max > 0) {
            updated.cost_avg = Math.round((min + max) / 2);
          }
        }
        return updated;
      }
      return estimate;
    });

    setEstimates(updatedEstimates);
    onEstimatesChange(updatedEstimates);
  };

  const calculateTotalRange = () => {
    const totals = estimates.reduce(
      (acc, estimate) => ({
        min: acc.min + (estimate.cost_min || 0),
        max: acc.max + (estimate.cost_max || 0),
        avg: acc.avg + (estimate.cost_avg || 0)
      }),
      { min: 0, max: 0, avg: 0 }
    );
    return totals;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRegionalMultiplier = (region: string) => {
    const multipliers: Record<string, number> = {
      'Metropolitana': 1.2,
      'Valparaíso': 1.1,
      'Antofagasta': 1.3,
      'Magallanes': 1.5,
      'Arica y Parinacota': 1.15,
      'Tarapacá': 1.25,
      'Atacama': 1.2,
      'Coquimbo': 1.05,
      'O\'Higgins': 0.95,
      'Maule': 0.9,
      'Ñuble': 0.9,
      'Biobío': 0.95,
      'Araucanía': 0.85,
      'Los Ríos': 0.9,
      'Los Lagos': 0.95,
      'Aysén': 1.4
    };
    return multipliers[region] || 1.0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Estimaciones de Costos por Región
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona los costos estimados para diferentes categorías de construcción
        </p>
      </div>

      <div className="p-6">
        {/* Category Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {defaultCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Active Category Form */}
        {defaultCategories.map((category) => {
          if (category.id !== activeCategory) return null;

          const estimate = estimates.find(e => e.category_id === category.id) || {
            category_id: category.id,
            category_name: category.name,
            cost_min: 0,
            cost_max: 0,
            cost_avg: 0,
            unit: category.id === 'terrain' || category.id === 'construction' ? 'CLP/m²' : 'CLP',
            notes: ''
          };

          return (
            <div key={category.id} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Costo Mínimo
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={estimate.cost_min}
                      onChange={(e) => updateEstimate(category.id, 'cost_min', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{estimate.unit}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Costo Máximo
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={estimate.cost_max}
                      onChange={(e) => updateEstimate(category.id, 'cost_max', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{estimate.unit}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Promedio (Auto-calculado)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={estimate.cost_avg}
                      readOnly
                      className="block w-full pl-7 pr-12 border-gray-300 bg-gray-50 rounded-md sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{estimate.unit}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Unidad de Medida
                </label>
                <select
                  value={estimate.unit}
                  onChange={(e) => updateEstimate(category.id, 'unit', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="CLP">CLP (monto fijo)</option>
                  <option value="CLP/m²">CLP/m² (por metro cuadrado)</option>
                  <option value="CLP/m³">CLP/m³ (por metro cúbico)</option>
                  <option value="CLP/unidad">CLP/unidad</option>
                  <option value="USD">USD</option>
                  <option value="UF">UF (Unidad de Fomento)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <textarea
                  rows={3}
                  value={estimate.notes || ''}
                  onChange={(e) => updateEstimate(category.id, 'notes', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Detalles específicos sobre estos costos..."
                />
              </div>

              {/* Regional Multiplier Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-900 mb-2">
                  💡 Multiplicador Regional
                </h5>
                <p className="text-sm text-blue-700">
                  Los costos pueden variar según la región. Factor de ajuste típico para regiones extremas: +15% a +50%
                </p>
              </div>
            </div>
          );
        })}

        {/* Cost Summary */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Resumen de Costos Totales
          </h4>

          {(() => {
            const totals = calculateTotalRange();
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totals.min)}
                  </div>
                  <div className="text-sm text-gray-600">Mínimo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totals.avg)}
                  </div>
                  <div className="text-sm text-gray-600">Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(totals.max)}
                  </div>
                  <div className="text-sm text-gray-600">Máximo</div>
                </div>
              </div>
            );
          })()}

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              * Estos son estimados base. Los costos reales pueden variar según condiciones específicas del proyecto.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres limpiar todas las estimaciones?')) {
                const clearedEstimates = estimates.map(est => ({
                  ...est,
                  cost_min: 0,
                  cost_max: 0,
                  cost_avg: 0,
                  notes: ''
                }));
                setEstimates(clearedEstimates);
                onEstimatesChange(clearedEstimates);
              }
            }}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Limpiar Todo
          </button>

          <div className="space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Exportar CSV
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar Plantilla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimationsManager;