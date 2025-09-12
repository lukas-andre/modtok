import { useState, useEffect } from 'react';

interface VerificationDocument {
  id: string;
  type: 'rut' | 'certificado' | 'licencia' | 'seguro' | 'otros';
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  notes?: string;
}

interface ProviderVerificationSystemProps {
  providerId: string;
  companyName: string;
  currentStatus: 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected';
  onStatusChange?: (status: string) => void;
}

export default function ProviderVerificationSystem({
  providerId,
  companyName,
  currentStatus,
  onStatusChange
}: ProviderVerificationSystemProps) {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [checklist, setChecklist] = useState([
    { id: 'basic_info', label: 'Información básica completa', completed: false, required: true },
    { id: 'contact_verified', label: 'Datos de contacto verificados', completed: false, required: true },
    { id: 'rut_document', label: 'Documento RUT/Cédula jurídica', completed: false, required: true },
    { id: 'address_confirmed', label: 'Dirección confirmada', completed: false, required: true },
    { id: 'business_license', label: 'Licencia comercial', completed: false, required: false },
    { id: 'insurance_cert', label: 'Certificado de seguro', completed: false, required: false },
    { id: 'portfolio_review', label: 'Revisión de portafolio', completed: false, required: true },
    { id: 'references_check', label: 'Verificación de referencias', completed: false, required: false }
  ]);

  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notes, setNotes] = useState('');

  const documentTypes = [
    { value: 'rut', label: 'RUT / Cédula Jurídica' },
    { value: 'certificado', label: 'Certificado Profesional' },
    { value: 'licencia', label: 'Licencia Comercial' },
    { value: 'seguro', label: 'Certificado de Seguro' },
    { value: 'otros', label: 'Otros Documentos' }
  ];

  const commonRejectionReasons = [
    'Información incompleta o incorrecta',
    'Documentación insuficiente',
    'No cumple con los requisitos mínimos',
    'Datos de contacto no verificables',
    'Actividad comercial no relacionada',
    'Referencias insatisfactorias',
    'Problemas con la documentación legal'
  ];

  const ComingSoonSection = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 relative">
      <div className="absolute top-3 right-3">
        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
          PRÓXIMAMENTE
        </span>
      </div>
      <div className="flex items-start space-x-4">
        <div className="text-blue-600 mt-1">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-sm font-medium"
          >
            Disponible Pronto
          </button>
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const labels = {
      draft: 'Borrador',
      pending_review: 'Pendiente de Revisión',
      active: 'Verificado',
      inactive: 'Inactivo',
      rejected: 'Rechazado'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${variants[status as keyof typeof variants]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleApprove = async () => {
    if (confirm(`¿Confirmas que deseas aprobar a ${companyName}?`)) {
      // TODO: API call to approve provider
      alert('Funcionalidad de aprobación será implementada próximamente');
    }
  };

  const handleReject = async () => {
    if (rejectionReasons.length === 0) {
      alert('Selecciona al menos un motivo de rechazo');
      return;
    }
    
    // TODO: API call to reject provider with reasons
    alert('Funcionalidad de rechazo será implementada próximamente');
    setShowRejectModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sistema de Verificación</h3>
          <p className="text-gray-600">Estado actual: {getStatusBadge(currentStatus)}</p>
        </div>
        
        {currentStatus === 'pending_review' && (
          <div className="flex space-x-3">
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              ✅ Aprobar
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              ❌ Rechazar
            </button>
          </div>
        )}
      </div>

      {/* Document Upload - Coming Soon */}
      <ComingSoonSection
        title="Carga de Documentos"
        description="Los proveedores podrán subir y gestionar todos sus documentos de verificación desde su panel de control. Sistema automático de validación y notificaciones."
        icon={
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      {/* Verification Checklist */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Lista de Verificación</h4>
        
        <div className="space-y-4">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) => {
                  setChecklist(prev => prev.map(check => 
                    check.id === item.id ? { ...check, completed: e.target.checked } : check
                  ));
                }}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
              />
              <div className="flex-1">
                <label className={`text-sm font-medium ${item.completed ? 'text-green-700' : 'text-gray-700'}`}>
                  {item.label}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
              <div>
                {item.completed ? (
                  <span className="text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-gray-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progreso de verificación:</span>
            <span className="font-medium text-gray-900">
              {checklist.filter(item => item.completed).length} / {checklist.length} completados
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(checklist.filter(item => item.completed).length / checklist.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Email Notifications - Coming Soon */}
      <ComingSoonSection
        title="Notificaciones por Email"
        description="Sistema automático de notificaciones que mantendrá informados a los proveedores sobre el estado de su proceso de verificación en tiempo real."
        icon={
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />

      {/* Approval Workflow - Coming Soon */}
      <ComingSoonSection
        title="Flujo de Aprobación Avanzado"
        description="Sistema de múltiples niveles de aprobación con asignación automática de revisores, tiempos límite y escalación automática para casos complejos."
        icon={
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Notes Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Notas de Verificación</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Agrega notas internas sobre el proceso de verificación..."
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => alert('Notas guardadas (funcionalidad próximamente)')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Guardar Notas
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rechazar Proveedor: {companyName}
            </h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 mb-3">Selecciona los motivos de rechazo:</p>
              {commonRejectionReasons.map((reason, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rejectionReasons.includes(reason)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRejectionReasons(prev => [...prev, reason]);
                      } else {
                        setRejectionReasons(prev => prev.filter(r => r !== reason));
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 shadow-sm focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios adicionales:
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Agrega comentarios específicos..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}