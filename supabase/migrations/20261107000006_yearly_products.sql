-- Yearly products for the monthly/yearly lineup. Separate migration so the
-- enum values are committed before process_payment references them.
ALTER TYPE product_type ADD VALUE 'putme_pro_yearly';
ALTER TYPE product_type ADD VALUE 'jamb_pro_yearly';
