import React from 'react';

const StatsCard = ({ title, value, subtitle }) => (
  <div className="bg-white/5 dark:bg-black/30 p-4 rounded-2xl shadow-sm border border-white/5">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
  </div>
);

export default StatsCard;
