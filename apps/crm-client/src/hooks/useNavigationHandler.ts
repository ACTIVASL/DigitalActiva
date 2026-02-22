import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigationPayload } from '../lib/types';
import { useUIStore } from '../stores/useUIStore';

/**
 * Centralizes all view-id → URL routing logic.
 * Uses View Transitions API when available.
 */
export const useNavigationHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const quickAppointment = useUIStore((state) => state.quickAppointment);

    const getCurrentViewID = useCallback((pathname: string) => {
        if (pathname === '/' || pathname === '/dashboard') return 'dashboard';
        if (pathname === '/patients/adults') return 'patients-adults';
        if (pathname === '/patients/kids') return 'patients-kids';
        if (pathname.startsWith('/patients')) return 'patients';
        if (pathname === '/sessions') return 'sessions';
        if (pathname === '/sessions/group') return 'group-sessions';
        if (pathname === '/calendar') return 'calendar';
        if (pathname === '/settings') return 'settings';
        if (pathname === '/resources') return 'resources';
        if (pathname === '/billing') return 'billing';
        if (pathname === '/canvas') return 'canvas';
        return 'dashboard';
    }, []);

    const currentView = getCurrentViewID(location.pathname);

    const handleNavigate = useCallback((viewId: string, data?: NavigationPayload) => {
        function processNavigation() {
            switch (viewId) {
                case 'dashboard':
                    navigate('/dashboard');
                    break;
                case 'patients':
                    if (data && typeof data === 'object' && 'mode' in data && data.mode === 'new') {
                        navigate('/patients?action=new');
                    } else {
                        navigate('/patients');
                    }
                    break;
                case 'patients-adults':
                    navigate('/patients/adults');
                    break;
                case 'patients-kids':
                    navigate('/patients/kids');
                    break;
                case 'sessions':
                    navigate('/sessions');
                    break;
                case 'groups':
                    navigate('/groups');
                    break;
                case 'group-sessions':
                    navigate('/sessions/group');
                    break;
                case 'group-sessions-history':
                    navigate('/sessions/group-history');
                    break;
                case 'calendar':
                    navigate('/calendar');
                    break;
                case 'settings':
                    navigate('/settings');
                    break;
                case 'resources':
                    navigate('/resources');
                    break;
                case 'patient-detail':
                    if (typeof data === 'string' || typeof data === 'number') {
                        navigate(`/patients/${data}`);
                    } else if (data && typeof data === 'object' && 'id' in data) {
                        navigate(`/patients/${data.id}`);
                    }
                    break;
                case 'reports':
                    navigate('/reports');
                    break;
                case 'billing':
                    navigate('/billing');
                    break;
                case 'canvas':
                    navigate('/canvas');
                    break;
                case 'quick-appointment': {
                    const payload = data as { mode: 'new' | 'existing' };
                    quickAppointment.open(payload?.mode || 'new');
                    break;
                }
                default:
                    navigate('/dashboard');
            }
        }

        if (!document.startViewTransition) {
            processNavigation();
            return;
        }
        document.startViewTransition(() => {
            processNavigation();
        });
    }, [navigate, quickAppointment]);

    return { currentView, handleNavigate };
};
