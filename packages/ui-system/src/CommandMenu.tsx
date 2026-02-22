import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Calculator, Calendar, Settings, User, FileText, LogOut, Search } from 'lucide-react';
// import { useUIStore } from '../../stores/useUIStore';

export const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  // const { quickAppointment } = useUIStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[9999] animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 p-0"
    >
      <div className="flex items-center border-b px-4" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Command.Input
          placeholder="Escribe un comando o busca..."
          className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
        <Command.Empty className="py-6 text-center text-sm text-slate-500">
          No se encontraron resultados.
        </Command.Empty>

        <Command.Group heading="Acciones Rápidas" className="mb-2">
          <Command.Item
            onSelect={() => run(() => { /* TODO: Quick Appointment action */ })}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Nueva Cita</span>
            <span className="ml-auto text-xs tracking-widest text-slate-500">⌘N</span>
          </Command.Item>

          <Command.Item
            onSelect={() => run(() => navigate('/patients'))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Buscar Paciente...</span>
          </Command.Item>

          <Command.Item
            onSelect={() => run(() => navigate('/reports'))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Informes Clínicos</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Navegación" className="mb-2 text-slate-500">
          <Command.Item
            onSelect={() => run(() => navigate('/dashboard'))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900"
          >
            <Calculator className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Command.Item>

          <Command.Item
            onSelect={() => run(() => navigate('/calendar'))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendario</span>
          </Command.Item>

          <Command.Item
            onSelect={() => run(() => navigate('/settings'))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Command.Item>
        </Command.Group>

        <Command.Separator className="-mx-1 h-px bg-slate-200" />

        <Command.Group heading="Sistema">
          <Command.Item
            onSelect={() => run(() => window.location.reload())}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-red-100 aria-selected:text-red-900 text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};
