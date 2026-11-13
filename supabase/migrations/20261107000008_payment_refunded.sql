-- Record refunds on the payments ledger. The refunds are also enforced by
-- expiring the matching entitlement in the webhook handler; the account,
-- profile, and history are untouched.
ALTER TYPE payment_status ADD VALUE 'refunded';
