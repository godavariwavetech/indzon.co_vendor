const test = require('node:test');
const assert = require('node:assert/strict');
const {createShopItemsReader, createShopItemsWriter} = require('../utils/shop-items');

function fixture(shared = true) {
    const calls = [];
    const overrides = new Map();
    const columns = ['id', 'category_id', 'item_name', 'd_in', 'actual_price', 'selling_price', 'tax_percent', 'active_status', ...(!shared ? ['shop_id'] : [])];
    const pool = {query(sql, args, callback) {
        calls.push({sql, args});
        if (sql.startsWith('SELECT id, category_id')) return callback(null, [{id: Number(args[0]), category_id: 12, shop_items_tb_nm: 'catalogue'}]);
        if (sql.startsWith('SELECT shop_items_tb_nm')) return callback(null, [{shop_items_tb_nm: 'catalogue'}]);
        if (sql.startsWith('SHOW COLUMNS')) return callback(null, columns.map(Field => ({Field})));
        if (sql.startsWith('SELECT ??')) return callback(null, [{id: 2, item_name: 'Phone', actual_price: 100, selling_price: 90}]);
        if (sql.startsWith('SELECT item_id')) return callback(null, overrides.has(args[0]) ? [{item_id: 2, overrides: JSON.stringify(overrides.get(args[0]))}] : []);
        if (sql.startsWith('INSERT INTO shop_item_overrides_t')) {
            overrides.set(args[0], {...overrides.get(args[0]), ...JSON.parse(args[3])});
            return callback(null, {affectedRows: 1});
        }
        if (sql.startsWith('UPDATE ??')) return callback(null, {affectedRows: 1});
        callback(new Error(`Unexpected query: ${sql}`));
    }};
    return {calls, read: createShopItemsReader(pool), write: createShopItemsWriter(pool)};
}

test('shared prices and availability apply to one vendor and never update the base catalogue', async () => {
    const {read, write, calls} = fixture();
    await write({shop_id: 4, id: 2, selling_price: 80});
    await write({shop_id: 4, id: 2, active_status: '1'});
    const [edited] = await read({shop_id: 4});
    const [other] = await read({shop_id: 5});
    assert.equal(edited.selling_price, 80);
    assert.equal(edited.active_status, '1');
    assert.equal(other.selling_price, 90);
    assert.equal(other.active_status, undefined);
    assert.equal(calls.some(call => call.sql.startsWith('UPDATE')), false);
});

test('owned catalogue updates retain shop scope and map tax column without overwriting omitted fields', async () => {
    const {write, calls} = fixture(false);
    await write({shop_id: 4, id: 2, selling_price: 80, item_gst: 5});
    const update = calls.find(call => call.sql.startsWith('UPDATE'));
    assert.deepEqual(update.args, ['catalogue', 'selling_price', 80, 'tax_percent', 5, 2, 4]);
    assert.match(update.sql, /shop_id = \? AND d_in = 0/);
});

test('invalid prices and missing products never write', async () => {
    const {write, calls} = fixture();
    for (const patch of [{selling_price: ''}, {selling_price: -1}, {selling_price: 'bad'}, {selling_price: 200}, {active_status: '3'}]) {
        await assert.rejects(write({shop_id: 4, id: 2, ...patch}));
    }
    await assert.rejects(write({shop_id: 4, id: 99, selling_price: 50}));
    assert.equal(calls.some(call => /^(INSERT|UPDATE)/.test(call.sql)), false);
});
