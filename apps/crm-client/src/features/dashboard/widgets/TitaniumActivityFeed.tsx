import React, { useMemo } from 'react';
import { Card } from '@monorepo/ui-system';
import {
  UserPlus,
  CalendarCheck,
  FileSignature,
  CreditCard,
  ShieldCheck,
  FileX,
  Loader2,
  FileText,
  CheckCircle2,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { ActivityLogItem } from '../../../hooks/useActivityLog';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';

interface TitaniumActivityFeedProps {
  activities: ActivityLogItem[];
  isLoading?: boolean;
}

export const TitaniumActivityFeed: React.FC<TitaniumActivityFeedProps> = ({
  activities,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);

  // Group activities by date
  const groups = useMemo(() => {
    const grouped: Record<string, ActivityLogItem[]> = {};
    activities.forEach((item) => {
      const date = new Date(item.timestamp);
      let key = format(date, 'yyyy-MM-dd');
      if (isToday(date)) key = 'HOY';
      else if (isYesterday(date)) key = 'AYER';
      else key = format(date, 'd MMMM yyyy', { locale: es });

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [activities]);

  const getIcon = (type: string, _metadata?: ActivityLogItem['metadata']) => {
    const baseClass = 'p-2 rounded-full shrink-0 border shadow-sm';
    switch (type) {
      case 'patient':
        return (
          <div className={`${baseClass} bg-emerald-50 border-emerald-100 text-emerald-600`}>
            <UserPlus size={16} />
          </div>
        );
      case 'session':
        return (
          <div className={`${baseClass} bg-pink-50 border-pink-100 text-pink-600`}>
            <CalendarCheck size={16} />
          </div>
        );
      case 'report':
        return (
          <div className={`${baseClass} bg-purple-50 border-purple-100 text-purple-600`}>
            <FileSignature size={16} />
          </div>
        );
      case 'finance':
        return (
          <div className={`${baseClass} bg-amber-50 border-amber-100 text-amber-600`}>
            <CreditCard size={16} />
          </div>
        );
      case 'security':
        return (
          <div className={`${baseClass} bg-indigo-50 border-indigo-100 text-indigo-600`}>
            <ShieldCheck size={16} />
          </div>
        );
      case 'delete':
        return (
          <div className={`${baseClass} bg-red-50 border-red-100 text-red-500`}>
            <FileX size={16} />
          </div>
        );
      default:
        return (
          <div className={`${baseClass} bg-slate-50 border-slate-100 text-slate-600`}>
            <CheckCircle2 size={16} />
          </div>
        );
    }
  };

  const handleAction = (item: ActivityLogItem) => {
    // Intelligent Action Dispatcher
    if (!item.metadata) return;

    if (item.type === 'patient' && 'patientId' in item.metadata) {
      navigate(`/patients/${item.metadata.patientId}?tab=treatment`);
    } else if (item.type === 'session' && 'patientId' in item.metadata) {
      navigate(`/patients/${item.metadata.patientId}?tab=sessions`);
    } else if (item.type === 'report' && 'url' in item.metadata && item.metadata.url) {
      window.open(item.metadata.url, '_blank');
    } else if (item.type === 'finance' && 'invoiceId' in item.metadata) {
      navigate('/billing'); // Fixed: Now actually navigates
    }
  };

  const handleExport = async () => {
    if (!activities.length) return;
    setIsExporting(true);

    try {
      // User Request: "Solo una casilla REGISTRO DE ACTIVIDAD y debajo todo lo que se registre"
      // Google Sheets Optimization: NO BOM (\uFEFF)
      const headers = ['REGISTRO DE ACTIVIDAD'];
      const rows = activities.map((item) => {
        const date = new Date(item.timestamp);
        const dateStr = format(date, 'dd/MM/yyyy HH:mm', { locale: es });

        const cleanMessage = item.message.replace(/"/g, "'");
        const typeLabel = item.type.toUpperCase();

        let extra = '';
        if (item.type === 'finance' && item.metadata && 'amount' in item.metadata) {
          extra = ` (${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.metadata.amount as number)})`;
        }

        // Force quoted string to ensure single column integrity in Sheets
        return [`"${dateStr} - ${typeLabel}: ${cleanMessage}${extra}"`].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      // Clean Blob for Google Sheets (No BOM)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `registro_actividad_gsheets_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`,
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success('Descarga iniciada (Formato Google Sheets)');
    } catch {
      error('Error al generar el archivo. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border-slate-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Registro de Actividad
          </h3>
          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200 hidden sm:inline-block">
            Tiempo Real
          </span>
        </div>

        {/* Download Action */}
        <button
          onClick={handleExport}
          disabled={activities.length === 0 || isExporting}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Descargar Registro (CSV)"
        >
          <Download size={18} />
        </button>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative scroll-smooth">
        {isLoading && (
          <div className="flex justify-center py-12 absolute inset-0 bg-white/50 z-20">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <FileText size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin actividad registrada</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {Object.entries(groups).map(([dateLabel, items]) => (
            <motion.div
              key={dateLabel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="sticky top-0 z-0 flex items-center gap-4 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                  {dateLabel}
                </span>
                <div className="h-px bg-slate-100 flex-1" />
              </div>

              <div className="space-y-4 pl-2 border-l-2 border-slate-100 ml-4 relative">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleAction(item)}
                    className={`
                                            group relative pl-6 cursor-pointer hover:bg-slate-50 p-2 rounded-lg
                                            transition-all duration-200 border border-transparent hover:border-slate-100
                                        `}
                  >
                    {/* Connector Dot */}
                    <div className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 group-hover:border-indigo-500 group-hover:scale-110 transition-all z-10" />

                    <div className="flex gap-3">
                      {getIcon(item.type, item.metadata)}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                            {item.message}
                          </p>
                          <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap ml-2 opacity-50 group-hover:opacity-100">
                            {format(new Date(item.timestamp), 'HH:mm')}
                          </span>
                        </div>

                        {/* Metadata Rich Preview */}
                        {item.type === 'finance' && item.metadata && 'amount' in item.metadata && (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-1.5 rounded border border-emerald-100">
                              {new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(item.metadata.amount || 0)}
                            </span>
                            {item.metadata.status === 'paid' && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">
                                Pagado
                              </span>
                            )}
                          </div>
                        )}

                        {item.type === 'report' && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-indigo-500 font-medium">
                            Ver Documento <ArrowUpRight size={10} />
                          </div>
                        )}

                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {formatDistanceToNow(new Date(item.timestamp), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};
