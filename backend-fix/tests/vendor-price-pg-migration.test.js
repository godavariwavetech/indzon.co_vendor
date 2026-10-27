const test = require('node:test');
const assert = require('node:assert/strict');
const {PGlite} = require('@electric-sql/pglite');
const {migrate} = require('../scripts/migrate-vendor-prices-pg');

test('PostgreSQL migration creates the missing price table and preserves vendor overrides on rerun', async () => {
    const db = new PGlite();
    try {
        await migrate(db);
        await db.query('INSERT INTO shop_item_overrides_t VALUES ($1,$2,$3,$4)', [4, 'catalogue', 5, '{"selling_price":"84000"}']);
        await migrate(db);
        const {rows} = await db.query('SELECT * FROM shop_item_overrides_t');
        assert.deepEqual(rows, [{shop_id: 4, catalogue: 'catalogue', item_id: 5, overrides: '{"selling_price":"84000"}'}]);
        await assert.rejects(db.query('INSERT INTO shop_item_overrides_t VALUES ($1,$2,$3,$4)', [4, 'catalogue', 5, '{}']));
    } finally {
        await db.close();
    }
});

test('PostgreSQL migration rolls back and reports failed table creation', async () => {
    const calls = [];
    const failure = new Error('permission denied');
    await assert.rejects(migrate({query: async sql => {
        calls.push(sql);
        if (sql.startsWith('CREATE TABLE')) throw failure;
    }}), failure);
    assert.equal(calls.at(-1), 'ROLLBACK');
    assert.equal(calls.includes('COMMIT'), false);
});
