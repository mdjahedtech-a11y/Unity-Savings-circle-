-- Create app_users table for custom Phone+PIN auth
create table if not exists public.app_users (
  phone text primary key,
  name text not null,
  pin text not null, -- Storing as text for simplicity in this demo. In production, use hashing.
  role text default 'member' check (role in ('super_admin', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.app_users enable row level security;

-- Policies (Allowing public access for this demo app structure)
create policy "Allow public read access" on public.app_users for select using (true);
create policy "Allow public insert access" on public.app_users for insert with check (true);
create policy "Allow public update access" on public.app_users for update using (true);
create policy "Allow public delete access" on public.app_users for delete using (true);

-- Insert Main Admin (Super Admin)
-- Default PIN is 123456. You can change it in the database.
insert into public.app_users (phone, name, pin, role)
values ('01580824066', 'Main Admin', '123456', 'super_admin')
on conflict (phone) do update 
set role = 'super_admin'; -- Ensure this number is always super_admin
