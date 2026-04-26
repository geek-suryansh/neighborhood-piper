-- Migration: create jobs table
create table if not exists jobs (
  id           text primary key,
  title        text not null,
  category     text,
  type         text,
  salary       text,
  location     text,
  url          text,
  lat          float,
  lng          float,
  scraped_at   timestamptz default now()
);
