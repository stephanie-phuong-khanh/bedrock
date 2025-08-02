-- Reusable function to update the `updated_at` column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;


create trigger set_updated_at
before update on public.users
for each row
execute procedure update_updated_at_column();

create trigger set_updated_at
before update on public.vendors
for each row
execute procedure update_updated_at_column();

create trigger set_updated_at
before update on public.invoices
for each row
execute procedure update_updated_at_column();

create trigger set_updated_at
before update on public.payment_categories
for each row
execute procedure update_updated_at_column();

create trigger set_updated_at
before update on public.departments
for each row
execute procedure update_updated_at_column();

create trigger set_updated_at
before update on public.payments
for each row
execute procedure update_updated_at_column();