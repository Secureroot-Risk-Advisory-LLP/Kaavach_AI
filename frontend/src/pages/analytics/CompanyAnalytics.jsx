// src/pages/analytics/CompanyAnalytics.jsx
import { useEffect, useState } from "react";
import { analyticsService } from "../../services/analyticsService";
import { Card } from "../../components/ui/card";
import  StatsCard  from "../../components/ui/StatsCard";
import { Skeleton } from "../../components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";


export default function CompanyAnalytics() {
  const [funnel, setFunnel] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [ttr, setTTR] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);

    const [fun, rew, tt, ins] = await Promise.all([
      analyticsService.getCompanyReportFunnel(),
      analyticsService.getCompanyRewardSummary(),
      analyticsService.getCompanyTTR(),
      analyticsService.getCompanyProgramInsights()
    ]);

    setFunnel(fun.data || []);
    setRewards(rew.data || {});
    setTTR(tt.data);
    setInsights(ins.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatsCard title="Total Rewards Paid" value={`$${rewards?.totalRewards}`} />
        <StatsCard title="Avg Reward" value={`$${rewards?.avgReward?.toFixed(2)}`} />
        <StatsCard title="Avg TTR (Days)" value={ttr?.avgTTR?.toFixed(1)} />
      </div>

      {/* Funnel */}
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">Report Funnel</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={funnel}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">Program Insights</h2>
        <ul className="space-y-2">
          {insights.map((p) => (
            <li
              key={p._id}
              className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between"
            >
              <span className="font-semibold">{p.title}</span>
              <span className="text-primary-600 dark:text-primary-400">
                {p.reports} Reports
              </span>
            </li>
          ))}
        </ul>
      </Card>

    </div>
  );
}
