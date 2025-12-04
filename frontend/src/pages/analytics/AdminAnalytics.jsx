// src/pages/analytics/AdminAnalytics.jsx
import { useEffect, useState } from "react";
import { analyticsService } from "../../services/analyticsService";
import { Card } from "../../components/ui/card";
import  StatsCard  from "../../components/ui/StatsCard";
import { Skeleton } from "../../components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [abuse, setAbuse] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#ef4444", "#fb923c", "#22c55e", "#3b82f6"];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [ov, ab] = await Promise.all([
      analyticsService.getAdminOverview(),
      analyticsService.getAbuseDetection()
    ]);

    setOverview(ov.data);
    setAbuse(ab.data);
    setLoading(false);
  };

  if (loading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-6">

      {/* Basic Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={overview.users} />
        <StatsCard title="Total Reports" value={overview.reports} />
        <StatsCard title="Total Programs" value={overview.programs} />
        <StatsCard title="Companies" value={overview.companies} />
      </div>

      {/* Abuse Chart */}
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">Abuse Detection</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={abuse} dataKey="count" nameKey="_id" outerRadius={100} label>
              {abuse.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}
