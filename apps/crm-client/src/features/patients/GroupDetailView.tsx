import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Brain, Clock, Plus, Activity, Trash2 } from 'lucide-react';
import { Button } from '@monorepo/ui-system';
import { Card } from '@monorepo/ui-system';
import { GroupSession } from '../../lib/types';
import { useUIStore } from '../../stores/useUIStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface GroupDetailViewProps {
  groupSessions: GroupSession[];
  onBack: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupSessions, onBack }) => {
  const { groupName } = useParams<{ groupName: string }>();
  const decodedName = decodeURIComponent(groupName || '');
  const navigate = useNavigate();

  const groupHistory = useMemo(() => {
    return groupSessions
      .filter((s) => s.groupName === decodedName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [groupSessions, decodedName]);

  const chartData = useMemo(() => {
    // Sort oldest first for chart
    return [...groupHistory].reverse().map((s) => ({
      date: s.date.split(' de ')[0], // Simplify date for axis
      participation: s.engagementScore || 0,
      cohesion: s.cohesionScore || 0,
      energy: s.energyLevel === 'High' ? 10 : s.energyLevel === 'Medium' ? 5 : 2,
    }));
  }, [groupHistory]);

  const uniqueParticipants = useMemo(() => {
    const names = new Set<string>();
    groupHistory.forEach((s) => s.participants?.forEach((p) => names.add(p.name)));
    return Array.from(names);
  }, [groupHistory]);

  const handleNewSession = () => {
    useUIStore.getState().groupSession.open(decodedName);
  };

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        '⚠️ ¿Estás seguro de ELIMINAR ESTE GRUPO y TODAS sus sesiones?\n\nEsta acción borrará permanentemente todo el historial del grupo y es irreversible.',
      )
    )
      return;

    const secondConfirm = prompt('Para confirmar, escribe "ELIMINAR" en mayúsculas:');
    if (secondConfirm !== 'ELIMINAR') {
      alert('Cancelado: El texto no coincide.');
      return;
    }

    try {
      const { GroupSessionRepository } =
        await import('../../data/repositories/GroupSessionRepository');
      await GroupSessionRepository.deleteAllSessionsForGroup(decodedName);
      alert('Grupo eliminado correctamente.');
      navigate('/groups');
    } catch {
      alert('Error al eliminar grupo.');
    }
  };

  if (!groupHistory.length) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto mt-10 space-y-6">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Users size={32} className="text-slate-300" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{decodedName}</h2>
          <p className="text-slate-500">Este grupo es nuevo y aún no tiene historial.</p>
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={onBack} variant="ghost">
            Volver
          </Button>
          <Button onClick={handleNewSession} icon={Plus}>
            Empezar Primera Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} icon={ArrowLeft}>
              Volver
            </Button>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold uppercase tracking-wide">
              Grupo Terapéutico
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {decodedName}
            <Button size="sm" variant="secondary" onClick={handleNewSession} icon={Plus}>
              Nueva Sesión
            </Button>
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Users size={16} /> {uniqueParticipants.length} Participantes Históricos
            <span className="text-slate-300">•</span>
            <Calendar size={16} /> {groupHistory.length} Sesiones Realizadas
          </p>
        </div>

        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleDeleteGroup}
          icon={Trash2}
        >
          Eliminar Grupo
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Participants */}
        <div className="space-y-6">
          {/* CHART CARD */}
          <Card className="h-fit p-6 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-pink-600" size={20} />
              <h3 className="font-bold text-slate-800">Evolución de Métricas</h3>
            </div>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="participation"
                    name="Participación"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cohesion"
                    name="Cohesión"
                    stroke="#ec4899"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="h-fit p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-pink-600" size={20} />
              <h3 className="font-bold text-slate-800">Participantes Recurrentes</h3>
            </div>
            <ul className="space-y-2">
              {uniqueParticipants.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                    {p.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{p}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Column: Evolution Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="text-pink-600" /> Bitácora de Sesiones
          </h2>

          <div className="space-y-4">
            {groupHistory.map((session) => (
              <div
                key={session.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-pink-500 to-rose-500"></div>

                {/* Header Info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className="font-bold text-lg text-slate-900 flex items-center gap-2 cursor-pointer hover:text-pink-600 transition-colors"
                      onClick={() =>
                        useUIStore.getState().groupSession.open(decodedName, 'evolution', session)
                      }
                    >
                      Sesión Grupal
                      <span className="text-xs font-normal text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                        <Clock size={12} /> {session.time}
                      </span>
                      <span className="ml-2 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 hover:bg-white hover:border-pink-300">
                        ✏️ Editar
                      </span>
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      {session.date} • {session.location}
                    </p>
                  </div>
                  {/* MICRO CHARTS In Session Card */}
                  <div className="flex gap-4">
                    {session.engagementScore !== undefined && (
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Partic.
                        </div>
                        <div className="font-black text-blue-600 text-lg">
                          {session.engagementScore}
                        </div>
                      </div>
                    )}
                    {session.cohesionScore !== undefined && (
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Cohesión
                        </div>
                        <div className="font-black text-pink-600 text-lg">
                          {session.cohesionScore}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                {session.observations && (
                  <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 mb-4">
                    <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                      Valoración / Evolución
                      {session.energyLevel && (
                        <span
                          className={`px-2 py-[1px] rounded-full text-[9px] border ${session.energyLevel === 'High'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : session.energyLevel === 'Medium'
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}
                        >
                          Energía:{' '}
                          {session.energyLevel === 'High'
                            ? 'ALTA'
                            : session.energyLevel === 'Medium'
                              ? 'MEDIA'
                              : 'BAJA'}
                        </span>
                      )}
                    </p>
                    <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                      {session.observations}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
                  {session.participants?.map((p, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100 flex items-center gap-1"
                    >
                      <Users size={10} className="opacity-50" /> {p.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
