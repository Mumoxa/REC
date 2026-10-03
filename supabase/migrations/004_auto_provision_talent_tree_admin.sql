create or replace function public.handle_talent_tree_admin_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ws_id uuid;
begin
  if lower(new.email) = lower('christo@talenttree.co.za') then
    select id into ws_id
    from public.workspaces
    where slug = 'talent-tree'
    limit 1;

    if ws_id is not null then
      insert into public.workspace_members (workspace_id, user_id, role)
      values (ws_id, new.id, 'ADMIN')
      on conflict (workspace_id, user_id)
      do update set role = 'ADMIN';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_talent_tree_admin_signup on auth.users;
create trigger on_talent_tree_admin_signup
after insert or update of email on auth.users
for each row execute procedure public.handle_talent_tree_admin_signup();
