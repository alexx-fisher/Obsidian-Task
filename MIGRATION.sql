-- Tudu — добавить поле заметки к задачам.
-- Запустить один раз в Supabase → SQL Editor (проект obsidian-task).

alter table public.tasks
  add column if not exists note text not null default '';
