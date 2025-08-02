do $$ begin
	create type payment_network as enum ('ethereum', 'base', 'arbitrum', 'optimism', 'polygon', 'avalanche', 'base-sepolia');
exception
	when duplicate_object then null;
end $$;

alter table payments
add column payment_network payment_network not null;
