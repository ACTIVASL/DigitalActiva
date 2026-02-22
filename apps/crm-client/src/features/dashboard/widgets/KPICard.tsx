import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@monorepo/ui-system';

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'blue' | 'emerald' | 'pink' | 'amber' | 'indigo';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = React.memo(({
  title,
  value,
  subValue,
  icon: Icon,
  color,
  onClick,
}) => {
  const colorMap = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-600',
    pink: 'from-pink-50 to-pink-100 text-pink-600',
    amber: 'from-amber-50 to-amber-100 text-amber-600',
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600',
  };

  return (
    <Card
      className={`p-6 flex items-center gap-5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorMap[color]} shadow-inner shrink-0`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 truncate">
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-800 truncate leading-tight">{value}</h3>
        {subValue && (
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{subValue}</p>
        )}
      </div>
    </Card>
  );
});
KPICard.displayName = 'KPICard';
