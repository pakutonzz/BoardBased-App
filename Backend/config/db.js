// config/db.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

function resolveMaybe(p) {
  if (!p) return null;
  const abs = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
  return fs.existsSync(abs) ? abs : null;
}

const {
  USE_SQLITE,

  SQLITE_PATH = './dev.sqlite3',

  DB_URL,
  PGHOST,
  PGPORT,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,

  PGSSLMODE,      
  PGSSLROOTCERT,   

  POOL_MIN = '0',
  POOL_MAX = '10',
  POOL_IDLE_MS = '10000',
  POOL_ACQUIRE_MS = '10000',
} = process.env;

const useSQLite =
  String(USE_SQLITE || '').toLowerCase() === 'true' ||
  (!DB_URL && !PGHOST); 

let sequelize;

if (useSQLite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: SQLITE_PATH,
    logging: false,
    pool: {
      min: Number(POOL_MIN),
      max: Number(POOL_MAX),
      idle: Number(POOL_IDLE_MS),
      acquire: Number(POOL_ACQUIRE_MS),
    },
  });
  console.log(`[db] Using SQLite at ${SQLITE_PATH}`);
} else {
  const wantSSL = (PGSSLMODE || '').toLowerCase() === 'require';
  const caPath = resolveMaybe(PGSSLROOTCERT);

  let dialectOptions = {};
  if (wantSSL) {
    if (caPath) {
      dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: true,
        ca: fs.readFileSync(caPath, 'utf8'),
      };
    } else {
      console.warn('[db] PGSSLMODE=require but no PGSSLROOTCERT provided. Using rejectUnauthorized:false (dev only).');
      dialectOptions.ssl = { require: true, rejectUnauthorized: false };
    }
  }

  sequelize = DB_URL
    ? new Sequelize(DB_URL, {
      dialect: 'postgres',
      dialectOptions,
      logging: false,
      pool: {
        min: Number(POOL_MIN),
        max: Number(POOL_MAX),
        idle: Number(POOL_IDLE_MS),
        acquire: Number(POOL_ACQUIRE_MS),
      },
    })
    : new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
      host: PGHOST,
      port: PGPORT ? Number(PGPORT) : 5432,
      dialect: 'postgres',
      dialectOptions,
      logging: false,
      pool: {
        min: Number(POOL_MIN),
        max: Number(POOL_MAX),
        idle: Number(POOL_IDLE_MS),
        acquire: Number(POOL_ACQUIRE_MS),
      },
    });

  console.log('[db] Using Postgres');
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[db] Connection OK');
  } catch (err) {
    console.error('[db] Connection failed:', err.message);
  }
})();

module.exports = sequelize;
