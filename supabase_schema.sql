-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Existing tables (if any) would go here, e.g.:
-- create table conversations ( ... );
-- create table messages ( ... );
-- create table ai_prompts ( ... );