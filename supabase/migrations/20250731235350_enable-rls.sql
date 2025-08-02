-- Vendors
alter table public.vendors enable row level security;

create policy "Users can read their own vendors"
on public.vendors
for select
to authenticated
using (auth.uid() = supabase_uid);

create policy "Users can insert their own vendors"
on public.vendors
for insert
to authenticated
with check (auth.uid() = supabase_uid);

create policy "Users can update their own vendors"
on public.vendors
for update
to authenticated
using (auth.uid() = supabase_uid)
with check (auth.uid() = supabase_uid);

create policy "Users can delete their own vendors"
on public.vendors
for delete
to authenticated
using (auth.uid() = supabase_uid);


-- Invoices
alter table public.invoices enable row level security;

create policy "Users can read their own invoices"
on public.invoices
for select
to authenticated
using (auth.uid() = supabase_uid);

create policy "Users can insert their own invoices"
on public.invoices
for insert
to authenticated
with check (auth.uid() = supabase_uid);

create policy "Users can update their own invoices"
on public.invoices
for update
to authenticated
using (auth.uid() = supabase_uid)
with check (auth.uid() = supabase_uid);

create policy "Users can delete their own invoices"
on public.invoices
for delete
to authenticated
using (auth.uid() = supabase_uid);


-- Payment Categories
alter table public.payment_categories enable row level security;

create policy "Users can read their own payment categories"
on public.payment_categories
for select
to authenticated
using (auth.uid() = supabase_uid);

create policy "Users can insert their own payment categories"
on public.payment_categories
for insert
to authenticated
with check (auth.uid() = supabase_uid);

create policy "Users can update their own payment categories"
on public.payment_categories
for update
to authenticated
using (auth.uid() = supabase_uid)
with check (auth.uid() = supabase_uid);

create policy "Users can delete their own payment categories"
on public.payment_categories
for delete
to authenticated
using (auth.uid() = supabase_uid);


-- Departments
alter table public.departments enable row level security;

create policy "Users can read their own departments"
on public.departments
for select
to authenticated
using (auth.uid() = supabase_uid);

create policy "Users can insert their own departments"
on public.departments
for insert
to authenticated
with check (auth.uid() = supabase_uid);

create policy "Users can update their own departments"
on public.departments
for update
to authenticated
using (auth.uid() = supabase_uid)
with check (auth.uid() = supabase_uid);

create policy "Users can delete their own departments"
on public.departments
for delete
to authenticated
using (auth.uid() = supabase_uid);


-- Payments
alter table public.payments enable row level security;

create policy "Users can read their own payments"
on public.payments
for select
to authenticated
using (auth.uid() = supabase_uid);

create policy "Users can insert their own payments"
on public.payments
for insert
to authenticated
with check (auth.uid() = supabase_uid);

create policy "Users can update their own payments"
on public.payments
for update
to authenticated
using (auth.uid() = supabase_uid)
with check (auth.uid() = supabase_uid);

create policy "Users can delete their own payments"
on public.payments
for delete
to authenticated
using (auth.uid() = supabase_uid);


-- Users, RLS is enabled but no policies
alter table public.users enable row level security;
