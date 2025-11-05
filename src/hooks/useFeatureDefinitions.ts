import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import type { Database } from "@/lib/database.helpers";

type CategoryType = Database['public']['Enums']['category_type'];
type FeatureDataType = Database['public']['Enums']['feature_data_type'];
type FilterType = Database['public']['Enums']['filter_type'];

export interface FeatureDefinition {
  id: string;
  category: CategoryType;
  group_name: string;
  feature_key: string;
  label: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  data_type: FeatureDataType;
  validation_rules: Record<string, any>;
  default_value: any;
  is_filterable: boolean;
  filter_type: FilterType | null;
  filter_location: string | null;
  filter_format: string | null;
  show_in_card_standard: boolean;
  show_in_card_destacado: boolean;
  show_in_card_premium: boolean;
  show_in_landing: boolean;
  requires_login: boolean;
  admin_input_type: string | null;
  admin_helper_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupedFeatures {
  [groupName: string]: FeatureDefinition[];
}

interface UseFeatureDefinitionsReturn {
  features: FeatureDefinition[];
  groupedFeatures: GroupedFeatures;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar feature definitions desde Supabase
 * @param category - Categoría de features a cargar (fabrica, casas, habilitacion_servicios)
 * @param includeInactive - Si incluir features inactivas (default: false)
 */
export function useFeatureDefinitions(
  category: CategoryType | null,
  includeInactive = false
): UseFeatureDefinitionsReturn {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [groupedFeatures, setGroupedFeatures] = useState<GroupedFeatures>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeatures = async () => {
    if (!category) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const supabase = createBrowserSupabaseClient();

      let query = supabase
        .from('feature_definitions')
        .select('*')
        .eq('category', category);

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      query = query.order('display_order', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const featureList = (data || []) as FeatureDefinition[];
      setFeatures(featureList);

      // Agrupar por group_name
      const grouped = featureList.reduce((acc, feature) => {
        const groupName = feature.group_name || 'Sin Grupo';
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(feature);
        return acc;
      }, {} as GroupedFeatures);

      setGroupedFeatures(grouped);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching feature definitions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [category, includeInactive]);

  return {
    features,
    groupedFeatures,
    loading,
    error,
    refetch: fetchFeatures
  };
}

/**
 * Helper para obtener el valor de un feature desde el JSONB
 */
export function getFeatureValue(
  features: Record<string, any> | null,
  groupName: string,
  featureKey: string
): any {
  if (!features) return null;
  return features[groupName]?.[featureKey];
}

/**
 * Helper para determinar si un feature debe mostrarse según tier y login
 */
export function shouldShowFeature(
  feature: FeatureDefinition,
  tier: 'standard' | 'destacado' | 'premium',
  isAuthenticated: boolean
): boolean {
  const tierField = {
    standard: 'show_in_card_standard',
    destacado: 'show_in_card_destacado',
    premium: 'show_in_card_premium'
  }[tier];

  const shouldShow = feature[tierField as keyof FeatureDefinition];

  if (!shouldShow) return false;

  if (feature.requires_login && !isAuthenticated) {
    return false;
  }

  return true;
}
