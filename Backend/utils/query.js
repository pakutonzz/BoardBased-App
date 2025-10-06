// utils/query.js
const { Op } = require('sequelize');

function buildWhere(query) {
    const where = {};
    const { q, category, categoryLike, categories } = query || {};

    // ----- category filters -----
    const likeOp = Op.iLike || Op.like;

    if (category && String(category).trim().length) {
        // case-insensitive exact (no wildcards)
        where.category = { [likeOp]: String(category).trim() };
    }

    if (categoryLike && String(categoryLike).trim().length) {
        // substring, case-insensitive
        where.category = { [likeOp]: `%${String(categoryLike).trim()}%` };
    }

    if (categories && String(categories).trim().length) {
        const list = String(categories)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        if (list.length) {
            // OR together case-insensitive equals for each provided category
            where[Op.or] = list.map(c => ({ category: { [likeOp]: c } }));
        }
    }

    // ----- keyword search on "name" -----
    if (q && String(q).trim().length) {
        const tokens = String(q).trim().split(/\s+/);
        const nameLike = likeOp;
        where[Op.and] = [
            ...(where[Op.and] || []),
            ...tokens.map(t => ({ name: { [nameLike]: `%${t}%` } })),
        ];
    }

    return where;
}

module.exports = { buildWhere };
