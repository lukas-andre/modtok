import React, { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface Specification {
  id: string;
  category: string;
  specs: SpecItem[];
}

interface SpecItem {
  key: string;
  label: string;
  value: string;
  unit?: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  options?: string[];
}

interface SpecificationBuilderProps {
  specifications: Specification[];
  onChange: (specifications: Specification[]) => void;
  predefinedCategories?: string[];
  predefinedSpecs?: { [category: string]: SpecItem[] };
}

export default function SpecificationBuilder({
  specifications = [],
  onChange,
  predefinedCategories = [
    'Dimensiones',
    'Materiales',
    'Características Técnicas',
    'Energía y Sostenibilidad',
    'Instalación',
    'Garantía',
    'Certificaciones'
  ],
  predefinedSpecs = {
    'Dimensiones': [
      { key: 'area_m2', label: 'Área Total', value: '', unit: 'm²', type: 'number' },
      { key: 'area_built_m2', label: 'Área Construida', value: '', unit: 'm²', type: 'number' },
      { key: 'width', label: 'Ancho', value: '', unit: 'm', type: 'number' },
      { key: 'length', label: 'Largo', value: '', unit: 'm', type: 'number' },
      { key: 'height', label: 'Alto', value: '', unit: 'm', type: 'number' },
      { key: 'weight', label: 'Peso', value: '', unit: 'kg', type: 'number' }
    ],
    'Materiales': [
      { key: 'main_material', label: 'Material Principal', value: '', type: 'text' },
      { key: 'structure', label: 'Estructura', value: '', type: 'text' },
      { key: 'walls', label: 'Paredes', value: '', type: 'text' },
      { key: 'roof', label: 'Techo', value: '', type: 'text' },
      { key: 'floor', label: 'Piso', value: '', type: 'text' },
      { key: 'insulation', label: 'Aislación', value: '', type: 'text' }
    ],
    'Características Técnicas': [
      { key: 'bedrooms', label: 'Habitaciones', value: '', type: 'number' },
      { key: 'bathrooms', label: 'Baños', value: '', type: 'number' },
      { key: 'floors', label: 'Pisos', value: '', type: 'number' },
      { key: 'windows_type', label: 'Tipo de Ventanas', value: '', type: 'text' },
      { key: 'doors_type', label: 'Tipo de Puertas', value: '', type: 'text' },
      { key: 'electrical_system', label: 'Sistema Eléctrico', value: '', type: 'text' },
      { key: 'plumbing_system', label: 'Sistema de Plomería', value: '', type: 'text' }
    ],
    'Energía y Sostenibilidad': [
      { key: 'energy_rating', label: 'Calificación Energética', value: '', type: 'select', options: ['A+', 'A', 'B', 'C', 'D', 'E', 'F'] },
      { key: 'solar_panels', label: 'Paneles Solares', value: '', type: 'boolean' },
      { key: 'water_collection', label: 'Recolección de Agua', value: '', type: 'boolean' },
      { key: 'thermal_insulation', label: 'Aislación Térmica', value: '', type: 'text' },
      { key: 'sustainable_materials', label: 'Materiales Sustentables', value: '', type: 'boolean' }
    ]
  }
}: SpecificationBuilderProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'manual' | 'template'>('manual');

  const addCategory = (categoryName?: string) => {
    const newCategory: Specification = {
      id: Math.random().toString(36).substr(2, 9),
      category: categoryName || 'Nueva Categoría',
      specs: []
    };
    onChange([...specifications, newCategory]);
  };

  const removeCategory = (categoryId: string) => {
    onChange(specifications.filter(cat => cat.id !== categoryId));
  };

  const updateCategory = (categoryId: string, updates: Partial<Specification>) => {
    onChange(specifications.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
  };

  const addSpec = (categoryId: string, spec?: SpecItem) => {
    const newSpec: SpecItem = spec || {
      key: `spec_${Math.random().toString(36).substr(2, 9)}`,
      label: '',
      value: '',
      type: 'text'
    };
    
    onChange(specifications.map(cat => 
      cat.id === categoryId 
        ? { ...cat, specs: [...cat.specs, newSpec] }
        : cat
    ));
  };

  const updateSpec = (categoryId: string, specIndex: number, updates: Partial<SpecItem>) => {
    onChange(specifications.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            specs: cat.specs.map((spec, idx) => 
              idx === specIndex ? { ...spec, ...updates } : spec
            )
          }
        : cat
    ));
  };

  const removeSpec = (categoryId: string, specIndex: number) => {
    onChange(specifications.map(cat => 
      cat.id === categoryId 
        ? { ...cat, specs: cat.specs.filter((_, idx) => idx !== specIndex) }
        : cat
    ));
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const importTemplate = (templateCategory: string) => {
    const templateSpecs = predefinedSpecs[templateCategory];
    if (templateSpecs) {
      const newCategory: Specification = {
        id: Math.random().toString(36).substr(2, 9),
        category: templateCategory,
        specs: templateSpecs.map(spec => ({ ...spec }))
      };
      onChange([...specifications, newCategory]);
    }
  };

  const exportSpecifications = () => {
    const exportData = specifications.reduce((acc, cat) => {
      acc[cat.category] = cat.specs.reduce((specAcc, spec) => {
        const key = spec.key || spec.label.toLowerCase().replace(/\s+/g, '_');
        specAcc[key] = spec.unit ? `${spec.value} ${spec.unit}` : spec.value;
        return specAcc;
      }, {} as any);
      return acc;
    }, {} as any);
    
    return exportData;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Especificaciones del Producto
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 text-sm font-medium ${
                activeTab === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } rounded-l-lg`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('template')}
              className={`px-3 py-1.5 text-sm font-medium ${
                activeTab === 'template'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } rounded-r-lg`}
            >
              Plantillas
            </button>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      {activeTab === 'template' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-3">
            Seleccione una plantilla para agregar especificaciones predefinidas:
          </p>
          <div className="flex flex-wrap gap-2">
            {predefinedCategories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => importTemplate(category)}
                className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Specifications List */}
      <div className="space-y-4">
        {specifications.map((category, catIndex) => (
          <div key={category.id} className="border border-gray-200 rounded-lg">
            {/* Category Header */}
            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
                
                <input
                  type="text"
                  value={category.category}
                  onChange={(e) => updateCategory(category.id, { category: e.target.value })}
                  className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-0 focus:ring-0 p-0"
                  placeholder="Nombre de la categoría"
                />
                
                <span className="text-sm text-gray-500">
                  ({category.specs.length} especificaciones)
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => removeCategory(category.id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Category Content */}
            {expandedCategories.has(category.id) && (
              <div className="p-4 space-y-3">
                {category.specs.map((spec, specIndex) => (
                  <div key={specIndex} className="flex items-start space-x-3">
                    <div className="flex-1 grid grid-cols-12 gap-3">
                      {/* Label */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) => updateSpec(category.id, specIndex, { label: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Etiqueta"
                        />
                      </div>
                      
                      {/* Type */}
                      <div className="col-span-2">
                        <select
                          value={spec.type}
                          onChange={(e) => updateSpec(category.id, specIndex, { type: e.target.value as SpecItem['type'] })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="boolean">Sí/No</option>
                          <option value="select">Selección</option>
                          <option value="multiselect">Multi-selección</option>
                        </select>
                      </div>
                      
                      {/* Value */}
                      <div className="col-span-4">
                        {spec.type === 'boolean' ? (
                          <select
                            value={spec.value}
                            onChange={(e) => updateSpec(category.id, specIndex, { value: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="">Seleccionar</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </select>
                        ) : spec.type === 'select' && spec.options ? (
                          <select
                            value={spec.value}
                            onChange={(e) => updateSpec(category.id, specIndex, { value: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="">Seleccionar</option>
                            {spec.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={spec.type === 'number' ? 'number' : 'text'}
                            value={spec.value}
                            onChange={(e) => updateSpec(category.id, specIndex, { value: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Valor"
                          />
                        )}
                      </div>
                      
                      {/* Unit */}
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={spec.unit || ''}
                          onChange={(e) => updateSpec(category.id, specIndex, { unit: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Unidad"
                        />
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeSpec(category.id, specIndex)}
                      className="text-red-600 hover:text-red-900 mt-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                
                {/* Add Spec Button */}
                <button
                  type="button"
                  onClick={() => addSpec(category.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Agregar Especificación
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Button */}
      <button
        type="button"
        onClick={() => addCategory()}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
      >
        <div className="flex items-center justify-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Categoría de Especificaciones
        </div>
      </button>

      {/* Summary */}
      {specifications.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Resumen de Especificaciones
          </h4>
          <div className="text-sm text-gray-600">
            <p>• {specifications.length} categorías</p>
            <p>• {specifications.reduce((acc, cat) => acc + cat.specs.length, 0)} especificaciones totales</p>
            <p>• {specifications.reduce((acc, cat) => acc + cat.specs.filter(s => s.value).length, 0)} especificaciones completadas</p>
          </div>
        </div>
      )}
    </div>
  );
}