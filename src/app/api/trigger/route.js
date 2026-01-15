export async function POST(request) {
    try {
        const { cookies, pat } = await request.json();

        // Support both single cookie (legacy) and array of cookies
        let cookieArray = cookies;
        if (typeof cookies === 'string') {
            cookieArray = [cookies];
        }

        if (!cookieArray || cookieArray.length === 0 || !pat) {
            return Response.json(
                { error: 'Missing cookie data or PAT' },
                { status: 400 }
            );
        }

        // Call GitHub's repository dispatch API
        const response = await fetch(
            'https://api.github.com/repos/GeekAp09/Watch-Later-Manager/dispatches',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${pat}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_type: 'sync-watch-later',
                    client_payload: { cookies: cookieArray }
                }),
            }
        );

        if (response.ok || response.status === 204) {
            return Response.json({ success: true });
        } else {
            const errorText = await response.text();
            return Response.json(
                { error: `GitHub API error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }
    } catch (error) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
