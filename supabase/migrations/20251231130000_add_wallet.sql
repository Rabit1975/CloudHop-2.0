
alter table public.users 
add column if not exists wallet_balance numeric default 0;

-- Optional: Add a transaction history table if we want to be fancy, 
-- but for now let's just stick to the balance column as per the request "make buttons work".
