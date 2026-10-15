import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Card, Spinner, EmptyState, Badge } from "../../components/ui";
import apiClient from "../../services/apiClient";

interface Stats {
  totalCourses: number;
  totalCases: number;
  publishedCases: number;
  totalAttempts: number;
  totalSubmissions: number;
}

export function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get<{ status: string; data: Stats }>("/statistics/overview");
        setStats(res.data.data);
      } catch {
        // Stats not yet implemented on backend — show zeros
        setStats({ totalCourses: 0, totalCases: 0, publishedCases: 0, totalAttempts: 0, totalSubmissions: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats ? [
    { label: "My Courses",         value: stats.totalCourses,     icon: "📚" },
    { label: "Total Cases",        value: stats.totalCases,       icon: "📋" },
    { label: "Published Cases",    value: stats.publishedCases,   icon: "✅" },
    { label: "Student Attempts",   value: stats.totalAttempts,    icon: "🎯" },
    { label: "Review Submissions", value: stats.totalSubmissions, icon: "📝" },
  ] : [];

  return (
    <div className="p-6">
      <PageHeader
        title="Statistics"
        description="Overview of your teaching activity and student participation."
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {statCards.map((s) => (
              <Card key={s.label}>
                <div className="text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="mt-1 text-xs text-gray-500">{s.label}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <EmptyState
              title="Detailed analytics coming soon"
              description="Branch distribution and student performance charts will be available in a future sprint."
            />
          </div>
        </>
      )}
    </div>
  );
}
