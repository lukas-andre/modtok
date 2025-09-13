import React, { useState, useCallback } from 'react';
import {
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

interface ImportMapping {
  csvColumn: string;
  dbField: string;
  transform?: 'lowercase' | 'uppercase' | 'number' | 'boolean' | 'json' | 'array';
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{ row: number; error: string }>;
}

interface BulkImportProps {
  entityType: 'houses' | 'services' | 'decorations' | 'providers';
  onImport: (data: any[]) => Promise<ImportResult>;
  availableFields: Array<{ key: string; label: string; required: boolean }>;
  sampleCsvUrl?: string;
}

export default function BulkImport({
  entityType,
  onImport,
  availableFields,
  sampleCsvUrl
}: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ImportMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview' | 'result'>('upload');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const parseCSV = (text: string): { headers: string[]; data: any[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = { _rowNumber: index + 2 }; // Add row number for error reporting
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return row;
    });
    
    return { headers, data };
  };

  const parseExcel = async (file: File): Promise<{ headers: string[]; data: any[] }> => {
    // For a real implementation, you would use a library like xlsx or sheetjs
    // This is a placeholder that assumes CSV for now
    const text = await file.text();
    return parseCSV(text);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setIsProcessing(true);
    setValidationErrors([]);
    
    try {
      let parsedData;
      
      if (selectedFile.name.endsWith('.csv')) {
        const text = await selectedFile.text();
        parsedData = parseCSV(text);
      } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        parsedData = await parseExcel(selectedFile);
      } else {
        throw new Error('Formato de archivo no soportado. Use CSV o Excel.');
      }
      
      setCsvHeaders(parsedData.headers);
      setCsvData(parsedData.data);
      
      // Auto-map columns based on header names
      const autoMappings: ImportMapping[] = parsedData.headers
        .map(header => {
          const headerLower = header.toLowerCase().replace(/\s+/g, '_');
          const matchingField = availableFields.find(field => 
            field.key.toLowerCase() === headerLower ||
            field.label.toLowerCase() === header.toLowerCase()
          );
          
          if (matchingField) {
            return {
              csvColumn: header,
              dbField: matchingField.key
            };
          }
          return null;
        })
        .filter(Boolean) as ImportMapping[];
      
      setMappings(autoMappings);
      setCurrentStep('mapping');
    } catch (error: any) {
      setValidationErrors([error.message]);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateMapping = (csvColumn: string, dbField: string, transform?: string) => {
    setMappings(prev => {
      const existing = prev.find(m => m.csvColumn === csvColumn);
      if (existing) {
        return prev.map(m => 
          m.csvColumn === csvColumn 
            ? { ...m, dbField, transform: transform as ImportMapping['transform'] }
            : m
        );
      } else {
        return [...prev, { csvColumn, dbField, transform: transform as ImportMapping['transform'] }];
      }
    });
  };

  const removeMapping = (csvColumn: string) => {
    setMappings(prev => prev.filter(m => m.csvColumn !== csvColumn));
  };

  const validateMappings = (): string[] => {
    const errors: string[] = [];
    const requiredFields = availableFields.filter(f => f.required);
    const mappedFields = new Set(mappings.map(m => m.dbField));
    
    requiredFields.forEach(field => {
      if (!mappedFields.has(field.key)) {
        errors.push(`Campo requerido no mapeado: ${field.label}`);
      }
    });
    
    // Check for duplicate mappings
    const dbFieldCounts: { [key: string]: number } = {};
    mappings.forEach(m => {
      dbFieldCounts[m.dbField] = (dbFieldCounts[m.dbField] || 0) + 1;
    });
    
    Object.entries(dbFieldCounts).forEach(([field, count]) => {
      if (count > 1) {
        errors.push(`Campo duplicado: ${field} está mapeado ${count} veces`);
      }
    });
    
    return errors;
  };

  const transformValue = (value: any, transform?: ImportMapping['transform']): any => {
    if (!transform) return value;
    
    switch (transform) {
      case 'lowercase':
        return String(value).toLowerCase();
      case 'uppercase':
        return String(value).toUpperCase();
      case 'number':
        return parseFloat(value) || 0;
      case 'boolean':
        return ['true', '1', 'sí', 'si', 'yes'].includes(String(value).toLowerCase());
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      case 'array':
        return String(value).split(',').map(v => v.trim()).filter(Boolean);
      default:
        return value;
    }
  };

  const processData = (): any[] => {
    return csvData.map(row => {
      const processedRow: any = {};
      
      mappings.forEach(mapping => {
        const value = row[mapping.csvColumn];
        processedRow[mapping.dbField] = transformValue(value, mapping.transform);
      });
      
      // Add metadata
      processedRow._originalRowNumber = row._rowNumber;
      
      return processedRow;
    });
  };

  const handlePreview = () => {
    const errors = validateMappings();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    setCurrentStep('preview');
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setImportResult(null);
    
    try {
      const processedData = processData();
      const result = await onImport(processedData);
      setImportResult(result);
      setCurrentStep('result');
    } catch (error: any) {
      setImportResult({
        success: false,
        totalRows: csvData.length,
        successfulRows: 0,
        failedRows: csvData.length,
        errors: [{ row: 0, error: error.message }]
      });
      setCurrentStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = availableFields.map(f => f.label).join(',');
    const sampleRow = availableFields.map(f => {
      if (f.key === 'name') return 'Producto Ejemplo';
      if (f.key === 'price') return '100000';
      if (f.key === 'description') return 'Descripción del producto';
      return '';
    }).join(',');
    
    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_${entityType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setMappings([]);
    setImportResult(null);
    setCurrentStep('upload');
    setValidationErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Steps Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {['upload', 'mapping', 'preview', 'result'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full
              ${currentStep === step ? 'bg-blue-600 text-white' : 
                ['upload', 'mapping', 'preview', 'result'].indexOf(currentStep) > index 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-300 text-gray-600'}
            `}>
              {['upload', 'mapping', 'preview', 'result'].indexOf(currentStep) > index ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < 3 && (
              <div className={`w-20 h-1 ${
                ['upload', 'mapping', 'preview', 'result'].indexOf(currentStep) > index 
                  ? 'bg-green-600' 
                  : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-center space-x-16 text-sm">
        <span className={currentStep === 'upload' ? 'font-semibold' : ''}>Cargar</span>
        <span className={currentStep === 'mapping' ? 'font-semibold' : ''}>Mapear</span>
        <span className={currentStep === 'preview' ? 'font-semibold' : ''}>Previsualizar</span>
        <span className={currentStep === 'result' ? 'font-semibold' : ''}>Resultado</span>
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
            <div className="text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Cargar archivo CSV o Excel
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Seleccione un archivo con los datos a importar
              </p>
              <div className="mt-6">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Seleccionar Archivo
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
              
              <div className="mt-4 flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                  Descargar Plantilla
                </button>
                {sampleCsvUrl && (
                  <a
                    href={sampleCsvUrl}
                    download
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    <TableCellsIcon className="h-5 w-5 mr-1" />
                    Ver Ejemplo
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {file && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Archivo cargado: {file.name}
                  </p>
                  <p className="text-sm text-green-700">
                    {csvData.length} filas encontradas
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 'mapping' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Mapear Columnas CSV a Campos de Base de Datos
            </h3>
            
            <div className="space-y-3">
              {csvHeaders.map(header => {
                const mapping = mappings.find(m => m.csvColumn === header);
                return (
                  <div key={header} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {header}
                      </label>
                      <div className="text-xs text-gray-500">
                        Ejemplo: {csvData[0]?.[header] || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <select
                        value={mapping?.dbField || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            updateMapping(header, e.target.value);
                          } else {
                            removeMapping(header);
                          }
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">No mapear</option>
                        {availableFields.map(field => (
                          <option key={field.key} value={field.key}>
                            {field.label} {field.required && '*'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-32">
                      <select
                        value={mapping?.transform || ''}
                        onChange={(e) => updateMapping(header, mapping?.dbField || '', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={!mapping}
                      >
                        <option value="">Sin transformar</option>
                        <option value="lowercase">Minúsculas</option>
                        <option value="uppercase">Mayúsculas</option>
                        <option value="number">Número</option>
                        <option value="boolean">Booleano</option>
                        <option value="json">JSON</option>
                        <option value="array">Array</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {validationErrors.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Errores de validación
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
                      {validationErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep('upload')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Previsualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'preview' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Vista Previa de Datos a Importar
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    {mappings.map(mapping => (
                      <th key={mapping.dbField} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {availableFields.find(f => f.key === mapping.dbField)?.label || mapping.dbField}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processData().slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {row._originalRowNumber}
                      </td>
                      {mappings.map(mapping => (
                        <td key={mapping.dbField} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {String(row[mapping.dbField])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              Mostrando 5 de {csvData.length} filas
            </p>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep('mapping')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? 'Importando...' : `Importar ${csvData.length} Registros`}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'result' && importResult && (
        <div className="space-y-4">
          <div className={`rounded-lg border p-6 ${
            importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex">
              {importResult.success ? (
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
              ) : (
                <XCircleIcon className="h-8 w-8 text-red-400" />
              )}
              <div className="ml-3 flex-1">
                <h3 className={`text-lg font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.success ? 'Importación Exitosa' : 'Importación con Errores'}
                </h3>
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-white rounded p-3">
                    <p className="text-sm text-gray-500">Total de Filas</p>
                    <p className="text-2xl font-semibold">{importResult.totalRows}</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm text-gray-500">Exitosas</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {importResult.successfulRows}
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm text-gray-500">Fallidas</p>
                    <p className="text-2xl font-semibold text-red-600">
                      {importResult.failedRows}
                    </p>
                  </div>
                </div>
                
                {importResult.errors.length > 0 && (
                  <div className="mt-4 bg-white rounded p-3 max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Errores Encontrados:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {importResult.errors.slice(0, 10).map((error, i) => (
                        <li key={i}>
                          Fila {error.row}: {error.error}
                        </li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li className="font-medium">
                          ... y {importResult.errors.length - 10} errores más
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Nueva Importación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}