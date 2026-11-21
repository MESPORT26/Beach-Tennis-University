-- Beach Tennis University: online play, friends, ladder and shot videos
-- Run once in Supabase: Dashboard > SQL editor > New query > paste > Run.

-- Players (one row per signed-in account)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default 'Player',
  avatar text not null default 'a01',
  side text not null default 'R' check (side in ('L','R')),
  level text not null default 'intermediate',
  rating numeric(4,2) not null default 3.50 check (rating between 2.0 and 8.0),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable by signed-in players" on public.profiles for select to authenticated using (true);
create policy "players edit their own profile" on public.profiles for update to authenticated using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select is_admin from public.profiles where id = auth.uid()) and rating = (select rating from public.profiles where id = auth.uid()));
create policy "players create their own profile" on public.profiles for insert to authenticated with check (id = auth.uid() and is_admin = false);

-- Friends box
create table if not exists public.friendships (
  user_id uuid references public.profiles on delete cascade,
  friend_id uuid references public.profiles on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);
alter table public.friendships enable row level security;
create policy "see your friendships" on public.friendships for select to authenticated using (auth.uid() in (user_id, friend_id));
create policy "send a friend request" on public.friendships for insert to authenticated with check (user_id = auth.uid());
create policy "accept or remove" on public.friendships for update to authenticated using (auth.uid() in (user_id, friend_id));
create policy "remove a friend" on public.friendships for delete to authenticated using (auth.uid() in (user_id, friend_id));

-- A game room. The invite link is https://<site>/?join=<code>
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  host uuid not null references public.profiles,
  status text not null default 'lobby' check (status in ('lobby','playing','done')),
  ranked boolean not null default true,
  first_to int not null default 7,
  created_at timestamptz not null default now()
);
create table if not exists public.game_players (
  game_id uuid references public.games on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  team smallint not null check (team in (1,2)),
  side text not null check (side in ('L','R')),
  primary key (game_id, user_id)
);
alter table public.games enable row level security;
alter table public.game_players enable row level security;
create policy "games visible to signed-in players" on public.games for select to authenticated using (true);
create policy "create a game you host" on public.games for insert to authenticated with check (host = auth.uid());
create policy "host updates the game" on public.games for update to authenticated using (host = auth.uid());
create policy "players visible" on public.game_players for select to authenticated using (true);
create policy "join as yourself" on public.game_players for insert to authenticated with check (user_id = auth.uid());
create policy "leave or switch seat" on public.game_players for update to authenticated using (user_id = auth.uid());
create policy "leave a game" on public.game_players for delete to authenticated using (user_id = auth.uid());

-- Results and rating history. Ratings change only through record_result()
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games on delete set null,
  team1_score int not null, team2_score int not null,
  created_at timestamptz not null default now()
);
create table if not exists public.rating_events (
  id bigserial primary key,
  user_id uuid references public.profiles on delete cascade,
  result_id uuid references public.results on delete cascade,
  delta numeric(4,2) not null,
  rating_after numeric(4,2) not null,
  created_at timestamptz not null default now()
);
alter table public.results enable row level security;
alter table public.rating_events enable row level security;
create policy "results readable" on public.results for select to authenticated using (true);
create policy "rating history readable" on public.rating_events for select to authenticated using (true);

-- Colin's 2.0-8.0 scale: +0.1 per win, -0.1 per loss, but a player's net loss for the day can't go below -0.3
create or replace function public.record_result(p_game uuid, p_t1 int, p_t2 int)
returns uuid language plpgsql security definer set search_path = public as $$
declare r_id uuid; pl record; win_team int; today_net numeric; d numeric;
begin
  if not exists (select 1 from games where id = p_game and host = auth.uid() and ranked) then raise exception 'only the host of a ranked game can record it'; end if;
  if exists (select 1 from results where game_id = p_game) then raise exception 'already recorded'; end if;
  win_team := case when p_t1 > p_t2 then 1 else 2 end;
  insert into results(game_id, team1_score, team2_score) values (p_game, p_t1, p_t2) returning id into r_id;
  for pl in select gp.user_id, gp.team, p.rating from game_players gp join profiles p on p.id = gp.user_id where gp.game_id = p_game loop
    select coalesce(sum(delta),0) into today_net from rating_events where user_id = pl.user_id and created_at::date = now()::date;
    if pl.team = win_team then d := 0.10; else d := greatest(-0.10, -0.30 - least(today_net, 0)); end if;
    d := least(8.0 - pl.rating, greatest(2.0 - pl.rating, d));
    update profiles set rating = rating + d where id = pl.user_id;
    insert into rating_events(user_id, result_id, delta, rating_after) values (pl.user_id, r_id, d, pl.rating + d);
  end loop;
  update games set status = 'done' where id = p_game;
  return r_id;
end $$;
grant execute on function public.record_result(uuid,int,int) to authenticated;

-- The ladder
create or replace view public.ladder as
  select id, name, avatar, rating, rank() over (order by rating desc) as place from public.profiles;

-- Official technique videos, one per shot, uploaded by the admin only
create table if not exists public.shot_videos (
  shot text primary key,
  path text not null,
  updated_at timestamptz not null default now()
);
alter table public.shot_videos enable row level security;
create policy "anyone can watch" on public.shot_videos for select using (true);
create policy "admin uploads" on public.shot_videos for all to authenticated
  using ((select is_admin from public.profiles where id = auth.uid()))
  with check ((select is_admin from public.profiles where id = auth.uid()));
insert into storage.buckets (id, name, public) values ('shot-videos','shot-videos', true) on conflict do nothing;
create policy "admin writes videos" on storage.objects for all to authenticated
  using (bucket_id = 'shot-videos' and (select is_admin from public.profiles where id = auth.uid()))
  with check (bucket_id = 'shot-videos' and (select is_admin from public.profiles where id = auth.uid()));

-- After you sign in once on the site, make yourself admin:
-- update public.profiles set is_admin = true where id = (select id from auth.users where email = 'YOUR-EMAIL');
