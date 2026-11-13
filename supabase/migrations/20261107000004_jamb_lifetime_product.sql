-- New product: JAMB one-time lifetime access, alongside the JAMB monthly.
-- Separate migration so the enum value is committed before use.
ALTER TYPE product_type ADD VALUE 'jamb_lifetime';
