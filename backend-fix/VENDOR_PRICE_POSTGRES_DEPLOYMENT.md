# PostgreSQL vendor price updates

Deploy `feature/postgresql-conversion`, install its dependencies with `npm ci`,
and configure PGHOST, PGPORT, PGUSER, PGPASSWORD, and PGDATABASE for the intended
live PostgreSQL database. Then run from the backend folder:

```sh
node scripts/migrate-vendor-prices-pg.js
```

This uses native PostgreSQL SQL to create and verify the vendor-specific price
table if it is missing. Existing products, orders, and saved overrides are
preserved. Repeating the migration is safe. The database user needs CREATE
permission. An error exits unsuccessfully and rolls back the migration.

The branch already includes the same table in `scripts/pg/extra-schema.sql`;
this targeted runner repairs an existing deployment without importing the full
schema or sample data. Do not run the MySQL migration runner on PostgreSQL.

After the success message, update a product price in the app, refresh Menu, and
verify that it persists and another vendor's price is unchanged. Deployment and
a successful migration are required; pushing this code alone does not change
the live database.

Checks without a live database:

```sh
node --test tests/vendor-price-pg-migration.test.js tests/pg-conversion.test.js
```
