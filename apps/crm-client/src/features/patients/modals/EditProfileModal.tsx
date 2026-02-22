import React, { useState, useRef } from 'react';
import { X, UserCheck, Hash, Users, Music, Printer, Save, Calendar } from 'lucide-react';
import { Button } from '@monorepo/ui-system';
import { COMMON_PATHOLOGIES } from '../../../lib/patientUtils';
import { compressImage } from '../../../lib/utils';
import { useImageUpload } from '../../../hooks/useImageUpload'; // TITANIUM HOOK
import { Patient } from '../../../lib/types';

interface EditProfileModalProps {
  onClose: () => void;
  onSave: (data: Partial<Patient>) => void;
  initialData?: Partial<Patient>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  onClose,
  onSave,
  initialData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo || '');
  const [diagnosisType, setDiagnosisType] = useState(initialData?.pathologyType || '');
  const [pathologyType, setPathologyType] = useState(initialData?.pathologyType || '');
  const [date, setDate] = useState(
    initialData?.joinedDate
      ? new Date(initialData.joinedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  );
  const [hasConsent, setHasConsent] = useState(initialData?.hasConsent || false);
  const [reference] = useState(initialData?.reference || '');
  const [age, setAge] = useState<string | number>(initialData?.age || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');

  // TITANIUM UPLOAD HOOK
  const { uploadImage } = useImageUpload();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && initialData?.id) {
      // Solo si hay ID (paciente ya creado o en edición)
      try {
        // 1. Upload to Storage
        const path = `patients/${initialData.id}/profile-${Date.now()}.jpg`;
        const url = await uploadImage(f, path);
        if (url) {
          setPhotoPreview(url);
        }
      } catch (_err) {
        // Upload hook tracks error state for consumer
      }
    } else if (f) {
      const compressed = await compressImage(f);
      setPhotoPreview(compressed);
    }
  };

  const handleDiagnosisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDiagnosisType(val);
    setPathologyType(val);
  };

  const handlePrintConsent = () => {
    // Print consent form for patient
    window.print();
  };

  return (
    // TITANIUM MOBILE LAYOUT FIX: Full Screen on Mobile, Modal on Desktop
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="bg-white w-full md:w-full md:max-w-3xl h-[100dvh] md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-3d overflow-hidden flex flex-col pointer-events-auto transform transition-transform duration-300 animate-in slide-in-from-bottom-full md:zoom-in-95">
        {/* Header */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20 shrink-0 safe-pt shadow-sm md:shadow-none min-h-[60px]">
          {/* Mobile Cancel - Left */}
          <button
            type="button"
            onClick={onClose}
            className="flex md:hidden text-slate-500 font-medium text-sm p-2 -ml-2 active:opacity-70"
          >
            Cancelar
          </button>

          <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            {initialData ? 'Editar Perfil' : 'Nueva Admisión'}
          </h2>

          {/* Desktop Close - Right */}
          <button
            type="button"
            onClick={onClose}
            className="hidden md:block p-2 -mr-2 text-slate-400 hover:text-slate-600 active:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          {/* Mobile Save - Right */}
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            className="flex md:hidden bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md active:scale-95 transition-transform items-center gap-1.5"
          >
            <Save size={14} className="text-white/90" />
            Guardar
          </button>
        </div>

        {/* Scrollable Content - Added pb-32 for Mobile Safety and safe-pb */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain pb-32 md:pb-6">
          {/* FORMULARIO CON REFERENCIA (ref={formRef}) */}
          <form
            ref={formRef}
            id="formAd"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              interface EditFormData extends Partial<Patient> {
                diagnosisSelect?: string;
                customDiagnosis?: string;
                birthDate?: string;
              }
              const d = Object.fromEntries(formData) as unknown as EditFormData;

              // TITANIUM STRICT VALIDATION
              if (!d.name?.trim()) {
                alert('El Nombre Completo es obligatorio.');
                return;
              }
              if (!d.age || Number(d.age) < 0) {
                alert('La Edad debe ser un número válido mayor o igual a 0.');
                return;
              }
              if (!diagnosisType) {
                alert('Seleccione una patología o motivo.');
                return;
              }

              d.age = Number(d.age);
              d.reference = reference;
              d.hasConsent = hasConsent;

              if (photoPreview) d.photo = photoPreview;

              const selectedOption = COMMON_PATHOLOGIES.find((p) => p.value === diagnosisType);

              if (diagnosisType === 'other' || !diagnosisType) {
                d.diagnosis = d.customDiagnosis || 'Sin especificar';
                d.pathologyType = 'other';
              } else if (selectedOption) {
                d.diagnosis = selectedOption.label;
                d.pathologyType = selectedOption.value;
              } else {
                d.diagnosis = diagnosisType;
                d.pathologyType = pathologyType;
              }

              delete d.diagnosisSelect;
              delete d.customDiagnosis;
              onSave(d);
            }}
          >
            <div className="space-y-8">
              {/* --- SECTION 1: IDENTITY HEADER (Photo + Name) --- */}
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* 1. PHOTO (Left) */}
                <div className="shrink-0 relative group">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center cursor-pointer overflow-hidden hover:scale-105 transition-transform group-hover:shadow-xl"
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users size={48} className="text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white font-bold text-xs bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                        Cambiar
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>

                {/* 2. NAME & REFERENCE (Right) */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Nombre Completo del Paciente
                    </label>
                    <div className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 font-bold tracking-tight">
                      REF: {reference || 'AUTO'}
                    </div>
                  </div>
                  <input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-3xl md:text-4xl font-black text-slate-800 border-b-2 border-slate-100 focus:border-indigo-500 bg-transparent py-2 placeholder-slate-200 focus:outline-none transition-colors"
                    required
                    autoCapitalize="words"
                    placeholder="Ej. Juan Pérez"
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <UserCheck size={12} />
                    <span>Asegúrate de escribir los dos apellidos si es posible.</span>
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: THE DATA TRINITY (Dates & Age) --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. FECHA DE NACIMIENTO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-rose-400"></div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} className="text-pink-500" /> Nacimiento
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    className="text-lg font-bold text-slate-700 border-none bg-transparent p-0 focus:ring-0 cursor-pointer w-full text-left outline-none"
                    max={new Date().toISOString().split('T')[0]}
                    value={birthDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBirthDate(val);
                      if (val) {
                        const d = new Date(val);
                        const today = new Date();
                        let ag = today.getFullYear() - d.getFullYear();
                        const m = today.getMonth() - d.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) ag--;
                        setAge(ag);
                      }
                    }}
                  />
                </div>

                {/* 2. EDAD (Calculation) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-violet-400"></div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash size={12} className="text-indigo-500" /> Edad Actual
                  </label>
                  <div className="flex items-baseline gap-1">
                    <input
                      name="age"
                      type="number"
                      value={age}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAge(val);
                        if (val) {
                          const ageNum = parseInt(val);
                          const currentYear = new Date().getFullYear();
                          const y = currentYear - ageNum;
                          const newDate = `${y}-01-01`;
                          setBirthDate(newDate);
                        }
                      }}
                      className="text-3xl font-black text-slate-800 border-none bg-transparent p-0 w-full focus:ring-0 outline-none placeholder-slate-200"
                      placeholder="00"
                    />
                    <span className="text-sm font-bold text-slate-400">años</span>
                  </div>
                </div>

                {/* 3. FECHA DE INGRESO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} className="text-emerald-500" /> Fecha de Ingreso
                  </label>
                  <input
                    name="joinedDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-lg font-bold text-slate-700 border-none bg-transparent p-0 focus:ring-0 cursor-pointer w-full text-left outline-none"
                  />
                </div>
              </div>

              {/* --- SECTION 3: CLINICAL DIAGNOSIS --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                <div>
                  <label className="label-pro">Patología / Motivo</label>
                  <select
                    name="diagnosisSelect"
                    className="input-pro text-lg p-3"
                    onChange={handleDiagnosisChange}
                    value={diagnosisType}
                    required
                  >
                    {COMMON_PATHOLOGIES.map((p, i) => (
                      <option
                        key={i}
                        value={p.value}
                        disabled={p.disabled}
                        className={p.disabled ? 'font-bold bg-slate-100 text-slate-500' : ''}
                      >
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(diagnosisType === 'other' || pathologyType === 'other') && (
                  <div className="w-full">
                    <label className="label-pro">Especificar</label>
                    <input
                      name="customDiagnosis"
                      defaultValue={initialData?.diagnosis}
                      className="input-pro animate-in fade-in slide-in-from-top-1"
                      placeholder="Especifique la patología o motivo..."
                      required
                    />
                  </div>
                )}
                {/* Hidden Reference Input if needed for state, or we just rely on display */}
                <input type="hidden" name="reference" value={reference} />
              </div>
            </div>

            <div className="space-y-6 border-t border-slate-100 pt-8 mt-8">
              {/* SECCIÓN 1: CUIDADOR Y CONTACTO DESGLOSADO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-pro">Nombre Cuidador / Relación</label>
                  <input
                    name="caregiverName"
                    defaultValue={initialData?.caregiverName}
                    className="input-pro text-lg p-3"
                    placeholder="Ej: María (Hija)"
                  />
                </div>
                <div>
                  <label className="label-pro">Teléfono de Contacto</label>
                  <input
                    name="caregiverPhone"
                    defaultValue={initialData?.caregiverPhone}
                    className="input-pro text-lg p-3"
                    placeholder="+34 600..."
                    inputMode="tel"
                  />
                </div>
              </div>

              {/* SECCIÓN 2: CONTEXTO PSICOSOCIAL ESTRUCTURADO */}
              <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-200">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Users size={16} /> Contexto Psicosocial
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-pro">Situación de Convivencia</label>
                    <select
                      name="livingSituation"
                      defaultValue={initialData?.livingSituation}
                      className="input-pro bg-white"
                    >
                      <option value="">- Seleccionar -</option>
                      <option value="alone">Vive solo/a</option>
                      <option value="couple">Con cónyuge/pareja</option>
                      <option value="nuclear">Núcleo Familiar</option>
                      <option value="extended">Familia Extensa</option>
                      <option value="institution">Residencia / Institución</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-pro">Nivel de Apoyo Familiar</label>
                    <select
                      name="supportLevel"
                      defaultValue={initialData?.supportLevel}
                      className="input-pro bg-white"
                    >
                      <option value="">- Seleccionar -</option>
                      <option value="high">Alto / Constante</option>
                      <option value="medium">Medio / Puntual</option>
                      <option value="low">Bajo / Escaso</option>
                      <option value="none">Nulo / Inexistente</option>
                      <option value="conflict">Conflictivo</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-pro">Eventos Vitales Relevantes</label>
                  <textarea
                    name="lifeEvents"
                    defaultValue={initialData?.lifeEvents}
                    className="input-pro h-20 resize-none bg-white"
                    placeholder="Pérdidas recientes, mudanzas, jubilación, traumas..."
                  />
                </div>
              </div>

              {/* SECCIÓN 3: IDENTIDAD SONORA (ISO) DETALLADA */}
              <div className="bg-pink-50/50 p-6 rounded-2xl space-y-4 border border-pink-100/50">
                <h3 className="font-bold text-pink-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Music size={16} /> Identidad Sonora (ISO)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-pro text-pink-900/70">Estilos Preferidos</label>
                    <input
                      name="musicStyles"
                      defaultValue={initialData?.musicStyles}
                      className="input-pro border-pink-200 focus:border-pink-500 bg-white"
                      placeholder="Copla, Clásica, Rock..."
                    />
                  </div>
                  <div>
                    <label className="label-pro text-pink-900/70">
                      Sonidos/Músicas Desagradables
                    </label>
                    <input
                      name="dislikedSounds"
                      defaultValue={initialData?.dislikedSounds}
                      className="input-pro border-pink-200 focus:border-pink-500 bg-white"
                      placeholder="Ruido fuerte, Agudos..."
                    />
                  </div>
                </div>
                <div>
                  <label className="label-pro text-pink-900/70">
                    Canciones Biográficas / Significativas (Anclajes)
                  </label>
                  <textarea
                    name="isoSongs"
                    defaultValue={initialData?.isoSongs}
                    className="input-pro h-20 resize-none border-pink-200 focus:border-pink-500 bg-white"
                    placeholder="Lista de canciones clave para la historia de vida..."
                  />
                </div>
              </div>

              <div className="pb-4">
                <label className="label-pro">Expectativas y Objetivos Iniciales</label>
                <textarea
                  name="initialGoals"
                  defaultValue={initialData?.initialGoals}
                  className="input-pro h-24 resize-none"
                  placeholder="Qué espera el paciente/familia de la terapia..."
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4 mb-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                  />
                  <span
                    className={`text-sm font-bold ${hasConsent ? 'text-emerald-700' : 'text-slate-500'}`}
                  >
                    Consentimiento Firmado y Guardado
                  </span>
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  icon={Printer}
                  onClick={handlePrintConsent}
                >
                  Imprimir Modelo
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Desktop Only (Mobile uses Header) */}
        <div className="hidden md:flex p-6 border-t border-slate-100 justify-end gap-3 bg-slate-50 md:rounded-b-2xl shrink-0 safe-pb">
          <Button onClick={onClose} variant="secondary" className="justify-center">
            Cancelar
          </Button>
          <Button
            icon={Save}
            onClick={() => formRef.current?.requestSubmit()}
            className="justify-center"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};
