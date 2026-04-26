-- Drop the FK so employer_id can hold any UUID (including mock/dev UUIDs)
alter table jobs drop constraint if exists jobs_employer_id_fkey;
