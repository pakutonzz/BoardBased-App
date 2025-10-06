// scripts/import-csv.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const sequelize = require('../config/db');
const BoardGame = require('../models/BoardGame');

// helpers
function splitToArray(v) {
    if (v == null) return null;
    if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean);
    if (typeof v !== 'string') return [String(v).trim()];
    return v.split('|').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
}
function toInt(v) {
    if (v == null) return null;
    const s = String(v).trim();
    if (s === '' || s.toLowerCase() === 'null' || s === '-') return null;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
}
function toNonNegIntOrNull(v) {
    const n = toInt(v);
    return n != null && n < 0 ? null : n;
}
function toDec(v) {
    if (v == null) return null;
    const s = String(v).trim().replace(',', '.');
    if (s === '' || s.toLowerCase() === 'null' || s === '-') return null;
    const n = Number(s);
    return Number.isFinite(n) ? s : null; 
}
function toUrlOrNull(v) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
}
function normalizeRange(minVal, maxVal) {
    if (minVal == null && maxVal == null) return [null, null];
    if (minVal == null) minVal = maxVal;
    if (maxVal == null) maxVal = minVal;
    if (minVal != null && maxVal != null && minVal > maxVal) {
        const t = minVal; minVal = maxVal; maxVal = t;
    }
    return [minVal, maxVal];
}

(async () => {
    try {
        const csvPath = path.resolve(process.cwd(), process.argv[2] || 'boardgame.csv');
        if (!fs.existsSync(csvPath)) {
            console.error('CSV not found:', csvPath);
            process.exit(1);
        }

        await sequelize.authenticate();
        console.log('[db] Connection OK');
        await sequelize.sync({ alter: false });
        console.log('[db] Models synced');

        const input = fs.readFileSync(csvPath, 'utf8');
        const rows = parse(input, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        let fixed = 0, skipped = 0, total = rows.length;
        const payload = [];

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];

            let playersMin = toNonNegIntOrNull(r.players_min);
            let playersMax = toNonNegIntOrNull(r.players_max);
            let timeMin = toNonNegIntOrNull(r.time_min);
            let timeMax = toNonNegIntOrNull(r.time_max);

            const [pmin, pmax] = normalizeRange(playersMin, playersMax);
            const [tmin, tmax] = normalizeRange(timeMin, timeMax);
            if (pmin !== playersMin || pmax !== playersMax || tmin !== timeMin || tmax !== timeMax) fixed++;

            const record = {
                id: toNonNegIntOrNull(r.id),
                category: r.category || null,
                name: (r.name ?? '').trim(),
                description: r.description || null,

                playersMin: pmin,
                playersMax: pmax,
                timeMin: tmin,
                timeMax: tmax,
                agePlus: toNonNegIntOrNull(r.age_plus),

                weight5: toDec(r.weight_5),
                averageRating: toDec(r.average_rating),

                artists: splitToArray(r.artists),
                designers: splitToArray(r.designers),
                publishers: splitToArray(r.publishers),

                yearPublished: toNonNegIntOrNull(r.year),

                url: toUrlOrNull(r.url),
                imageUrl: toUrlOrNull(r.image_url),
                ogImage: toUrlOrNull(r.og_image),
                primaryImage: toUrlOrNull(r.primary_image),

                galleryImages: splitToArray(r.gallery_images),
                alternateNames: splitToArray(r.alternate_names),
            };

            if (!record.name) { skipped++; continue; }

            payload.push(record);
        }

        console.log(`Prepared ${payload.length} rows (fixed ranges in ${fixed}, skipped ${skipped} empty/invalid-name) of ${total}.`);

        const BATCH = 1000;
        for (let i = 0; i < payload.length; i += BATCH) {
            const chunk = payload.slice(i, i + BATCH);
            await BoardGame.bulkCreate(chunk, {
                validate: true,
                ignoreDuplicates: true, // respects unique url
            });
            console.log(`Inserted ${Math.min(i + BATCH, payload.length)} / ${payload.length}`);
        }

        console.log('Import completed.');
        process.exit(0);
    } catch (err) {
        if (err && Array.isArray(err.errors)) {
            console.error('Import failed with validation errors:');
            for (let i = 0; i < Math.min(10, err.errors.length); i++) {
                console.error('-', err.errors[i].errors?.[0]?.message || err.errors[i].message);
            }
        } else {
            console.error('Import failed:', err);
        }
        process.exit(1);
    }
})();
