// utils/csv.js
function escapeCsvValue(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') v = JSON.stringify(v);
    v = String(v);
    if (/[",\n]/.test(v)) v = `"${v.replace(/"/g, '""')}"`;
    return v;
}

function rowsToCsv(rows, columns) {
    const header = columns.join(',');
    const body = rows.map(r => columns.map(c => escapeCsvValue(r[c])).join(','));
    return [header, ...body].join('\n');
}

module.exports = { escapeCsvValue, rowsToCsv };
