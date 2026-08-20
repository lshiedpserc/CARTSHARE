import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
        throw error(400, 'Image URL is required');
    }

    try {
        const response = await fetch(imageUrl, {
            headers: {
                // Some servers block requests without a typical User-Agent or Referer
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            }
        });

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch image');
        }

        const buffer = await response.arrayBuffer();

        return new Response(buffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000',
                // Allow CORS for the frontend to access it (though typically accessed via img tag where CORS isn't strictly necessary, it's good practice for proxy)
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        console.error('Image proxy error:', err);
        throw error(500, 'Internal Server Error');
    }
};
