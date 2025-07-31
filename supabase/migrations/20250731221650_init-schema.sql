create table if not exists users (
  id uuid primary key default gen_random_uuid(),
	supabase_uid uuid not null unique references auth.users(id) on delete restrict,

	email varchar(255) not null unique,
	name varchar(255) not null,
	auth_provider varchar(255) not null,
	auth_provider_id varchar(255) not null,
	avatar_url text,

	created_at timestamp not null default now(),
	updated_at timestamp not null default now()
);


create table if not exists vendors (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	supabase_uid uuid not null references auth.users(id) on delete restrict,

	name varchar(255) not null,
	email varchar(255) not null,

	created_at timestamp not null default now(),
	updated_at timestamp not null default now(),

	unique(user_id, email)
);
create index if not exists idx_vendors_user_id on vendors(user_id);


create table if not exists invoices (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	supabase_uid uuid not null references auth.users(id) on delete restrict,

	storage_path text not null,
	ocr_data jsonb,

	created_at timestamp not null default now(),
	updated_at timestamp not null default now()
);


create table if not exists payment_categories (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	supabase_uid uuid not null references auth.users(id) on delete restrict,

	name varchar(255) not null,

	created_at timestamp not null default now(),
	updated_at timestamp not null default now(),

	unique(user_id, name)
);
create index if not exists idx_payment_categories_user_id on payment_categories(user_id);


create table if not exists departments (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	supabase_uid uuid not null references auth.users(id) on delete restrict,

	name varchar(255) not null,

	created_at timestamp not null default now(),
	updated_at timestamp not null default now(),

	unique(user_id, name)
);
create index if not exists idx_departments_user_id on departments(user_id);


do $$ begin
	create type currency_code as enum ('USDC');
exception
	when duplicate_object then null;
end $$;

create table if not exists payments (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	supabase_uid uuid not null references auth.users(id) on delete restrict,
	vendor_id uuid not null references public.vendors(id) on delete cascade,
	invoice_id uuid references public.invoices(id) on delete cascade, -- optional, payments can exist without an invoice

	invoice_number varchar(255),
	invoice_date timestamp,
	due_date timestamp,

	amount numeric not null,
	currency currency_code not null,
	sender_wallet_address varchar(255) not null,
	receiver_wallet_address varchar(255) not null,
	tx_hash varchar(255), -- globally unique identifier, natural idempotency key
	paid_date timestamp,

	memo text,
	category_id uuid references public.payment_categories(id) on delete restrict,
	department_id uuid references public.departments(id) on delete restrict,

	created_at timestamp not null default now(),
	updated_at timestamp not null default now(),

	unique(tx_hash, user_id)
);
create index if not exists idx_payments_user_id on payments(user_id);
