'use client';

export default function VideoCard({ video }) {
    const thumbnailUrl = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;

    return (
        <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card"
        >
            <div className="video-thumbnail">
                <img src={thumbnailUrl} alt={video.title} loading="lazy" />
                <div className="play-overlay">▶</div>
            </div>
            <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-channel">{video.uploader || 'Unknown Channel'}</p>
            </div>
        </a>
    );
}
