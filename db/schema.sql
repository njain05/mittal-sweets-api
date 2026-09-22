-- Mittal Sweets — sales table
-- Paste this whole file into Supabase > SQL Editor > New query > Run

drop table if exists sales;

create table sales (
  id       bigint generated always as identity primary key,
  item     text         not null,
  qty      numeric(8,2) not null,
  unit     text         not null default 'kg',   -- 'kg' or 'pc'
  rate     numeric(8,2) not null,                -- price per unit, rupees
  sold_at  timestamptz  not null default now()
);

create index sales_sold_at_idx on sales (sold_at);

-- Seed rows. sold_at is relative to now(), so "today's revenue"
-- always has something in it whenever you run this.
insert into sales (item, qty, unit, rate, sold_at) values
  -- today
  ('Samosa',          12,  'pc', 20,  now() - interval '6 hours'),
  ('Gulab Jamun',     1.5, 'kg', 300, now() - interval '5 hours'),
  ('Motichoor Ladoo', 2,   'kg', 360, now() - interval '4 hours'),
  ('Kaju Barfi',      0.5, 'kg', 520, now() - interval '3 hours'),
  ('Jalebi',          1,   'kg', 240, now() - interval '2 hours'),
  ('Samosa',          8,   'pc', 20,  now() - interval '1 hour'),
  ('Rasgulla',        1,   'kg', 320, now() - interval '30 minutes'),
  -- yesterday
  ('Fresh Cream Cake', 1,  'kg', 600, now() - interval '1 day'),
  ('Bikaneri Namkeen', 2,  'kg', 280, now() - interval '1 day'),
  ('Barfi',            3,  'kg', 520, now() - interval '1 day'),
  -- earlier this week
  ('Motichoor Ladoo', 5,   'kg', 360, now() - interval '3 days'),
  ('Samosa',          25,  'pc', 20,  now() - interval '4 days');

-- Row Level Security. Without these policies your API gets back
-- an empty array and you spend an hour wondering why.
alter table sales enable row level security;

create policy "anon can read sales"
  on sales for select to anon using (true);

create policy "anon can insert sales"
  on sales for insert to anon with check (true);
