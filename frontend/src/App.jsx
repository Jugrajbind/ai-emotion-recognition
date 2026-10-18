import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardOverview } from './pages/DashboardOverview';
import { TextEmotionWorkspace } from './pages/TextEmotionWorkspace';
import { FacialEmotionWorkspace } from './pages/FacialEmotionWorkspace';
import { VoiceEmotionWorkspace } from './pages/VoiceEmotionWorkspace';
import { MultimodalWorkspace } from './pages/MultimodalWorkspace';
import { HistoryPage } from './pages/HistoryPage';
import { PresentationPage } from './pages/PresentationPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };
    checkUser();
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  // Tab Title & Subtitle Mapping
  const tabHeaders = {
    dashboard: {
      title: 'Executive Dashboard & Visual Analytics',
      subtitle: 'Overview of recognition metrics, emotion distributions, and recent tests',
    },
    text: {
      title: 'Text Emotion Recognition Workspace',
      subtitle: 'Classify sentences and paragraphs with calibrated probabilities',
    },
    face: {
      title: 'Facial Emotion Recognition (OpenCV HUD)',
      subtitle: 'Detect facial expressions in real-time through webcam or uploaded image',
    },
    voice: {
      title: 'Voice Prosody & Vocal Emotion Analysis',
      subtitle: 'Acoustic pitch, energy, and speaking cadence decoupled from speech content',
    },
    multimodal: {
      title: 'Multimodal Emotion Fusion Laboratory',
      subtitle: 'Ensemble combination of text and facial visual features',
    },
    history: {
      title: 'Analysis History & Export Reports',
      subtitle: 'Review, filter, and export recognition sessions to CSV format',
    },
    presentation: {
      title: 'College Viva Defense & Project Documentation Kit',
      subtitle: 'System architecture, problem formulation, model specs, and oral defense answers',
    },
    settings: {
      title: 'System Health & Model Status',
      subtitle: 'Verify FastAPI server endpoints, database connections, and ML inference engines',
    },
  };

  const currentHeader = tabHeaders[currentTab] || tabHeaders.dashboard;

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Scrollable Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'dashboard' && <DashboardOverview onNavigate={setCurrentTab} />}
          {currentTab === 'text' && <TextEmotionWorkspace />}
          {currentTab === 'face' && <FacialEmotionWorkspace />}
          {currentTab === 'voice' && <VoiceEmotionWorkspace />}
          {currentTab === 'multimodal' && <MultimodalWorkspace />}
          {currentTab === 'history' && <HistoryPage />}
          {currentTab === 'presentation' && <PresentationPage />}
          {currentTab === 'settings' && <SettingsPage user={user} onLogout={handleLogout} />}
        </main>
      </div>

      {/* Auth Modal for Sign In / Registration */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
