# Deploy the vendor price update fix

The live `updateshopproducts` endpoint failed with `ER_NO_SUCH_TABLE` because
`indzon_db.shop_item_overrides_t` was missing. The existing writer stores
shop-specific prices in this table so one vendor's edits do not change another
vendor's catalogue.

After deploying this branch, run from the backend directory on the live server:

```sh
node scripts/migrate-shop-item-overrides.js
```

The script uses the backend's existing database configuration. Verify that it
points to the intended live database. It refuses databases other than `indzon_db`,
creates the table if absent, checks its required columns, and closes its connection.
It does not remove or change existing products, orders, or overrides. Running it
again preserves existing data. No additional dependency or app rebuild is needed
for the missing-table fix.

Expected output:

```text
Verified indzon_db.shop_item_overrides_t. Existing product and order data preserved.
```

If it fails, do not consider deployment complete. Check the database connection
and the database user's CREATE permission, or have the database administrator run
`migrations/20261023_shop_item_overrides.sql` against the live `indzon_db` database.

Verify in the vendor app: change a product's valid actual/selling prices, confirm,
and refresh or reopen Menu. Confirm the saved prices remain and that another
shop's listing is unchanged. Selling price must not exceed actual price.

Regression checks (no live database required):

```sh
node --test tests/shop-item-migration.test.js tests/shop-item-updates.test.js tests/shop-items.test.js
```
