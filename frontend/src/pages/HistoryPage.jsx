import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../services/api';
import { EmotionBadge } from '../components/EmotionBadge';

export function HistoryPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalityFilter, setModalityFilter] = useState('all');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [message, setMessage] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(modalityFilter, emotionFilter, page, 20);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [modalityFilter, emotionFilter, page]);

  const handleDeleteItem = async (id) => {
    try {
      await api.deleteHistoryItem(id);
      setMessage('Record deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to delete record.');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearAllHistory();
      setDeleteConfirm(false);
      setMessage('All history records cleared.');
      setTimeout(() => setMessage(''), 3000);
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to clear history.');
    }
  };

  // Filter client-side by search query if text matches input_preview
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    return (
      (item.input_preview && item.input_preview.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.primary_emotion && item.primary_emotion.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Analysis History & Export Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted recognition records with timestamps, confidence scores, and CSV export.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href={api.getExportCsvUrl()}
            download="emotion_analysis_report.csv"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </a>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800/40 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-800/60 p-1 rounded-xl text-xs">
              <span className="text-[11px] text-rose-300 px-2 font-medium">Delete all?</span>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-500"
              >
                Yes
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {message && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Modality Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Modality:</span>
            <select
              value={modalityFilter}
              onChange={(e) => {
                setModalityFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Modalities</option>
              <option value="text">Text NLP</option>
              <option value="face">Facial Vision</option>
              <option value="voice">Voice Prosody</option>
              <option value="multimodal">Multimodal Fused</option>
            </select>
          </div>

          {/* Emotion Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>Emotion:</span>
            <select
              value={emotionFilter}
              onChange={(e) => {
                setEmotionFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="happiness">Happiness (Joy)</option>
              <option value="sadness">Sadness</option>
              <option value="anger">Anger</option>
              <option value="fear">Fear</option>
              <option value="surprise">Surprise</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search input text or emotion..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* History Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Modality</th>
                <th className="py-3 px-5">Input Descriptor</th>
                <th className="py-3 px-5">Primary Emotion</th>
                <th className="py-3 px-5">Confidence</th>
                <th className="py-3 px-5">Supportive Guidance</th>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-500">#{item.id}</td>
                    <td className="py-3.5 px-5 capitalize">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                        {item.modality}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-xs truncate text-slate-200">
                      {item.input_preview || '--'}
                    </td>
                    <td className="py-3.5 px-5">
                      <EmotionBadge emotion={item.primary_emotion} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 font-mono text-emerald-400 font-semibold">
                      {(item.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-5 max-w-sm truncate text-slate-400 italic">
                      "{item.non_clinical_response || '--'}"
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete record"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {loading ? 'Loading analysis history...' : 'No matching history records found.'}
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
