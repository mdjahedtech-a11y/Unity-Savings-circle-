-- 1. Add photo_url column to members table
alter table public.members add column if not exists photo_url text;

-- 2. Add photo_url column to app_users table (for admins)
alter table public.app_users add column if not exists photo_url text;

-- 3. Create Storage Bucket for Avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 4. Storage Policies (Allow public access for avatars)
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' );
