import React, { useState, useEffect } from 'react';
import { Card } from '@monorepo/ui-system';
import { Button } from '@monorepo/ui-system';
import { Save, Building, CreditCard, Shield, Bell, Loader2 } from 'lucide-react';
import { ClinicSettings } from '../../lib/types';

import { useSettingsController } from '../../hooks/controllers/useSettingsController';
import { useToast } from '../../context/ToastContext';

export const SettingsView: React.FC = () => {
  // TITANIUM CONTROLLER
  const { settings, isLoading, isUpdating, updateSettings } = useSettingsController();
  const { success: toastSuccess, error: toastError } = useToast();

  // Local form state initialized from fetched settings
  const [formData, setFormData] = useState<Partial<ClinicSettings>>({});

  // Sync form when settings load
  useEffect(() => {
    if (settings && !formData) {
      // Only set if formData is empty

      setFormData(settings);
    }
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      toastSuccess('Configuración guardada correctamente');
    } catch (err) {
      console.error('Failed to save', err);
      toastError('Error al guardar configuración.');
    }
  };

  if (isLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Configuración Clínica
          </h1>
          <p className="text-slate-500 mt-1">
            Datos de facturación y perfil profesional (Titanium Powered)
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Info */}
          <Card className="p-8 space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building size={20} className="text-pink-600" /> Información General
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="label-pro">Nombre de la Clínica / Profesional</label>
                <input
                  required
                  className="input-pro"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Centro Activa SL"
                />
              </div>
              <div className="space-y-2">
                <label className="label-pro">Dirección Fiscal</label>
                <textarea
                  className="input-pro min-h-[80px]"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle, Ciudad, Código Postal..."
                />
              </div>
              <div className="space-y-2">
                <label className="label-pro">Teléfono de Contacto</label>
                <input
                  className="input-pro"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
                Gestión de Datos
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Descarga una copia completa de tu base de datos en formato Excel/CSV.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  if (
                    !confirm(
                      '¿Descargar copia de seguridad de todos los pacientes? Esto puede tardar unos segundos.',
                    )
                  )
                    return;

                  try {
                    // TITANIUM REAL EXPORT
                    const { PatientRepository } =
                      await import('../../data/repositories/PatientRepository');
                    const realPatients = await PatientRepository.getAll();

                    if (realPatients.length === 0) {
                      alert('No hay pacientes para exportar.');
                      return;
                    }

                    // Generate Header
                    const headers = [
                      'ID',
                      'Nombre',
                      'Edad',
                      'Diagnostico',
                      'Telefono',
                      'Email',
                      'Fecha_Alta',
                    ];
                    const csvRows = [headers.join(',')];

                    // Generate Rows
                    for (const p of realPatients) {
                      const row = [
                        p.id,
                        `"${p.name}"`, // Quote to handle commas in names
                        p.age,
                        `"${p.diagnosis}"`,
                        p.contact || '',
                        p.email || '',
                        p.joinedDate,
                      ];
                      csvRows.push(row.join(','));
                    }

                    const csvString = csvRows.join('\n');
                    const bom = '\uFEFF';
                    const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute(
                      'download',
                      `BACKUP_PACIENTES_${new Date().toISOString().slice(0, 10)}.csv`,
                    );
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (err) {
                    console.error('Export Failed', err);
                    toastError('Error al generar el backup. Inténtelo de nuevo.');
                  }
                }}
                icon={Save}
              >
                Exportar Base de Datos (CSV REAL)
              </Button>
            </div>
          </Card>

          {/* Legal & Invoice Data (Billing Object) */}
          <div className="space-y-6">
            <Card className="p-8 space-y-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                <CreditCard size={20} className="text-indigo-600" /> Datos de Facturación (PDF)
              </h3>

              {/* Logo Uploader */}
              <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                {formData.billing?.logoUrl ? (
                  <div className="relative group">
                    <img
                      src={formData.billing.logoUrl}
                      alt="Logo Factura"
                      className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          billing: { ...formData.billing!, logoUrl: '' },
                        })
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Shield size={12} className="rotate-45" /> {/* X icon replacement */}
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Building size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Logo de la Empresa</p>
                    <p className="text-xs text-slate-400">
                      Circular en el PDF (Máx 10MB - Auto-ajuste)
                    </p>
                    <label className="cursor-pointer">
                      <span className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                        Subir Logo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              // 10MB Limit
                              toastError('El archivo es demasiado pesado (Máx 10MB).');
                              return;
                            }

                            // Compression Logic
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 500;
                                const MAX_HEIGHT = 500;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(img, 0, 0, width, height);

                                // Compress to JPEG 0.7 to save space
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                                setFormData({
                                  ...formData,
                                  billing: {
                                    ...formData.billing,
                                    logoUrl: dataUrl,
                                    legalName: formData.billing?.legalName || '',
                                    nif: formData.billing?.nif || '',
                                    address: formData.billing?.address || '',
                                  },
                                });
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="label-pro">Razón Social (Nombre Legal)</label>
                  <input
                    className="input-pro"
                    value={formData.billing?.legalName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing: {
                          ...formData.billing,
                          legalName: e.target.value,
                          nif: formData.billing?.nif || '',
                          address: formData.billing?.address || '',
                          logoUrl: formData.billing?.logoUrl || '',
                        },
                      })
                    }
                    placeholder="Ej: Juan Pérez S.L."
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-pro">CIF / NIF</label>
                  <input
                    className="input-pro font-mono"
                    value={formData.billing?.nif || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing: {
                          ...formData.billing,
                          nif: e.target.value,
                          legalName: formData.billing?.legalName || '',
                          address: formData.billing?.address || '',
                          logoUrl: formData.billing?.logoUrl || '',
                        },
                      })
                    }
                    placeholder="B-12345678"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-pro">Dirección de Facturación</label>
                  <textarea
                    className="input-pro min-h-[60px]"
                    value={formData.billing?.address || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing: {
                          ...formData.billing,
                          address: e.target.value,
                          legalName: formData.billing?.legalName || '',
                          nif: formData.billing?.nif || '',
                          logoUrl: formData.billing?.logoUrl || '',
                        },
                      })
                    }
                    placeholder="Dirección completa para la factura..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateSettings(formData);
                      toastSuccess('Datos de Facturación y Logo guardados correctamente.');
                    } catch {
                      toastError('Error al guardar.');
                    }
                  }}
                  isLoading={isUpdating}
                  icon={Save}
                  variant="secondary"
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Guardar Configuración Fiscal
                </Button>
              </div>
            </Card>

            <Card className="p-8 space-y-4 bg-slate-50 border-slate-200">
              <div className="space-y-2">
                <label className="label-pro">Texto Legal (Pie de Factura)</label>
                <textarea
                  className="input-pro text-xs text-slate-500 min-h-[100px]"
                  value={formData.legalText || ''}
                  onChange={(e) => setFormData({ ...formData, legalText: e.target.value })}
                  placeholder="Términos y condiciones legales..."
                />
              </div>
            </Card>
          </div>

          {/* Notificaciones (Feature 15) */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-pink-500" /> Notificaciones
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">Notificaciones Push</h4>
                    <p className="text-xs text-slate-500">Avisos al móvil/escritorio</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            className="w-full md:w-auto px-8"
            icon={Save}
            isLoading={isUpdating}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>

      {/* DANGER ZONE (GDPR - Delete Account) */}
      <Card className="p-8 border-red-200 bg-red-50 mt-8">
        <h3 className="font-bold text-red-700 flex items-center gap-2 mb-4">
          <Shield size={20} /> Zona de Peligro
        </h3>
        <p className="text-sm text-red-600 mb-6">
          Estas acciones son destructivas y no se pueden deshacer.
        </p>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-red-800 text-sm">Eliminar Cuenta</h4>
            <p className="text-xs text-red-600">Borrar todos mis datos y salir</p>
          </div>
          <Button
            variant="secondary"
            className="border-red-200 text-red-700 hover:bg-red-100"
            onClick={() => {
              if (
                window.confirm(
                  '¿ESTÁS SEGURO? Esto borrará tu cuenta y todos tus pacientes permanentemente.',
                )
              ) {
                // In a real implementation this would call deleteUser(user)
                alert(
                  'Por seguridad, contacta a soporte@activa-sl.digital para confirmar la baja definitiva GDPR.',
                );
              }
            }}
          >
            Eliminar Cuenta
          </Button>
        </div>
      </Card>

      {/* LEGAL FOOTER */}
      <div className="text-center text-xs text-slate-400 py-8 flex justify-center gap-6">
        <a
          href="https://activa-sl-corporate.web.app/legal/terms"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-600 transition-colors"
        >
          Términos de Servicio
        </a>
        <a
          href="https://activa-sl-corporate.web.app/legal/privacy"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-600 transition-colors"
        >
          Política de Privacidad
        </a>
        <span>© 2026 Activa S.L.</span>
      </div>
    </div>
  );
};
