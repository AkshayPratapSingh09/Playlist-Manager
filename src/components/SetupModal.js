'use client';

import { useState, useEffect } from 'react';

export default function SetupModal({ isOpen, onClose, onSave }) {
    const [repoUrl, setRepoUrl] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        // Load saved config from localStorage
        const saved = localStorage.getItem('wlm-config');
        if (saved) {
            const config = JSON.parse(saved);
            setRepoUrl(config.repoUrl || '');
            setToken(config.token || '');
        }
    }, [isOpen]);

    const handleSave = () => {
        const config = { repoUrl, token };
        localStorage.setItem('wlm-config', JSON.stringify(config));
        onSave(config);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚙️ Setup Configuration</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Videos.json URL</label>
                        <input
                            type="text"
                            placeholder="https://github.com/user/repo/blob/main/videos.json"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                        />
                        <span className="hint">GitHub file URL to your videos.json</span>
                    </div>

                    <div className="form-group">
                        <label>GitHub Token (optional for private repos)</label>
                        <input
                            type="password"
                            placeholder="ghp_xxxxxxxxxxxxx"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                        <span className="hint">Only needed for private repositories</span>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn" onClick={handleSave}>Save Configuration</button>
                </div>
            </div>
        </div>
    );
}
