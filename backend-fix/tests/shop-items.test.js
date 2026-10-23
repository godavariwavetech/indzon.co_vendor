const test = require('node:test');
const assert = require('node:assert/strict');
const {createShopItemsReader} = require('../utils/shop-items');

function fixture({shared = false, registered = true, items = [], shop = true} = {}) {
    const calls = [];
    const pool = {query(sql, args, callback) {
        calls.push({sql, args});
        if (sql.startsWith('SELECT id, category_id')) return callback(null, shop ? [{id: 7, category_id: 10, shop_items_tb_nm: 'catalogue', admin_percentage: 5}] : []);
        if (sql.startsWith('SHOW COLUMNS')) return callback(null, ['id', 'item_name', 'd_in', 'category_id', 'item_description', 'tax_percent', 'active_status', ...(!shared ? ['shop_id'] : [])].map(Field => ({Field})));
        if (sql.startsWith('SELECT shop_items_tb_nm')) return callback(null, [{shop_items_tb_nm: registered ? 'catalogue' : 'another_catalogue'}]);
        return callback(null, items);
    }};
    return {read: createShopItemsReader(pool), calls};
}

test('shop inventory is filtered by selected shop; client table override is ignored', async () => {
    const {read, calls} = fixture({items: [{id: 1, item_name: 'Rice', active_status: 1}]});
    const result = await read({shop_id: 7, shop_items_tb_nm: 'another_shop'});
    assert.deepEqual(calls.at(-1).args.slice(1), ['catalogue', 'shop_id', 7]);
    assert.equal(result[0].shop_id, 7);
    assert.equal(result[0].active_status, 1);
});
test('registered shared catalogue is filtered by category and normalizes optional fields', async () => {
    const {read, calls} = fixture({shared: true, items: [{id: 2, item_name: 'Rice', item_description: '1 kg', tax_percent: '5.00'}]});
    const [item] = await read({id: 7});
    assert.deepEqual(calls.find(call => call.sql.startsWith('SELECT ??')).args.slice(1), ['catalogue', 'category_id', 10]);
    assert.equal(item.full_description, '1 kg');
    assert.equal(item.item_gst, '5.00');
    assert.equal(item.admin_percentage, 5);
});
test('does not read an unregistered shared catalogue', async () => {
    const {read, calls} = fixture({shared: true, registered: false});
    await assert.rejects(read({shop_id: 7}), {code: 'ITEM_CONFIGURATION'});
    assert.equal(calls.length, 3);
});
test('rejects missing, fractional and unsafe shop IDs before querying', async () => {
    const {read, calls} = fixture();
    for (const id of [undefined, 0, -1, '7 OR 1=1', '1.5', '9007199254740993']) {
        await assert.rejects(read({shop_id: id}), {code: 'INVALID_SHOP'});
    }
    assert.equal(calls.length, 0);
});
test('rejects deleted or nonexistent shops', async () => {
    await assert.rejects(fixture({shop: false}).read({shop_id: 7}), {code: 'INVALID_SHOP'});
});
test('empty inventory is successful and query failures are propagated', async () => {
    assert.deepEqual(await fixture().read({shop_id: 7}), []);
    const failure = Object.assign(new Error('query failed'), {code: 'ER_NO_SUCH_TABLE'});
    const read = createShopItemsReader({query(sql, args, callback) { callback(failure); }});
    await assert.rejects(read({shop_id: 7}), failure);
});
