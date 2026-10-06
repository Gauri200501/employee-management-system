import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard = ({ icon: Icon, label, value, iconClass, colorClass, trend, trendLabel }) => {
  return (
    <div className={`glass-card stat-card ${colorClass || ''}`}>
      <div className={`stat-card-icon ${iconClass}`}>
        <Icon size={22} />
      </div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(trend)}% {trendLabel || 'this month'}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
