import { Toaster as Sonner } from 'sonner';
import { X } from 'lucide-react';

type SonnerToastProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: SonnerToastProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg",
          description: "group-[.toaster]:text-slate-500",
          actionButton:
            "group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-50",
          cancelButton:
            "group-[.toaster]:bg-slate-100 group-[.toaster]:text-slate-500",
        },
      }}
      {...props}
    />
  );
};

// LEGACY TOAST COMPONENT (Kept for backward compatibility)
interface LegacyToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type = 'success', onClose }: LegacyToastProps) => (
  <div role="alert" aria-live="assertive" className="fixed top-4 left-4 right-4 md:left-auto md:top-auto md:bottom-6 md:right-6 z-[9999] animate-in slide-in-from-top-4 md:slide-in-from-bottom-4 fade-in duration-300 flex justify-center md:block">
    <div
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-3d border ${type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}
    >
      <span className="font-bold text-sm">{message}</span>
      <button onClick={onClose} aria-label="Cerrar notificación" className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={18} />
      </button>
    </div>
  </div>
);

export { Toaster, Toast };

