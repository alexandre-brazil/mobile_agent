create table if not exists chat_sessions (
  session_id text primary key,
  mode text not null default 'bot',  -- 'bot' | 'human'
  operator_id text,
  taken_at timestamp,
  human_timeout_minutes int default 30,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sessions_updated_at on chat_sessions;
create trigger trg_sessions_updated_at
before update on chat_sessions
for each row execute function set_updated_at();

create table if not exists chat_messages (
  id bigserial primary key,
  session_id text not null,
  role text not null check (role in ('user','assistant','system','human')),
  content text not null,
  created_at timestamp default now()
);

create index if not exists idx_chat_messages_session
  on chat_messages(session_id, created_at);
