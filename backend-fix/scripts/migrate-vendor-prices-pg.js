// Additive PostgreSQL migration; does not alter existing products or orders.
const sql = `CREATE TABLE IF NOT EXISTS shop_item_overrides_t (
    shop_id integer NOT NULL,
    catalogue varchar(64) NOT NULL,
    item_id integer NOT NULL,
    overrides text NOT NULL,
    PRIMARY KEY (shop_id, catalogue, item_id)
)`;

async function migrate(client) {
    await client.query('BEGIN');
    try {
        await client.query(sql);
        await client.query('SELECT shop_id, catalogue, item_id, overrides FROM shop_item_overrides_t LIMIT 0');
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

if (require.main === module) {
    const {Client} = require('pg');
    const client = new Client({
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'indzon_db',
        connectionTimeoutMillis: 10000,
    });
    (async () => {
        try {
            await client.connect();
            await migrate(client);
            console.log('Verified PostgreSQL shop_item_overrides_t. Existing data preserved.');
        } finally {
            await client.end();
        }
    })().catch(error => {
        console.error('Vendor price migration failed:', error.message);
        process.exitCode = 1;
    });
}

module.exports = {migrate};
