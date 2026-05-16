-- =====================================================================
-- Vallente Family Hub — Initial schema
-- =====================================================================
-- Model: one household, four named slots. Each Supabase auth user claims
-- one of the four slots in `profiles` after magic-link sign-in.
-- RLS: any signed-in user with a claimed profile can read/write all
-- domain tables (this is a private family app, not multi-tenant).
-- =====================================================================

-- =====================================================================
-- profiles: user_id → family member name binding
-- =====================================================================
create table public.profiles (
  user_id    uuid primary key references auth.users on delete cascade,
  name       text not null unique check (name in ('Dave', 'Krista', 'David', 'Kailee')),
  email      text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "read profiles when signed in" on public.profiles
  for select using (auth.uid() is not null);

create policy "claim your own slot" on public.profiles
  for insert with check (user_id = auth.uid());

create policy "update your own slot" on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "release your own slot" on public.profiles
  for delete using (user_id = auth.uid());

-- Helper used by every other table's RLS policy.
create or replace function public.is_family_member()
returns boolean
language sql security definer stable as $$
  select exists (select 1 from public.profiles where user_id = auth.uid())
$$;
grant execute on function public.is_family_member() to authenticated;

-- =====================================================================
-- chores
-- =====================================================================
create table public.chores (
  id         bigint generated always as identity primary key,
  name       text not null,
  who        text not null,
  pts        int  not null default 5,
  done       boolean not null default false,
  updated_at timestamptz default now()
);

alter table public.chores enable row level security;
create policy "family rw chores" on public.chores
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- events
-- =====================================================================
create table public.events (
  id         bigint generated always as identity primary key,
  title      text   not null,
  date       date   not null,
  who        text[] not null default '{}',
  dot        text   default '#378ADD',
  created_at timestamptz default now()
);

alter table public.events enable row level security;
create policy "family rw events" on public.events
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- groceries
-- =====================================================================
create table public.groceries (
  id         bigint generated always as identity primary key,
  name       text    not null,
  cat        text    default 'Other',
  done       boolean not null default false,
  created_at timestamptz default now()
);

alter table public.groceries enable row level security;
create policy "family rw groceries" on public.groceries
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- occasions  (birthdays + anniversaries)
-- =====================================================================
create table public.occasions (
  id         bigint generated always as identity primary key,
  name       text not null,
  type       text not null check (type in ('birthday', 'anniversary')),
  month_day  text not null,
  year       int,
  group_type text default 'family' check (group_type in ('family', 'extended')),
  relation   text,
  created_at timestamptz default now()
);

alter table public.occasions enable row level security;
create policy "family rw occasions" on public.occasions
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- wishlist_items
-- =====================================================================
create table public.wishlist_items (
  id          bigint generated always as identity primary key,
  owner       text not null,
  name        text not null,
  url         text default '',
  notes       text default '',
  share_with  text[] not null default '{}',
  claimed_by  text,
  created_at  timestamptz default now()
);

alter table public.wishlist_items enable row level security;
create policy "family rw wishlist" on public.wishlist_items
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- polls  +  poll_votes
-- =====================================================================
create table public.polls (
  id         bigint generated always as identity primary key,
  question   text not null,
  options    jsonb not null,
  asked_by   text,
  created_at timestamptz default now()
);

create table public.poll_votes (
  poll_id     bigint references public.polls on delete cascade,
  member_name text not null,
  option_id   text not null,
  primary key (poll_id, member_name)
);

alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;

create policy "family rw polls" on public.polls
  for all using (public.is_family_member()) with check (public.is_family_member());
create policy "family rw poll_votes" on public.poll_votes
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- streak_checkins
-- =====================================================================
create table public.streak_checkins (
  date        date not null,
  member_name text not null,
  created_at  timestamptz default now(),
  primary key (date, member_name)
);

alter table public.streak_checkins enable row level security;
create policy "family rw streak" on public.streak_checkins
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- trips
-- =====================================================================
create table public.trips (
  id         bigint generated always as identity primary key,
  name       text not null,
  dates      text,
  budget     int  default 0,
  spent      int  default 0,
  icon       text default 'Mountain',
  bg         text default 'rgba(37, 99, 235, 0.55)',
  created_at timestamptz default now()
);

alter table public.trips enable row level security;
create policy "family rw trips" on public.trips
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- documents
-- =====================================================================
create table public.documents (
  id         bigint generated always as identity primary key,
  name       text not null,
  category   text default 'Other',
  owner      text default 'Family',
  expiry     date,
  notes      text default '',
  link       text default '',
  created_at timestamptz default now()
);

alter table public.documents enable row level security;
create policy "family rw documents" on public.documents
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- packages
-- =====================================================================
create table public.packages (
  id              bigint generated always as identity primary key,
  tracking_number text not null,
  carrier         text default 'USPS',
  description     text default '',
  recipient       text,
  status          text default 'in_transit' check (status in ('in_transit', 'delivered')),
  expected_date   date,
  created_at      timestamptz default now()
);

alter table public.packages enable row level security;
create policy "family rw packages" on public.packages
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- simple_votes  (Trips page weekend poll — legacy +1 counter)
-- =====================================================================
create table public.simple_votes (
  id         bigint generated always as identity primary key,
  name       text not null,
  count      int  not null default 0,
  created_at timestamptz default now()
);

alter table public.simple_votes enable row level security;
create policy "family rw simple_votes" on public.simple_votes
  for all using (public.is_family_member()) with check (public.is_family_member());

-- =====================================================================
-- Seed data so the app isn't empty on first load
-- =====================================================================
insert into public.chores (name, who, pts, done) values
  ('Wash dishes',         'Kailee', 5,  false),
  ('Take out trash',      'David',  5,  true),
  ('Vacuum living room',  'Kailee', 10, false),
  ('Mow lawn',            'David',  15, true),
  ('Clean bathrooms',     'Krista', 10, false),
  ('Laundry',             'Dave',   10, true),
  ('Wipe counters',       'Kailee', 5,  false);

insert into public.events (title, date, who, dot) values
  ('David finals',     '2026-05-14', '{David}',                              '#D85A30'),
  ('LLC board call',   '2026-05-16', '{Dave,Krista}',                        '#BA7517'),
  ('Kailee recital',   '2026-05-21', '{Kailee,Dave,Krista,David}',           '#D4537E'),
  ('Krista dentist',   '2026-05-22', '{Krista}',                             '#1D9E75'),
  ('BBQ weekend',      '2026-05-24', '{Dave,Krista,David,Kailee}',           '#378ADD'),
  ('Graduation party', '2026-05-30', '{David,Dave,Krista,Kailee}',           '#1D9E75');

insert into public.groceries (name, cat, done) values
  ('Ground beef (2 lbs)', 'Meat',       false),
  ('Tortillas',           'Bread',      false),
  ('Shredded cheese',     'Dairy',      true),
  ('Salsa',               'Condiments', false),
  ('Romaine lettuce',     'Produce',    true),
  ('Pasta (16 oz)',       'Pantry',     false),
  ('Tomato sauce',        'Pantry',     false),
  ('Chicken breasts',     'Meat',       false);

insert into public.occasions (name, type, month_day, year, group_type, relation) values
  ('Dave',          'birthday',    '03-12', 1979, 'family',   'Dad'),
  ('Krista',        'birthday',    '07-04', 1981, 'family',   'Mom'),
  ('David',         'birthday',    '09-08', 2003, 'family',   'Son'),
  ('Kailee',        'birthday',    '12-19', 2005, 'family',   'Daughter'),
  ('Dave & Krista', 'anniversary', '06-22', 2007, 'family',   'Anniversary'),
  ('Grandma Rose',  'birthday',    '04-30', 1952, 'extended', 'Grandma'),
  ('Uncle Joe',     'birthday',    '11-15', null, 'extended', 'Uncle');

insert into public.wishlist_items (owner, name, url, notes, share_with, claimed_by) values
  ('Kailee', 'New running shoes (size 8)', '', 'Brooks Ghost in any color',     '{Dave,Krista}',         null),
  ('Kailee', 'AirPods Pro',                '', '',                              '{Dave,Krista,David}',   null),
  ('David',  'Steam gift card',            '', '$25 is plenty',                 '{Dave,Krista,Kailee}',  null),
  ('David',  'Mechanical keyboard',        '', 'Tactile switches, TKL preferred','{Dave,Krista}',         'Dave'),
  ('Dave',   'Pizza stone',                '', 'For the Blackstone',            '{Krista}',              null),
  ('Krista', 'Nice gardening gloves',      '', 'Womens medium',                 '{Dave,David,Kailee}',   null);

insert into public.polls (question, options, asked_by) values
  ('Pizza Friday — what are we doing?',
   '[{"id":"a","text":"Homemade on the Blackstone"},{"id":"b","text":"Mary''s Pizza Shack"},{"id":"c","text":"Frozen + a movie"}]'::jsonb,
   'Krista'),
  ('Sunday morning vibe?',
   '[{"id":"a","text":"Big family breakfast at home"},{"id":"b","text":"Brunch out somewhere"},{"id":"c","text":"Everyone on their own"}]'::jsonb,
   'Dave');

-- Seed votes for the polls above.
insert into public.poll_votes (poll_id, member_name, option_id)
  select id, 'Dave',   'a' from public.polls where question like 'Pizza Friday%'
  union all
  select id, 'Kailee', 'a' from public.polls where question like 'Pizza Friday%'
  union all
  select id, 'David',  'b' from public.polls where question like 'Pizza Friday%'
  union all
  select id, 'Dave',   'b' from public.polls where question like 'Sunday morning vibe%';

insert into public.trips (name, dates, budget, spent, icon, bg) values
  ('Lake Tahoe summer trip', 'Jul 18–22', 1800, 320, 'Mountain', 'rgba(37, 99, 235, 0.55)'),
  ('Disneyland fall break',  'Oct 10–13', 3200, 0,   'Castle',   'rgba(224, 72, 119, 0.55)');

insert into public.documents (name, category, owner, expiry, notes, link) values
  ('Geico auto insurance card', 'Insurance', 'Family', '2027-02-15', '2-car policy',     ''),
  ('Dave''s passport',          'ID',        'Dave',   '2031-08-04', '',                  ''),
  ('2022 Tesla title',          'Vehicle',   'Family', null,         'Garage filing box',''),
  ('House mortgage statement',  'Financial', 'Family', null,         'Wells Fargo',      ''),
  ('Kailee''s vaccination record','Medical', 'Kailee', null,         '',                  '');

insert into public.packages (tracking_number, carrier, description, recipient, status, expected_date) values
  ('1Z999AA10123456784',     'UPS',    'Pizza stone',                 'Dave',   'in_transit', '2026-05-17'),
  ('9400111899560000000000', 'USPS',   'Running shoes (Brooks Ghost)','Kailee', 'in_transit', '2026-05-18'),
  ('TBA305432167890',        'Amazon', 'Keyboard keycaps',            'David',  'delivered',  '2026-05-12');

insert into public.simple_votes (name, count) values
  ('Safari West',              2),
  ('Kayak the Russian River',  1),
  ('Farmers market + brunch',  3),
  ('Redwoods hike',            1);

-- =====================================================================
-- Realtime: push changes to subscribed clients so multiple devices stay
-- in sync without polling.
-- =====================================================================
alter publication supabase_realtime add table public.chores;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.groceries;
alter publication supabase_realtime add table public.polls;
alter publication supabase_realtime add table public.poll_votes;
alter publication supabase_realtime add table public.streak_checkins;
alter publication supabase_realtime add table public.wishlist_items;
alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.packages;
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.occasions;
alter publication supabase_realtime add table public.simple_votes;
alter publication supabase_realtime add table public.profiles;
