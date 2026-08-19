import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';
import type { RequestHandler } from './$types';

const USER_AGENT = 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { url } = await request.json();

        if (!url) {
            return json({ error: 'URL is required' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
            }
        });

        if (!response.ok) {
            return json({ error: 'Failed to fetch the URL' }, { status: response.status });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        let title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Unknown Title';
        const imageUrl = $('meta[property="og:image"]').attr('content') || null;

        // GitHubなどのタイトルに余分な改行が含まれることがあるためクリーニング
        title = title.replace(/\n/g, ' ').trim();

        let domain = '';
        try {
            domain = new URL(url).hostname;
        } catch (e) {
            domain = 'unknown';
        }

        return json({
            title,
            imageUrl,
            domain
        });

    } catch (error) {
        console.error('Scraping error:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
