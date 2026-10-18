import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Brain,
  MessageSquareQuote,
  Camera,
  Mic,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../services/api';
import { EmotionBadge, EMOTION_CONFIG } from '../components/EmotionBadge';

export function DashboardOverview({ onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, historyData] = await Promise.all([
        api.getAnalytics(),
        api.getHistory(null, null, 1, 5),
      ]);
      setAnalytics(analyticsData);
      setHistory(historyData.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format data for Recharts Pie Chart
  const pieData = analytics?.emotion_distribution?.map((item) => {
    const config = EMOTION_CONFIG[item.emotion.toLowerCase()] || EMOTION_CONFIG.neutral;
    const colors = {
      happiness: '#10b981',
      sadness: '#3b82f6',
      anger: '#ef4444',
      fear: '#a855f7',
      surprise: '#f59e0b',
      neutral: '#64748b',
    };
    return {
      name: config.label,
      value: item.count,
      percentage: item.percentage,
      color: colors[item.emotion.toLowerCase()] || '#64748b',
    };
  }) || [];

  // Format data for Recharts Area Chart
  const trendData = analytics?.daily_trends?.map((item) => ({
    date: item.date.slice(5), // MM-DD
    total: item.total,
  })) || [];

  // Format data for Recharts Modality Bar Chart
  const modalityData = analytics?.modality_distribution?.map((item) => ({
    modality: item.modality.toUpperCase(),
    count: item.count,
    percentage: item.percentage,
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome / Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-700/60 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              <Sparkles className="w-3 h-3" /> Live Multimodal Dashboard
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              AI Emotion Recognition System
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time multi-sensory emotion analysis synthesizing Natural Language Processing (NLP), OpenCV computer vision facial expression detection, and acoustic vocal prosody.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={() => onNavigate('presentation')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Viva & Project Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Analyses Run</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {analytics?.total_analyses ?? '--'}
          </div>
          <p className="text-[11px] text-slate-400">Across all sensory modalities</p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Model Confidence</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {analytics?.average_confidence ? `${(analytics.average_confidence * 100).toFixed(1)}%` : '--'}
          </div>
          <p className="text-[11px] text-slate-400">Continuous calibrated softmax</p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Dominant Detected Emotion</span>
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <div className="pt-1">
            {analytics?.top_emotion ? (
              <EmotionBadge emotion={analytics.top_emotion} size="md" />
            ) : (
              <span className="text-slate-500 text-sm">No data yet</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Highest aggregate frequency</p>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Sensory Channels</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400">
            3 <span className="text-xs font-normal text-slate-400">+ Fusion</span>
          </div>
          <p className="text-[11px] text-slate-400">Text NLP, Facial Vision, Vocal Prosody</p>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Emotion Distribution Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Emotion Category Breakdown</h3>
              <p className="text-xs text-slate-400">Overall class distribution</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">Run an analysis to render distribution chart</p>
            )}
          </div>
        </div>

        {/* Chart 2: Date-wise Activity Timeline */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Analysis Timeline Trends</h3>
              <p className="text-xs text-slate-400">Daily recognition sessions</p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Timeline appears after multiple day entries
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Modality Usage Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Modality Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution by sensory channel</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            {modalityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modalityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="modality" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No modality records found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launch Workspaces Shortcuts */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>Emotion Recognition Workspaces</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Text Launcher */}
          <div
            onClick={() => onNavigate('text')}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
              Text Emotion
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Classify typed sentences with calibrated probabilities and non-clinical reflections.
            </p>
          </div>

          {/* Face Launcher */}
          <div
            onClick={() => onNavigate('face')}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Facial Recognition
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Live webcam & photo face detection with OpenCV HUD and PyTorch neural expression scoring.
            </p>
          </div>

          {/* Voice Launcher */}
          <div
            onClick={() => onNavigate('voice')}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
              Voice Prosody
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Extract vocal pitch, acoustic energy, and tempo dynamics decoupled from speech content.
            </p>
          </div>

          {/* Multimodal Launcher */}
          <div
            onClick={() => onNavigate('multimodal')}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
              Multimodal Fusion
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Combine text and facial cues into a unified weighted decision fusion score.
            </p>
          </div>
        </div>
      </div>

      {/* Recent History Preview */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Emotion Analyses</h3>
            <p className="text-xs text-slate-400">Latest activity records saved to SQLite</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>View Full History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Modality</th>
                <th className="py-3 px-5">Input Snippet</th>
                <th className="py-3 px-5">Primary Emotion</th>
                <th className="py-3 px-5">Confidence</th>
                <th className="py-3 px-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono capitalize">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                        {item.modality}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-xs truncate text-slate-300">
                      {item.input_preview || '--'}
                    </td>
                    <td className="py-3.5 px-5">
                      <EmotionBadge emotion={item.primary_emotion} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-400">
                      {(item.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No recent analyses found. Start by entering text or capturing a webcam frame!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
