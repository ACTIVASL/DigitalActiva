import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  FileImage,
  File,
  Loader2,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@monorepo/ui-system';
import { useDocumentController } from '../../../hooks/controllers/useDocumentController';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DocumentCategoryEnum } from '../../../lib/types';
import { ClinicalDocument } from '@monorepo/shared';

// --- SUB COMPONENT (ISOLATED LOGIC) ---
interface DocumentCardProps {
  doc: ClinicalDocument;
  sectionColor: string;
  getIcon: (mime: string, category?: string) => React.ReactNode;
  onDelete: (doc: ClinicalDocument) => Promise<void>;
  formatSize: (bytes: number) => string;
}

const DocumentCard = ({ doc, sectionColor, getIcon, onDelete, formatSize }: DocumentCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`¿Estás seguro de que quieres eliminar "${doc.name}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(doc);
      } catch {
        // Ignore error
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 group hover:border-brand-300 transition-all hover:shadow-md relative overflow-hidden">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${sectionColor.split(' ')[0]} ${sectionColor.split(' ')[2]}`}
      >
        {getIcon(doc.type, doc.category)}
      </div>

      <div className="flex-1 min-w-0 mr-16">
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-slate-800 text-sm truncate hover:text-brand-600 block leading-tight"
        >
          {doc.name}
        </a>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {format(new Date(doc.createdAt), 'd MMM', { locale: es })} • {formatSize(doc.size)}
        </p>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10">
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors shadow-sm bg-white border border-slate-100"
        >
          <Eye size={16} />
        </a>
        <button
          onClick={handleDelete}
          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-red-400 transition-colors shadow-sm bg-white border border-slate-100"
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export const DocumentsTab: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const { documents, isLoading, uploadDocument, isUploading, deleteDocument } =
    useDocumentController(patientId);

  // UI State
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<keyof typeof DocumentCategoryEnum.enum>('report');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helpers
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    await uploadDocument(file, selectedCategory);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const getIcon = (mime: string, category?: string) => {
    if (category === 'invoice') return <Receipt size={20} className="text-emerald-600" />;
    if (category === 'consent') return <ShieldCheck size={20} className="text-blue-600" />;
    if (mime.includes('image')) return <FileImage size={20} />;
    if (mime.includes('pdf')) return <FileText size={20} />;
    return <File size={20} />;
  };

  // Grouping Logic
  const groupedDocs = documents.reduce(
    (acc, doc) => {
      const cat = doc.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    },
    {} as Record<string, typeof documents>,
  );

  const sections = [
    {
      id: 'consent',
      label: 'Documentación Legal',
      color: 'bg-blue-50 border-blue-100 text-blue-800',
    },
    {
      id: 'invoice',
      label: 'Facturación',
      color: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    },
    {
      id: 'report',
      label: 'Historial Clínico',
      color: 'bg-indigo-50 border-indigo-100 text-indigo-800',
    },
    {
      id: 'lab',
      label: 'Pruebas Externas',
      color: 'bg-purple-50 border-purple-100 text-purple-800',
    },
    {
      id: 'general',
      label: 'Archivo General',
      color: 'bg-slate-50 border-slate-100 text-slate-800',
    },
    { id: 'other', label: 'Otros', color: 'bg-gray-50 border-gray-100 text-gray-800' },
  ];

  if (!patientId) return <div>Error: No paciente ID</div>;

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      {/* POWER UPLOAD ZONE */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging
            ? 'border-brand-500 bg-brand-50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-brand-300'
          } ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-center">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-white text-brand-600' : 'bg-slate-50 text-slate-400'}`}
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={28} />}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              {isDragging ? '¡Suelta para guardar!' : 'Subir Documento Seguro'}
            </h3>
            <p className="text-slate-500 text-sm">Arrastra o selecciona un archivo (Máx 100MB)</p>
          </div>

          {/* CATEGORY SELECTOR */}
          <div className="flex items-center justify-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 inline-flex w-full">
            <label className="text-xs font-bold text-slate-500 uppercase px-2">Tipo:</label>
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as keyof typeof DocumentCategoryEnum.enum)
              }
              className="bg-white border-0 py-1.5 px-3 rounded-md text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500 outline-none flex-1 max-w-[200px]"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="report">Informe Clínico</option>
              <option value="invoice">Factura</option>
              <option value="consent">Consentimiento</option>
              <option value="lab">Prueba / Analítica</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
          >
            {isUploading ? 'Encriptando y Subiendo...' : 'Seleccionar Archivo'}
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,.doc,.docx"
          disabled={isUploading}
        />
      </div>

      {/* THE VAULT SECTIONS */}
      <div className="space-y-6">
        {sections.map((section) => {
          const docs = groupedDocs[section.id] || [];
          if (docs.length === 0 && !['general', 'consent', 'invoice'].includes(section.id))
            return null;

          return (
            <div key={section.id} className="animate-in slide-in-from-bottom-2 duration-500">
              <h4
                className={`font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2 ${section.color.split(' ')[2]}`}
              >
                {section.label}{' '}
                <span className="bg-white px-1.5 py-0.5 rounded-full shadow-sm text-[10px] border">
                  {docs.length}
                </span>
              </h4>

              {docs.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {docs.map((doc: ClinicalDocument) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      sectionColor={section.color}
                      getIcon={getIcon}
                      onDelete={deleteDocument}
                      formatSize={formatSize}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {section.id === 'consent' && (
                    <button
                      onClick={() => {
                        setSelectedCategory('consent');
                        fileInputRef.current?.click();
                      }}
                      className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 border-dashed shadow-sm flex items-center gap-3 group hover:bg-emerald-100 transition-all text-left w-full"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-emerald-800 text-sm block">
                          Añadir Consentimiento
                        </span>
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          Haga clic para subir PDF firmado
                        </p>
                      </div>
                      <UploadCloud size={16} className="text-emerald-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm z-50">
          <Loader2 size={16} className="animate-spin" />
          Sincronizando Bóveda...
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENT (ISOLATED LOGIC) ---
// --- SUB COMPONENT (ISOLATED LOGIC) ---
