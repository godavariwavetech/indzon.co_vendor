-- Additive migration. Does not modify or delete any existing products.
CREATE TABLE IF NOT EXISTS shop_item_overrides_t (
    shop_id INT NOT NULL,
    catalogue VARCHAR(64) NOT NULL,
    item_id INT NOT NULL,
    overrides LONGTEXT NOT NULL,
    PRIMARY KEY (shop_id, catalogue, item_id)
) ENGINE=InnoDB;
