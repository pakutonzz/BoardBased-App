// utils/sort.js
function parseSort(sortParam, fallback = [['id', 'ASC']]) {
    if (!sortParam) return fallback;
    const items = String(sortParam)
        .split(',')
        .map(part => {
            const [col, dir = 'asc'] = part.split(':');
            const c = col && col.trim();
            const d = String(dir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            return c ? [c, d] : null;
        })
        .filter(Boolean);
    return items.length ? items : fallback;
}

module.exports = { parseSort };
