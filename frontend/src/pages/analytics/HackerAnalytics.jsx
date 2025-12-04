// src/pages/analytics/HackerAnalytics.jsx
import { useEffect, useState } from "react";
import { analyticsService } from "../../services/analyticsService";
import { Card } from "../../components/ui/card";
import  StatsCard  from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";


import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"];

export default function HackerAnalytics() {
  const [severity, setSeverity] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [acceptance, setAcceptance] = useState([]);
  const [impact, setImpact] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [sev, mon, acc, imp, sum] = await Promise.all([
      analyticsService.getSeverityStats(),
      analyticsService.getMonthlyActivity(),
      analyticsService.getAcceptanceStats(),
      analyticsService.getImpactScore(),
      analyticsService.getHackerSummary()
    ]);

    setSeverity(sev.data || []);
    setMonthly(mon.data || []);
    setAcceptance(acc.data || []);
    setImpact(imp.data?.impactScore || 0);
    setSummary(sum.data || null);
    setLoading(false);
  };

  if (loading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-6">

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatsCard title="Total Reports" value={summary?.totalReports} />
        <StatsCard title="Accepted" value={summary?.accepted} />
        <StatsCard title="Impact Score" value={impact} />
        <StatsCard title="Rank" value={`#${summary?.rank}`} />
      </div>

      {/* Severity Distribution */}
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">Severity Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={severity}
              dataKey="count"
              nameKey="_id"
              outerRadius={100}
              label
            >
              {severity.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Activity */}
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">Monthly Activity</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthly}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Acceptance Stats */}
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">Acceptance Overview</h2>
        <div className="flex gap-3 flex-wrap">
          {acceptance.map((item, i) => (
            <Badge key={i} className="px-4 py-2 text-sm">
              {item._id.toUpperCase()} — {item.count}
            </Badge>
          ))}
        </div>
      </Card>

    </div>
  );
}
