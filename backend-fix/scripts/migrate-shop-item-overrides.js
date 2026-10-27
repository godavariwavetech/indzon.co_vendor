// Run from the backend project on the server that hosts the affected database:
// node scripts/migrate-shop-item-overrides.js
// Creates the missing table only; existing products and orders are untouched.
const fs = require('fs');
const path = require('path');
const pool = require('../config/dbconnect').MySQLConPool;
const query = (sql, params = []) => new Promise((resolve, reject) => {
    pool.query(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
});

async function migrate() {
    const [database] = await query('SELECT DATABASE() AS name');
    if (database.name !== 'indzon_db') {
        throw new Error('Expected indzon_db. No database changes were made.');
    }
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20261023_shop_item_overrides.sql'), 'utf8');
    await query(sql);
    const columns = await query('SHOW COLUMNS FROM shop_item_overrides_t');
    for (const name of ['shop_id', 'catalogue', 'item_id', 'overrides']) {
        if (!columns.some(column => column.Field === name)) {
            throw new Error(`The overrides table is missing ${name}.`);
        }
    }
    console.log('Verified indzon_db.shop_item_overrides_t. Existing product and order data preserved.');
}

migrate().catch(error => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
}).finally(() => pool.end());
