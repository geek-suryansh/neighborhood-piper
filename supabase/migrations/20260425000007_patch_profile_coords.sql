-- Patch mock profiles: inject lat/lng into demographics so location bonus fires
-- All 10 mock profiles are Amsterdam-based (lat 52.3676, lng 4.9041)
update profiles
set profile = jsonb_set(
  jsonb_set(profile, '{demographics,lat}', '52.3676'),
  '{demographics,lng}', '4.9041'
)
where id::text like 'a1b2c3d4-%';
