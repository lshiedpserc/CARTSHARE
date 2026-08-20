import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, params }) => {
    try {
        const listId = params.id;
        const { items, editToken } = await request.json();

        // 権限チェック
        const list = db.prepare('SELECT edit_token FROM Lists WHERE id = ?').get(listId) as any;
        if (!list) {
            return json({ error: 'List not found' }, { status: 404 });
        }
        if (list.edit_token !== editToken) {
            return json({ error: 'Unauthorized' }, { status: 403 });
        }

        const deleteItems = db.prepare('DELETE FROM Items WHERE list_id = ?');
        const insertItem = db.prepare(`
            INSERT INTO Items (id, list_id, url, title, image_url, price, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const transaction = db.transaction((listId, items) => {
            deleteItems.run(listId);
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

        transaction(listId, items);

        return json({ success: true });
    } catch (error) {
        console.error('List update error:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
