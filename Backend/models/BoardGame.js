// models/BoardGame.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Helper: normalize strings like "a | b | c" => ["a","b","c"]
function splitToArray(v) {
    if (v == null) return null;
    if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean);
    if (typeof v !== 'string') return [String(v).trim()];
    return v
        .split('|')
        .map(s => s.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
}

const BoardGame = sequelize.define('BoardGame', {
    // ── Basic text/meta ────────────────────────────────────────────────────────────
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // ── Player & time info ────────────────────────────────────────────────────────
    playersMin: {
        field: 'players_min',
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 }
    },
    playersMax: {
        field: 'players_max',
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 }
    },
    timeMin: {
        field: 'time_min',
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'minutes',
        validate: { min: 0 }
    },
    timeMax: {
        field: 'time_max',
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'minutes',
        validate: { min: 0 }
    },
    agePlus: {
        field: 'age_plus',
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 }
    },

    // ── Ratings/weights ──────────────────────────────────────────────────────────
    weight5: {
        field: 'weight_5',
        type: DataTypes.DECIMAL(3, 2), // 0.00–5.00
        allowNull: true,
        validate: { min: 0, max: 5 }
    },
    averageRating: {
        field: 'average_rating',
        type: DataTypes.DECIMAL(4, 2), // 0.00–10.00 (adjust if needed)
        allowNull: true,
        validate: { min: 0, max: 10 }
    },

    // ── Credits (auto-parse " | " lists) ─────────────────────────────────────────
    artists: {
        type: DataTypes.JSON, // array of strings
        allowNull: true,
        set(v) { this.setDataValue('artists', splitToArray(v)); }
    },
    designers: {
        type: DataTypes.JSON,
        allowNull: true,
        set(v) { this.setDataValue('designers', splitToArray(v)); }
    },
    publishers: {
        type: DataTypes.JSON,
        allowNull: true,
        set(v) { this.setDataValue('publishers', splitToArray(v)); }
    },

    // ── Year / links ─────────────────────────────────────────────────────────────
    yearPublished: {
        field: 'year',
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 }
    },
    url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        unique: true,
        validate: { isUrl: true }
    },
    imageUrl: {
        field: 'image_url',
        type: DataTypes.STRING(2048),
        allowNull: true,
        validate: { isUrl: true }
    },
    ogImage: {
        field: 'og_image',
        type: DataTypes.STRING(2048),
        allowNull: true,
        validate: { isUrl: true }
    },
    primaryImage: {
        field: 'primary_image',
        type: DataTypes.STRING(2048),
        allowNull: true,
        validate: { isUrl: true }
    },

    // Pipe-separated -> array
    galleryImages: {
        field: 'gallery_images',
        type: DataTypes.JSON,
        allowNull: true,
        set(v) { this.setDataValue('galleryImages', splitToArray(v)); }
    },

    alternateNames: {
        field: 'alternate_names',
        type: DataTypes.JSON,
        allowNull: true,
        set(v) { this.setDataValue('alternateNames', splitToArray(v)); }
    }
}, {
    tableName: 'BoardGames',
    freezeTableName: true,
    timestamps: true,
    underscored: false,
    indexes: [
        { fields: ['category'] },
        { fields: ['average_rating'] },
        { fields: ['players_min', 'players_max'] }
    ],
    validate: {
        playersRange() {
            if (this.playersMin != null && this.playersMax != null && this.playersMin > this.playersMax) {
                throw new Error('playersMin must be ≤ playersMax');
            }
            if (this.timeMin != null && this.timeMax != null && this.timeMin > this.timeMax) {
                throw new Error('timeMin must be ≤ timeMax');
            }
        }
    }
});

module.exports = BoardGame;
