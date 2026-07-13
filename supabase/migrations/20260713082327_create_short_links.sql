create table public.short_links (
  short_code text primary key,
  original_url text not null,
  created_at timestamptz not null default now(),

  constraint short_links_short_code_format_check
    check (short_code ~ '^[0-9A-Za-z]{7}$'),
  constraint short_links_original_url_not_blank_check
    check (btrim(original_url) <> '')
);

comment on table public.short_links is
  'Maps a public short code to its original URL.';

alter table public.short_links enable row level security;

revoke all privileges on table public.short_links
  from anon, authenticated, service_role;
grant insert on table public.short_links to service_role;
