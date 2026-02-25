-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Members Table
create table public.members (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  join_date date default current_date,
  monthly_amount numeric default 1000,
  status text default 'active' check (status in ('active', 'inactive', 'warning', 'defaulter')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Payments Table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.members(id) on delete cascade not null,
  payment_date date default current_date,
  month date not null, -- Stored as the first day of the month (e.g., 2023-01-01)
  expected_amount numeric not null,
  amount_paid numeric not null,
  missed_months integer default 0,
  late_fee numeric default 0,
  penalty_reason text,
  total_paid numeric generated always as (amount_paid + late_fee) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. App Users Table (Phone + PIN Auth)
create table if not exists public.app_users (
  phone text primary key,
  name text not null,
  pin text not null,
  role text default 'member' check (role in ('super_admin', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for app_users
alter table public.app_users enable row level security;

create policy "Allow public read access" on public.app_users for select using (true);
create policy "Allow public insert access" on public.app_users for insert with check (true);
create policy "Allow public update access" on public.app_users for update using (true);
create policy "Allow public delete access" on public.app_users for delete using (true);

-- Insert Main Admin (Super Admin)
insert into public.app_users (phone, name, pin, role)
values ('01580824066', 'Main Admin', '123456', 'super_admin')
on conflict (phone) do update 
set role = 'super_admin';

-- 4. Admin Users Table (Deprecated/Optional - keeping for reference if needed)
create table if not exists public.admin_users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  role text default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Simple for now - public read, anon write for demo purposes, strictly should be authenticated)
alter table public.members enable row level security;
alter table public.payments enable row level security;
-- app_users RLS is enabled above
alter table public.admin_users enable row level security;

create policy "Allow public read access" on public.members for select using (true);
create policy "Allow public insert access" on public.members for insert with check (true);
create policy "Allow public update access" on public.members for update using (true);

create policy "Allow public read access" on public.payments for select using (true);
create policy "Allow public insert access" on public.payments for insert with check (true);
create policy "Allow public update access" on public.payments for update using (true);

-- Indexes for performance
create index idx_payments_member_id on public.payments(member_id);
create index idx_payments_month on public.payments(month);
