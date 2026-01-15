'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import SetupModal from '@/components/SetupModal';
import SyncModal from '@/components/SyncModal';
import VideoCard from '@/components/VideoCard';

export default function Home() {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [config, setConfig] = useState(null);
    const [showSetup, setShowSetup] = useState(false);
    const [showSync, setShowSync] = useState(false);

    // Load config and fetch videos on mount
    useEffect(() => {
        const saved = localStorage.getItem('wlm-config');
        if (saved) {
            const parsedConfig = JSON.parse(saved);
            setConfig(parsedConfig);
            if (parsedConfig.repoUrl) {
                fetchVideos(parsedConfig);
            }
        }
    }, []);

    // Filter videos when search query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredVideos(videos);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredVideos(
                videos.filter(v =>
                    v.title?.toLowerCase().includes(query) ||
                    v.uploader?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, videos]);

    const fetchVideos = async (cfg) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl: cfg.repoUrl, token: cfg.token }),
            });
            const data = await response.json();

            if (response.ok && data.videos) {
                setVideos(data.videos);
                setFilteredVideos(data.videos);
            } else {
                setError(data.error || 'Failed to load videos');
            }
        } catch (err) {
            setError('Failed to fetch videos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfigSave = (newConfig) => {
        setConfig(newConfig);
        if (newConfig.repoUrl) {
            fetchVideos(newConfig);
        }
    };

    const handleRefresh = () => {
        if (config?.repoUrl) {
            fetchVideos(config);
        }
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <div className="logo-icon small">▶</div>
                    <h1>Watch Later Manager</h1>
                </div>
                <div className="header-right">
                    <button className="btn btn-secondary" onClick={() => setShowSetup(true)}>
                        ⚙️ Setup
                    </button>
                    <button className="btn" onClick={() => setShowSync(true)}>
                        🔄 Sync
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                {/* Search Bar */}
                <div className="search-section">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by title or channel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
                        )}
                    </div>
                    <button className="btn btn-icon" onClick={handleRefresh} title="Refresh">
                        🔄
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="stats-bar">
                    <span>{filteredVideos.length} videos</span>
                    {searchQuery && <span className="stats-filter">filtered from {videos.length}</span>}
                </div>

                {/* Content */}
                {!config?.repoUrl ? (
                    <div className="empty-state">
                        <div className="empty-icon">⚙️</div>
                        <h2>Setup Required</h2>
                        <p>Configure your repository to view your Watch Later videos</p>
                        <button className="btn" onClick={() => setShowSetup(true)}>
                            Setup Now
                        </button>
                    </div>
                ) : loading ? (
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Loading videos...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <p>{error}</p>
                        <button className="btn btn-secondary" onClick={handleRefresh}>
                            Try Again
                        </button>
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📺</div>
                        <h2>No Videos Found</h2>
                        <p>{searchQuery ? 'Try a different search term' : 'Sync your Watch Later playlist to get started'}</p>
                    </div>
                ) : (
                    <div className="video-grid">
                        {filteredVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            <SetupModal
                isOpen={showSetup}
                onClose={() => setShowSetup(false)}
                onSave={handleConfigSave}
            />
            <SyncModal
                isOpen={showSync}
                onClose={() => setShowSync(false)}
            />
        </div>
    );
}
