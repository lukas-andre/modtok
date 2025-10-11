import React from 'react';
import type { FeatureDefinition } from '@/hooks/useFeatureDefinitions';

interface DynamicFeatureInputProps {
  feature: FeatureDefinition;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

/**
 * Componente que renderiza el input correcto según el tipo de dato del feature
 */
export default function DynamicFeatureInput({
  feature,
  value,
  onChange,
  disabled = false
}: DynamicFeatureInputProps) {
  const { data_type, label, admin_helper_text, validation_rules, admin_input_type } = feature;

  // Obtener opciones de validación
  const minValue = validation_rules?.min;
  const maxValue = validation_rules?.max;
  const options = validation_rules?.options as string[] | undefined;
  const pattern = validation_rules?.pattern as string | undefined;

  const baseInputClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";

  // Renderizar según data_type y admin_input_type
  const renderInput = () => {
    // Boolean type
    if (data_type === 'boolean') {
      return (
        <div className="flex items-center space-x-3">
          <input
            id={feature.id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          <label htmlFor={feature.id} className="text-sm text-gray-700">
            {label}
          </label>
        </div>
      );
    }

    // Number type
    if (data_type === 'number') {
      return (
        <div>
          <label htmlFor={feature.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {validation_rules?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={feature.id}
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            min={minValue}
            max={maxValue}
            disabled={disabled}
            className={baseInputClasses}
            placeholder={admin_helper_text || `Ingrese ${label.toLowerCase()}`}
          />
        </div>
      );
    }

    // Text Array type (para tags, keywords, etc.)
    if (data_type === 'text_array') {
      const arrayValue = Array.isArray(value) ? value : [];

      return (
        <div>
          <label htmlFor={feature.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {validation_rules?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={feature.id}
            type="text"
            value={arrayValue.join(', ')}
            onChange={(e) => {
              const newArray = e.target.value
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);
              onChange(newArray);
            }}
            disabled={disabled}
            className={baseInputClasses}
            placeholder={admin_helper_text || "Ingrese valores separados por comas"}
          />
          {admin_helper_text && (
            <p className="mt-1 text-xs text-gray-500">{admin_helper_text}</p>
          )}
        </div>
      );
    }

    // JSON type (textarea for complex data)
    if (data_type === 'json') {
      return (
        <div>
          <label htmlFor={feature.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {validation_rules?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            id={feature.id}
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
            rows={4}
            className={baseInputClasses}
            placeholder={admin_helper_text || '{}'}
          />
        </div>
      );
    }

    // Text type con variantes según admin_input_type
    if (data_type === 'text') {
      // Textarea for long text
      if (admin_input_type === 'textarea') {
        return (
          <div>
            <label htmlFor={feature.id} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
              {validation_rules?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={feature.id}
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              rows={3}
              className={baseInputClasses}
              placeholder={admin_helper_text || `Ingrese ${label.toLowerCase()}`}
            />
          </div>
        );
      }

      // Select dropdown
      if (admin_input_type === 'select' && options && options.length > 0) {
        return (
          <div>
            <label htmlFor={feature.id} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
              {validation_rules?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={feature.id}
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={baseInputClasses}
            >
              <option value="">Seleccione una opción</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      }

      // Radio buttons
      if (admin_input_type === 'radio' && options && options.length > 0) {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {validation_rules?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    id={`${feature.id}-${option}`}
                    type="radio"
                    value={option}
                    checked={value === option}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor={`${feature.id}-${option}`}
                    className="ml-3 block text-sm text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Default: text input
      return (
        <div>
          <label htmlFor={feature.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {validation_rules?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={feature.id}
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            pattern={pattern}
            disabled={disabled}
            className={baseInputClasses}
            placeholder={admin_helper_text || `Ingrese ${label.toLowerCase()}`}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-1">
      {renderInput()}
      {admin_helper_text && data_type !== 'text_array' && data_type !== 'boolean' && (
        <p className="text-xs text-gray-500">{admin_helper_text}</p>
      )}
      {feature.description && (
        <p className="text-xs text-gray-400 italic">{feature.description}</p>
      )}
    </div>
  );
}
