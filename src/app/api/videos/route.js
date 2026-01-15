export async function POST(request) {
    try {
        const { repoUrl, token } = await request.json();

        if (!repoUrl) {
            return Response.json({ error: 'Missing repo URL' }, { status: 400 });
        }

        // Convert GitHub repo URL to raw content URL
        // Expected format: https://github.com/user/repo or raw file URL
        let rawUrl = repoUrl;

        if (repoUrl.includes('github.com') && !repoUrl.includes('raw.githubusercontent.com')) {
            // Convert: https://github.com/user/repo/blob/main/videos.json
            // To: https://raw.githubusercontent.com/user/repo/main/videos.json
            rawUrl = repoUrl
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');
        }

        const headers = {
            'Accept': 'application/json',
        };

        // Add auth token if provided (for private repos)
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(rawUrl, { headers });

        if (!response.ok) {
            return Response.json(
                { error: `Failed to fetch videos: ${response.status}` },
                { status: response.status }
            );
        }

        const videos = await response.json();
        return Response.json({ videos });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
