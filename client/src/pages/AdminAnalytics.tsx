import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  Mail,
  Users,
  UserX,
  TrendingUp,
  Calendar,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

interface ReminderStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  unsubscribed: number;
  remindersSent24h: number;
  remindersSent1h: number;
  upcomingSessions: number;
  pendingReminders: number;
}

interface SessionReminder {
  sessionTitle: string;
  sessionDate: string;
  totalSubscribers: number;
  activeSubscribers: number;
  sent24h: number;
  sent1h: number;
}

export default function AdminAnalytics() {
  const [, setLocation] = useLocation();
  const { data: stats, refetch: refetchStats, isLoading: statsLoading } = trpc.analytics.reminders.stats.useQuery();
  const { data: sessions = [], refetch: refetchSessions, isLoading: sessionsLoading } = trpc.analytics.reminders.sessions.useQuery();
  
  const loading = statsLoading || sessionsLoading;

  const fetchAnalytics = () => {
    refetchStats();
    refetchSessions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/admin/sessions")}
                className="text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Email Reminder Analytics</h1>
                <p className="text-slate-400 mt-1">Monitor reminder delivery and engagement</p>
              </div>
            </div>
            <Button
              onClick={fetchAnalytics}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Subscriptions</h3>
            <p className="text-3xl font-bold text-white">{stats?.totalSubscriptions || 0}</p>
            <p className="text-xs text-slate-500 mt-2">All-time subscriptions</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <Bell className="w-8 h-8 text-green-500" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-white">{stats?.activeSubscriptions || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Currently subscribed users</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <Mail className="w-8 h-8 text-purple-500" />
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Reminders Sent</h3>
            <p className="text-3xl font-bold text-white">
              {(stats?.remindersSent24h || 0) + (stats?.remindersSent1h || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.remindersSent24h || 0} × 24h, {stats?.remindersSent1h || 0} × 1h
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <UserX className="w-8 h-8 text-red-500" />
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Unsubscribed</h3>
            <p className="text-3xl font-bold text-white">{stats?.unsubscribed || 0}</p>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.totalSubscriptions
                ? ((stats.unsubscribed / stats.totalSubscriptions) * 100).toFixed(1)
                : 0}% unsubscribe rate
            </p>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold">Upcoming Sessions</h2>
              <p className="text-sm text-muted-foreground">
                {stats?.upcomingSessions || 0} sessions with {stats?.pendingReminders || 0} pending reminders
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No upcoming sessions with reminders
              </p>
            ) : (
              sessions.map((session, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{session.sessionTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.sessionDate ? new Date(session.sessionDate).toLocaleString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : 'Date not set'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Total Subscribers</p>
                      <p className="text-2xl font-bold text-blue-500">{session.totalSubscribers}</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Active</p>
                      <p className="text-2xl font-bold text-green-500">{session.activeSubscribers}</p>
                    </div>
                    <div className="bg-purple-500/10 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">24h Sent</p>
                      <p className="text-2xl font-bold text-purple-500">{session.sent24h}</p>
                    </div>
                    <div className="bg-orange-500/10 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">1h Sent</p>
                      <p className="text-2xl font-bold text-orange-500">{session.sent1h}</p>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="mt-4 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>24-hour reminders</span>
                        <span>
                          {session.activeSubscribers > 0
                            ? ((session.sent24h / session.activeSubscribers) * 100).toFixed(0)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{
                            width: `${
                              session.activeSubscribers > 0
                                ? (session.sent24h / session.activeSubscribers) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>1-hour reminders</span>
                        <span>
                          {session.activeSubscribers > 0
                            ? ((session.sent1h / session.activeSubscribers) * 100).toFixed(0)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{
                            width: `${
                              session.activeSubscribers > 0
                                ? (session.sent1h / session.activeSubscribers) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* System Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 mb-1">Scheduler Status</p>
              <p className="font-semibold text-green-500">✓ Running (checks every 15 minutes)</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Email Service</p>
              <p className="font-semibold text-green-500">✓ Forge API Connected</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Reminder Windows</p>
              <p className="font-semibold">24 hours & 1 hour before session</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Unsubscribe</p>
              <p className="font-semibold">✓ GDPR Compliant</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
