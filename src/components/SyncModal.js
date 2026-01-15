'use client';

import { useState } from 'react';

export default function SyncModal({ isOpen, onClose }) {
    const [cookies, setCookies] = useState([{ id: 1, file: null, data: '' }]);
    const [pat, setPat] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const addCookie = () => {
        setCookies([...cookies, { id: Date.now(), file: null, data: '' }]);
    };

    const removeCookie = (id) => {
        if (cookies.length > 1) {
            setCookies(cookies.filter(c => c.id !== id));
        }
    };

    const handleFileChange = async (id, e) => {
        const file = e.target.files[0];
        if (file) {
            const text = await file.text();
            setCookies(cookies.map(c =>
                c.id === id ? { ...c, file, data: text } : c
            ));
        }
    };

    const handleSync = async () => {
        const cookieData = cookies.filter(c => c.data).map(c => c.data);

        if (cookieData.length === 0 || !pat) {
            setStatus({ type: 'error', message: 'Please add at least one cookie file and enter your PAT.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'loading', message: 'Triggering GitHub Action...' });

        try {
            const response = await fetch('/api/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cookies: cookieData, pat }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: '✓ Sync triggered! Check your GitHub Actions tab.' });
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to trigger action.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: `Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🔄 Sync Watch Later</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Cookie Files</label>
                        <div className="cookie-list">
                            {cookies.map((cookie, index) => (
                                <div key={cookie.id} className="cookie-item">
                                    <div className={`file-input-wrapper small ${cookie.file ? 'has-file' : ''}`}>
                                        <input
                                            type="file"
                                            accept=".txt"
                                            onChange={(e) => handleFileChange(cookie.id, e)}
                                        />
                                        {cookie.file ? (
                                            <span className="file-name">✓ {cookie.file.name}</span>
                                        ) : (
                                            <span className="file-text">Account {index + 1} - Click to upload</span>
                                        )}
                                    </div>
                                    {cookies.length > 1 && (
                                        <button
                                            className="btn-icon remove"
                                            onClick={() => removeCookie(cookie.id)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-secondary add-btn" onClick={addCookie}>
                            + Add Another Account
                        </button>
                    </div>

                    <div className="form-group">
                        <label>GitHub Personal Access Token</label>
                        <input
                            type="password"
                            placeholder="ghp_xxxxxxxxxxxxx"
                            value={pat}
                            onChange={(e) => setPat(e.target.value)}
                        />
                    </div>

                    {status.message && (
                        <div className={`status ${status.type}`}>
                            {status.type === 'loading' && <span className="spinner"></span>}
                            {status.message}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn" onClick={handleSync} disabled={loading}>
                        {loading ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
