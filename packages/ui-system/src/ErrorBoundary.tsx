import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Here you would log to your new LoggerService
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-t-4 border-red-500">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertOctagon size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Algo salió mal</h1>
            <p className="text-slate-500 mb-6">
              El sistema ha detectado un error inesperado. Hemos registrado este evento. Por favor,
              intente recargar la página.
            </p>

            {this.state.error && (
              <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-left mb-6 overflow-x-auto text-slate-600">
                {this.state.error.message}
              </div>
            )}

            <Button
              onClick={this.handleReload}
              icon={RefreshCw}
              className="w-full justify-center shadow-lg shadow-red-200"
            >
              Reiniciar Sistema
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
