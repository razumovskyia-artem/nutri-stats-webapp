# Nutri Stats WebApp (Telegram Mini App)

## 1) SQL в Supabase (выполнить один раз в SQL Editor)
```sql
create or replace view v_meals_local as
select
  chat_id,
  dish, grams, kcal, prot, fat, carb,
  eaten_at at time zone 'UTC' at time zone 'Europe/Kyiv' as eaten_ts_kyiv,
  (eaten_at at time zone 'UTC' at time zone 'Europe/Kyiv')::date as eaten_date_kyiv
from meals
where coalesce(deleted, false) = false;

create or replace view v_daily_totals as
select
  chat_id,
  eaten_date_kyiv as day,
  sum(kcal)::int   as kcal,
  sum(prot)::int   as prot,
  sum(fat)::int    as fat,
  sum(carb)::int   as carb,
  count(*)         as meals_count
from v_meals_local
group by chat_id, eaten_date_kyiv
order by day desc;

create or replace function f_totals_since(chat bigint, days int)
returns table(period text, kcal int, prot int, fat int, carb int) language sql as $$
  select format('%s days', days),
         coalesce(sum(kcal),0)::int,
         coalesce(sum(prot),0)::int,
         coalesce(sum(fat),0)::int,
         coalesce(sum(carb),0)::int
  from v_daily_totals
  where chat_id = chat and day >= (current_date - (days||' days')::interval)
$$;
