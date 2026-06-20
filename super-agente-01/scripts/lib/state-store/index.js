'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const initSqlJs = require('sql.js');

const { applyMigrations, getAppliedMigrations } = require('./migrations');
const { createQueryApi } = require('./queries');
const { assertValidEntity, validateEntity } = require('./schema');

const DEFAULT_STATE_STORE_RELATIVE_PATH = path.join('.claude', 'ecc', 'state.db');

function resolveStateStorePath(options = {}) {
  if (options.dbPath) {
    if (options.dbPath === ':memory:') {
      return options.dbPath;
    }
    return path.resolve(options.dbPath);
  }

  const homeDir = options.homeDir || process.env.HOME || os.homedir();
  return path.join(homeDir, DEFAULT_STATE_STORE_RELATIVE_PATH);
}

/**
 * Encapsula um Database do sql.js com uma superfície de API compatível com
 * better-sqlite3, de modo que o restante do código do state-store
 * (migrations.js, queries.js) possa operar sem saber qual driver está em uso.
 *
 * IMPORTANTE: o db.export() do sql.js encerra implicitamente qualquer transação
 * ativa, então devemos adiar todas as gravações em disco até que a transação
 * seja confirmada (commit).
 */
function wrapSqlJsDatabase(rawDb, dbPath) {
  let inTransaction = false;

  function saveToDisk() {
    if (dbPath === ':memory:' || inTransaction) {
      return;
    }
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }

  const db = {
    exec(sql) {
      rawDb.run(sql);
      saveToDisk();
    },

    pragma(pragmaStr) {
      try {
        rawDb.run(`PRAGMA ${pragmaStr}`);
      } catch (_error) {
        // Ignora pragmas não suportados (ex.: WAL para bancos de dados em memória).
      }
    },

    prepare(sql) {
      return {
        all(...positionalArgs) {
          const stmt = rawDb.prepare(sql);
          if (positionalArgs.length === 1 && typeof positionalArgs[0] !== 'object') {
            stmt.bind([positionalArgs[0]]);
          } else if (positionalArgs.length > 1) {
            stmt.bind(positionalArgs);
          }

          const rows = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          stmt.free();
          return rows;
        },

        get(...positionalArgs) {
          const stmt = rawDb.prepare(sql);
          if (positionalArgs.length === 1 && typeof positionalArgs[0] !== 'object') {
            stmt.bind([positionalArgs[0]]);
          } else if (positionalArgs.length > 1) {
            stmt.bind(positionalArgs);
          }

          let row = null;
          if (stmt.step()) {
            row = stmt.getAsObject();
          }
          stmt.free();
          return row;
        },

        run(namedParams) {
          const stmt = rawDb.prepare(sql);
          if (namedParams && typeof namedParams === 'object' && !Array.isArray(namedParams)) {
            const sqlJsParams = {};
            for (const [key, value] of Object.entries(namedParams)) {
              sqlJsParams[`@${key}`] = value === undefined ? null : value;
            }
            stmt.bind(sqlJsParams);
          }
          stmt.step();
          stmt.free();
          saveToDisk();
        },
      };
    },

    transaction(fn) {
      return (...args) => {
        rawDb.run('BEGIN');
        inTransaction = true;
        try {
          const result = fn(...args);
          rawDb.run('COMMIT');
          inTransaction = false;
          saveToDisk();
          return result;
        } catch (error) {
          try {
            rawDb.run('ROLLBACK');
          } catch (_rollbackError) {
            // A transação pode já ter sido revertida (rollback).
          }
          inTransaction = false;
          throw error;
        }
      };
    },

    close() {
      saveToDisk();
      rawDb.close();
    },
  };

  return db;
}

async function openDatabase(SQL, dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  let rawDb;
  if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    rawDb = new SQL.Database(fileBuffer);
  } else {
    rawDb = new SQL.Database();
  }

  const db = wrapSqlJsDatabase(rawDb, dbPath);
  db.pragma('foreign_keys = ON');
  try {
    db.pragma('journal_mode = WAL');
  } catch (_error) {
    // Alguns ambientes SQLite rejeitam WAL em contextos em memória ou somente leitura.
  }
  return db;
}

async function createStateStore(options = {}) {
  const dbPath = resolveStateStorePath(options);
  const SQL = await initSqlJs();
  const db = await openDatabase(SQL, dbPath);
  const appliedMigrations = applyMigrations(db);
  const queryApi = createQueryApi(db);

  return {
    dbPath,
    close() {
      db.close();
    },
    getAppliedMigrations() {
      return getAppliedMigrations(db);
    },
    validateEntity,
    assertValidEntity,
    ...queryApi,
    _database: db,
    _migrations: appliedMigrations,
  };
}

module.exports = {
  DEFAULT_STATE_STORE_RELATIVE_PATH,
  createStateStore,
  resolveStateStorePath,
};
