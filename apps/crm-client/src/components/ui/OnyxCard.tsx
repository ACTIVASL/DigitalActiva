import React, { ReactNode } from 'react';

interface OnyxCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    icon?: React.ElementType;
    action?: ReactNode;
    active?: boolean;
}

export const OnyxCard: React.FC<OnyxCardProps> = React.memo(({
    children,
    className = '',
    title,
    icon: Icon,
    action,
    active = false
}) => {
    return (
        <div className={`
      relative group
      bg-[#0a0a0a] border border-slate-800/60
      backdrop-blur-sm rounded-xl overflow-hidden
      transition-all duration-300 ease-out
      hover:border-slate-700 hover:shadow-2xl hover:shadow-black/50
      ${active ? 'border-blue-900/50 shadow-[0_0_30px_rgba(30,58,138,0.15)]' : ''}
      ${className}
    `}>
            {/* Header if Title Provided */}
            {title && (
                <div className="px-5 py-4 border-b border-slate-800/40 flex items-center justify-between bg-slate-900/20">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`p-1.5 rounded-md ${active ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800/50 text-slate-400'}`}>
                                <Icon size={16} strokeWidth={2} />
                            </div>
                        )}
                        <h3 className="text-sm font-bold tracking-widest uppercase text-slate-300 font-mono">
                            {title}
                        </h3>
                    </div>
                    {action}
                </div>
            )}

            {/* Content */}
            <div className="p-5">
                {children}
            </div>

            {/* Active Indicator Line */}
            {active && (
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />
            )}
        </div>
    );
});
OnyxCard.displayName = 'OnyxCard';
