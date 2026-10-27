const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

async function runMigration(database = 'indzon_db', migrationError = null) {
    const calls = [];
    const messages = [];
    let ended = false;
    let finish;
    const done = new Promise(resolve => { finish = resolve; });
    const pool = {
        query(sql, params, callback) {
            calls.push(sql);
            if (sql.startsWith('SELECT DATABASE')) return callback(null, [{name: database}]);
            if (sql.includes('CREATE TABLE')) return callback(migrationError, {});
            if (sql.startsWith('SHOW COLUMNS')) return callback(null,
                ['shop_id', 'catalogue', 'item_id', 'overrides'].map(Field => ({Field})));
            callback(new Error('Unexpected query'));
        },
        end() { ended = true; finish(); },
    };
    const process = {exitCode: 0};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/migrate-shop-item-overrides.js'), 'utf8'), {
        __dirname: path.join(__dirname, '../scripts'),
        require: name => name === '../config/dbconnect' ? {MySQLConPool: pool} : require(name),
        console: {log: message => messages.push(message), error: message => messages.push(message)},
        process,
    });
    await done;
    return {calls, messages, ended, exitCode: process.exitCode};
}

test('migration creates and verifies only the missing table without editing products', async () => {
    const result = await runMigration();
    assert.equal(result.exitCode, 0);
    assert.equal(result.ended, true);
    assert.equal(result.calls.length, 3);
    assert.match(result.calls[1], /CREATE TABLE IF NOT EXISTS shop_item_overrides_t/);
    const sql = result.calls[1].replace(/^\s*--.*$/gm, '');
    assert.doesNotMatch(sql, /\b(?:DELETE|DROP|TRUNCATE|UPDATE|INSERT|ALTER)\b/i);
});

test('migration refuses other databases before making changes', async () => {
    const result = await runMigration('other_db');
    assert.equal(result.exitCode, 1);
    assert.equal(result.calls.length, 1);
    assert.equal(result.ended, true);
});

test('migration reports database failure and closes the connection', async () => {
    const result = await runMigration('indzon_db', new Error('Access denied'));
    assert.equal(result.exitCode, 1);
    assert.equal(result.ended, true);
    assert.equal(result.calls.length, 2);
});
