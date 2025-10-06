// controllers/boardGame.controller.js
const asyncHandler = require('../middleware/asyncHandler');
const { rowsToCsv } = require('../utils/csv');
const { parseSort } = require('../utils/sort');
const { buildWhere } = require('../utils/query');
const { Op } = require('sequelize');
const svc = require('../services/boardGame.service');

// ---- helpers ----
function parseRange(q) {
    if (q.range) {
        const m = String(q.range).match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
        if (m) return { start: Number(m[1]), end: Number(m[2]) };
    }
    if (q.start && q.end) {
        const s = Number(q.start), e = Number(q.end);
        if (Number.isInteger(s) && Number.isInteger(e)) return { start: s, end: e };
    }
    return null;
}
function clampRange({ start, end }, maxSpan = 500) {
    if (end < start) [start, end] = [end, start];
    const span = end - start + 1;
    if (span > maxSpan) end = start + maxSpan - 1;
    return { start, end };
}

// ---- CREATE ----
exports.create = asyncHandler(async (req, res) => {
    const row = await svc.create(req.body);
    res.status(201).json(row);
});

// ---- LIST (supports q, category*, range, random-by-default) ----
exports.list = asyncHandler(async (req, res) => {
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const whereBase = buildWhere(req.query);
    const categoryParam =
        (req.query.category && String(req.query.category)) ||
        (req.query.categoryLike && String(req.query.categoryLike)) ||
        (req.query.categories && String(req.query.categories)) ||
        null;

    // 1) Range mode
    const rawRange = parseRange(req.query);
    if (rawRange) {
        let { start, end } = clampRange(rawRange, 500);
        const where = { ...whereBase, id: { [Op.gte]: start, [Op.lte]: end } };
        const rows = await svc.findAll(where, [['id', 'ASC']]);
        const total = await svc.count(buildWhere(req.query));
        return res.json({ total, Size: rows.length, category: categoryParam, rows });
    }

    // 2) Random mode (default)
    let useRandom = true;
    if (typeof req.query.random !== 'undefined') {
        const val = String(req.query.random).toLowerCase();
        useRandom = ['1', 'true', 'yes', 'y'].includes(val);
    }
    if (req.query.sort) {
        useRandom = String(req.query.sort).toLowerCase() === 'random';
    }

    if (useRandom) {
        const rows = await svc.findRandom(whereBase, pageSize);
        const total = await svc.count(whereBase);
        return res.json({ total, Size: rows.length, category: categoryParam, rows });
    }

    // 3) Deterministic list (honors page/pageSize); response trimmed
    const page = Math.max(1, Number(req.query.page) || 1);
    const order = parseSort(req.query.sort, [['id', 'ASC']]);
    const { rows, count } = await svc.findAndCount(whereBase, order, pageSize, (page - 1) * pageSize);
    return res.json({ total: count, Size: rows.length, category: categoryParam, rows });
});

// ---- READ ----
exports.read = asyncHandler(async (req, res) => {
    const row = await svc.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
});

// ---- UPDATE ----
exports.update = asyncHandler(async (req, res) => {
    const row = await svc.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
});

// ---- DELETE ----
exports.remove = asyncHandler(async (req, res) => {
    const row = await svc.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.destroy();
    res.status(204).end();
});

// ---- CSV EXPORT (respects q + category filters) ----
exports.exportCsv = asyncHandler(async (req, res) => {
    const where = buildWhere(req.query);
    const order = parseSort(req.query.sort, [['id', 'ASC']]);

    // fetch all rows (no attribute restriction)
    const rows = await svc.findAll(where, order);

    // get plain JS objects
    const plain = rows.map(r => (typeof r.get === 'function' ? r.get({ plain: true }) : r));

    // If caller provides ?columns=id,name,... use that
    let columns;
    if (req.query.columns) {
        columns = String(req.query.columns)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    } else {
        // Build a preferred order first, then append any remaining keys we find
        const preferred = [
            'id', 'name', 'category',
            'averageRating', 'average_rating',
            'playersMin', 'min_players', 'playersMax', 'max_players',
            'timeMin', 'min_playtime', 'timeMax', 'max_playtime',
            'agePlus', 'yearPublished', 'year_published',
            'weight5',
            'description',
            'url',
            'imageUrl', 'primaryImage', 'ogImage',
            'galleryImages', 'designers', 'artists', 'publishers',
            'createdAt', 'updatedAt'
        ];

        const keySet = new Set();
        for (const obj of plain) {
            Object.keys(obj).forEach(k => keySet.add(k));
        }

        // start with preferred keys that exist
        columns = preferred.filter(k => keySet.has(k));
        // then append any remaining keys we discovered
        for (const k of keySet) if (!columns.includes(k)) columns.push(k);
    }

    const csv = rowsToCsv(plain, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="board-games.csv"');
    res.send(csv);
});

