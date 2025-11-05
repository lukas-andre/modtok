import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useFeatureDefinitions, type FeatureDefinition } from '@/hooks/useFeatureDefinitions';
import DynamicFeatureInput from './DynamicFeatureInput';
import type { Database } from "@/lib/database.helpers";

type CategoryType = Database['public']['Enums']['category_type'];

interface FeatureFormBuilderProps {
  category: CategoryType;
  currentFeatures: Record<string, any>;
  onChange: (features: Record<string, any>) => void;
  disabled?: boolean;
}

/**
 * Form Builder Dinámico que renderiza inputs basado en feature_definitions
 * Organiza los campos por grupos y permite colapsarlos
 */
export default function FeatureFormBuilder({
  category,
  currentFeatures = {},
  onChange,
  disabled = false
}: FeatureFormBuilderProps) {
  const { groupedFeatures, loading, error } = useFeatureDefinitions(category, false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(Object.keys(groupedFeatures)));

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleFeatureChange = (groupName: string, featureKey: string, value: any) => {
    const newFeatures = { ...currentFeatures };

    if (!newFeatures[groupName]) {
      newFeatures[groupName] = {};
    }

    newFeatures[groupName][featureKey] = value;
    onChange(newFeatures);
  };

  const getFeatureValue = (groupName: string, featureKey: string): any => {
    return currentFeatures[groupName]?.[featureKey] ?? null;
  };

  // Calcular estadísticas
  const totalFeatures = Object.values(groupedFeatures).reduce((acc, features) => acc + features.length, 0);
  const completedFeatures = Object.entries(groupedFeatures).reduce((acc, [groupName, features]) => {
    return acc + features.filter(f => {
      const value = getFeatureValue(groupName, f.feature_key);
      return value !== null && value !== '' && value !== undefined;
    }).length;
  }, 0);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-4">Cargando features...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-900 font-medium">Error al cargar features</h3>
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (Object.keys(groupedFeatures).length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-yellow-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-yellow-900 font-medium mb-1">No hay features configuradas</h3>
        <p className="text-yellow-700 text-sm">
          No se encontraron definiciones de features para la categoría <strong>{category}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-blue-900 font-medium">Features Dinámicas</h3>
            <p className="text-blue-700 text-sm">
              Campos configurables según categoría: <strong>{category}</strong>
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">{completedFeatures}/{totalFeatures}</div>
            <div className="text-xs text-blue-700">Completados</div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-3">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grupos de Features */}
      <div className="space-y-3">
        {Object.entries(groupedFeatures).map(([groupName, features]) => {
          const isExpanded = expandedGroups.has(groupName);
          const groupCompleted = features.filter(f => {
            const value = getFeatureValue(groupName, f.feature_key);
            return value !== null && value !== '' && value !== undefined;
          }).length;

          return (
            <div key={groupName} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(groupName)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {groupName}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({groupCompleted}/{features.length})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${(groupCompleted / features.length) * 100}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Group Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-white">
                  {features.map((feature) => (
                    <DynamicFeatureInput
                      key={feature.id}
                      feature={feature}
                      value={getFeatureValue(groupName, feature.feature_key)}
                      onChange={(value) => handleFeatureChange(groupName, feature.feature_key, value)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Sobre las Features Dinámicas</p>
            <p>
              Estos campos se configuran automáticamente según la categoría del proveedor.
              Los valores se almacenan en formato JSONB y se usan para filtros, cards y landings premium.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
