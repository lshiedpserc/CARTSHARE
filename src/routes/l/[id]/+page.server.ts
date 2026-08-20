import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const listId = params.id;

    const list = db.prepare('SELECT id, created_at FROM Lists WHERE id = ?').get(listId) as any;

    if (!list) {
        throw error(404, 'List not found');
    }

    const items = db.prepare('SELECT * FROM Items WHERE list_id = ? ORDER BY sort_order ASC').all(listId);

    return {
        list,
        items
    };
};
