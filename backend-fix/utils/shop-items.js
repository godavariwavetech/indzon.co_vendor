// Resolve item ownership from the database, never from a client-supplied table.
const createShopItemsReader = pool => {
    const query = (sql, params) => new Promise((resolve, reject) => {
        pool.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
    const failure = (code, message) => Object.assign(new Error(message), {code});
    return async function readShopItems(data = {}) {
        const rawId = data.shop_id ?? data.id;
        if (!/^[1-9]\d*$/.test(String(rawId))) {
            throw failure('INVALID_SHOP', 'A valid shop is required.');
        }
        const shopId = Number(rawId);
        if (!Number.isSafeInteger(shopId)) throw failure('INVALID_SHOP', 'A valid shop is required.');
        const [shop] = await query(
            'SELECT id, category_id, shop_items_tb_nm, admin_percentage FROM shop_list_t WHERE id = ? AND d_in = 0', [shopId]);
        if (!shop) throw failure('INVALID_SHOP', 'This shop is no longer available.');
        const table = shop.shop_items_tb_nm;
        if (typeof table !== 'string' || !/^[a-zA-Z0-9_]+$/.test(table)) {
            throw failure('ITEM_CONFIGURATION', 'The item catalogue for this shop is not configured.');
        }
        const columns = new Set((await query('SHOW COLUMNS FROM ??', [table])).map(row => row.Field));
        if (!['id', 'item_name', 'd_in'].every(name => columns.has(name))) {
            throw failure('ITEM_CONFIGURATION', 'The item catalogue for this shop is not configured.');
        }
        let scope;
        let scopeValue;
        if (columns.has('shop_id')) {
            scope = 'shop_id';
            scopeValue = shop.id;
        } else {
            // A shared catalogue must be explicitly registered for this category.
            const [category] = await query('SELECT shop_items_tb_nm FROM category_tbl WHERE id = ? AND d_in = 0', [shop.category_id]);
            if (!columns.has('category_id') || !category || category.shop_items_tb_nm !== table) {
                throw failure('ITEM_CONFIGURATION', 'The item catalogue for this shop is not configured.');
            }
            scope = 'category_id';
            scopeValue = shop.category_id;
        }
        const allowed = ['prescription_required', 'quantity_type', 'unique_code', 'id', 'shop_id', 'item_name', 'item_image', 'item_description', 'full_description', 'category_id', 'category_name', 'sub_category_id', 'sub_category_name', 'filter_one', 'filter_two', 'actual_price', 'selling_price', 'discount_percentage', 'discount_amount', 'active_status', 'admin_percentage', 'item_gst', 'tax_percent'];
        const fields = allowed.filter(name => columns.has(name));
        const items = await query('SELECT ?? FROM ?? WHERE d_in = 0 AND ?? = ? ORDER BY id', [fields, table, scope, scopeValue]);
        let overrides = [];
        if (scope === 'category_id') {
            try {
                overrides = await query('SELECT item_id, overrides FROM shop_item_overrides_t WHERE shop_id = ? AND catalogue = ?', [shop.id, table]);
            } catch (err) {
                if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
            }
        }
        const byId = new Map(overrides.filter(row => row.overrides).map(row => [String(row.item_id), JSON.parse(row.overrides)]));
        return items.map(item => ({
            ...item,
            shop_id: shop.id,
            full_description: item.full_description ?? item.item_description ?? '',
            admin_percentage: item.admin_percentage ?? shop.admin_percentage ?? 0,
            item_gst: item.item_gst ?? item.tax_percent ?? 0,
            ...byId.get(String(item.id)),
        }));
    };
};
const editable = ['item_name', 'actual_price', 'selling_price', 'discount_percentage', 'discount_amount', 'item_description', 'quantity_type', 'item_gst', 'active_status'];

const createShopItemsWriter = pool => {
    const query = (sql, args) => new Promise((resolve, reject) => pool.query(sql, args, (err, rows) => err ? reject(err) : resolve(rows)));
    return async function write(data = {}) {
        if (!/^[1-9]\d*$/.test(String(data.id)) || !Number.isSafeInteger(Number(data.id))) throw new Error('A valid product is required.');
        const patch = {};
        for (const field of editable) {
            if (!Object.prototype.hasOwnProperty.call(data, field)) continue;
            const value = data[field];
            if (value == null) throw new Error(`Invalid ${field}.`);
            if (!['item_name', 'item_description'].includes(field) &&
                (String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0)) throw new Error(`Invalid ${field}.`);
            if (field === 'active_status' && !['0', '1'].includes(String(value))) throw new Error('Invalid availability.');
            patch[field] = value;
        }
        if (!Object.keys(patch).length) throw new Error('No product changes supplied.');
        if (data.edittasks?.length || data.deletedItems?.length) throw new Error('Extra item edits require a separate update.');
        const items = await createShopItemsReader(pool)({shop_id: data.shop_id});
        const item = items.find(row => String(row.id) === String(data.id));
        if (!item) throw new Error('This product is not available to this shop.');
        const actual = Number(patch.actual_price ?? item.actual_price);
        const selling = Number(patch.selling_price ?? item.selling_price);
        if (selling > actual) throw new Error('Selling price cannot exceed actual price.');
        const [shop] = await query('SELECT shop_items_tb_nm FROM shop_list_t WHERE id = ? AND d_in = 0', [Number(data.shop_id)]);
        const table = shop?.shop_items_tb_nm;
        if (typeof table !== 'string' || !/^[a-zA-Z0-9_]+$/.test(table)) throw new Error('Invalid product catalogue.');
        const columns = new Set((await query('SHOW COLUMNS FROM ??', [table])).map(row => row.Field));
        if (!columns.has('shop_id')) {
            // Never change the shared catalogue: save an override for this shop.
            await query(`INSERT INTO shop_item_overrides_t (shop_id, catalogue, item_id, overrides)
                VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                overrides = JSON_MERGE_PATCH(overrides, VALUES(overrides))`,
            [Number(data.shop_id), table, Number(data.id), JSON.stringify(patch)]);
        } else {
            const fields = [];
            const values = [];
            for (const [field, value] of Object.entries(patch)) {
                const column = field === 'item_gst' && !columns.has(field) && columns.has('tax_percent') ? 'tax_percent' : field;
                if (!columns.has(column)) throw new Error(`The catalogue does not support ${field}.`);
                fields.push('?? = ?');
                values.push(column, value);
            }
            const result = await query(`UPDATE ?? SET ${fields.join(', ')} WHERE id = ? AND shop_id = ? AND d_in = 0`,
                [table, ...values, Number(data.id), Number(data.shop_id)]);
            if (!result.affectedRows) throw new Error('The product was not updated.');
        }
        return {affectedRows: 1};
    };
};
module.exports = {createShopItemsReader, createShopItemsWriter};
