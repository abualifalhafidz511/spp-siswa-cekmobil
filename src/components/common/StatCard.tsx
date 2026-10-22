import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'red' | 'emerald' | 'amber' | 'blue' | 'zinc';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'red',
  onClick,
}) => {
  const colorMap = {
    red: {
      iconBg: 'bg-red-50 text-red-600 border border-red-100',
      borderHover: 'hover:border-red-200',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      borderHover: 'hover:border-emerald-200',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      borderHover: 'hover:border-amber-200',
    },
    blue: {
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
      borderHover: 'hover:border-sky-200',
    },
    zinc: {
      iconBg: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
      borderHover: 'hover:border-zinc-300',
    },
  };

  const selected = colorMap[accentColor];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs transition-all ${
        onClick ? `cursor-pointer ${selected.borderHover} hover:shadow-sm` : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${selected.iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-zinc-400">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
