import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@monorepo/ui-system';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl) { },
    onRegisterError(_error) {
      // SW registration failures are non-actionable; app degrades gracefully
    },
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!needRefresh && isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {!isOnline && (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom border border-slate-700">
          <div className="bg-slate-800 p-2 rounded-full">
            <WifiOff size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-sm">Modo Hospital (Offline)</p>
            <p className="text-xs text-slate-400">Tus cambios se guardarán al volver.</p>
          </div>
        </div>
      )}

      {(needRefresh || offlineReady) && (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-pink-100 flex flex-col gap-3 animate-in slide-in-from-bottom max-w-sm">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {offlineReady ? 'App lista para uso sin conexión' : 'Nueva versión disponible'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {offlineReady
                  ? 'Cierra esta notificación para continuar.'
                  : 'Actualiza para obtener las últimas mejoras y parches de seguridad.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={close} className="text-xs h-8">
              Cerrar
            </Button>
            {needRefresh && (
              <Button
                size="sm"
                onClick={() => updateServiceWorker(true)}
                icon={RefreshCw}
                className="text-xs h-8"
              >
                Actualizar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
