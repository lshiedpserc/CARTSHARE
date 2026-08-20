import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { nanoid } from 'nanoid';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { items } = await request.json();

        const listId = nanoid(8);
        const editToken = nanoid(32);

        const insertList = db.prepare('INSERT INTO Lists (id, edit_token) VALUES (?, ?)');
        const insertItem = db.prepare(`
            INSERT INTO Items (id, list_id, url, title, image_url, price, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const transaction = db.transaction((listId, editToken, items) => {
            insertList.run(listId, editToken);
            items.forEach((item: any, index: number) => {
                insertItem.run(
                    nanoid(8),
                    listId,
                    item.url || '',
                    item.title,
                    item.imageUrl,
                    item.price || '',
                    index
                );
            });
        });

        transaction(listId, editToken, items);

        return json({
            listId,
            editToken
        });
    } catch (error) {
        console.error('List save error:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
