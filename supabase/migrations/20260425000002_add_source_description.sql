-- Migration: add source and description columns
alter table jobs add column if not exists source      text default 'youngcapital';
alter table jobs add column if not exists description text;

-- Backfill existing rows
update jobs set source = 'youngcapital' where source is null;
