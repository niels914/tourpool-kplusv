-- ============================================================
-- Scoring functies en views
-- ============================================================

-- Punten per etappepositie (top 10)
create or replace function public.stage_finish_points(pos integer)
returns numeric
language sql immutable as $$
  select case pos
    when 1  then 15
    when 2  then 10
    when 3  then 8
    when 4  then 7
    when 5  then 6
    when 6  then 5
    when 7  then 4
    when 8  then 3
    when 9  then 2
    when 10 then 1
    else 0
  end;
$$;

-- Punten per jerseystand (geel 5-3-1, overige 3-2-1)
create or replace function public.jersey_points(rtype public.result_type, pos integer)
returns numeric
language sql immutable as $$
  select case rtype
    when 'gc_standing'       then case pos when 1 then 5 when 2 then 3 when 3 then 1 else 0 end
    when 'mountain_standing' then case pos when 1 then 3 when 2 then 2 when 3 then 1 else 0 end
    when 'sprint_standing'   then case pos when 1 then 3 when 2 then 2 when 3 then 1 else 0 end
    when 'white_standing'    then case pos when 1 then 3 when 2 then 2 when 3 then 1 else 0 end
    else 0
  end;
$$;

-- Bonuspunten eindklassementen
create or replace function public.final_bonus_points(rtype public.final_result_type, pos integer)
returns numeric
language sql immutable as $$
  select case rtype
    when 'final_gc' then case pos
      when 1  then 40 when 2  then 30 when 3  then 22 when 4  then 16 when 5  then 12
      when 6  then 10 when 7  then 8  when 8  then 6  when 9  then 4  when 10 then 2
      else 0 end
    when 'final_mountain' then case pos when 1 then 12 when 2 then 8 when 3 then 6 when 4 then 4 when 5 then 2 else 0 end
    when 'final_sprint'   then case pos when 1 then 12 when 2 then 8 when 3 then 6 when 4 then 4 when 5 then 2 else 0 end
    when 'final_white'    then case pos when 1 then 12 when 2 then 8 when 3 then 6 when 4 then 4 when 5 then 2 else 0 end
    else 0
  end;
$$;

-- Aantal deelnemers dat elke renner heeft gekozen (noemer voor wortel-weging)
-- Telt alleen niet-geblokkeerde deelnemers
create or replace view public.rider_pick_counts as
select
  tp.rider_id,
  count(*) as pick_count
from public.team_picks tp
join public.profiles p on p.id = tp.user_id
where p.is_blocked = false
group by tp.rider_id;

-- Ruwe punten per renner per etappe (vóór wortel-weging)
-- TTT-etappes worden uitgesloten
create or replace view public.stage_raw_points as
select
  sr.stage_id,
  sr.rider_id,
  sum(
    case sr.result_type
      when 'stage_finish' then public.stage_finish_points(sr.position)
      else public.jersey_points(sr.result_type, sr.position)
    end
  ) as raw_points
from public.stage_results sr
join public.stages s on s.id = sr.stage_id
where s.stage_type != 'ttt'
  and s.status = 'locked'
group by sr.stage_id, sr.rider_id;

-- Gewogen punten per deelnemer per etappe (na wortel-weging)
create or replace view public.user_stage_points as
select
  tp.user_id,
  srp.stage_id,
  sum(srp.raw_points / sqrt(rpc.pick_count)) as weighted_points
from public.stage_raw_points srp
join public.team_picks tp on tp.rider_id = srp.rider_id
join public.rider_pick_counts rpc on rpc.rider_id = srp.rider_id
group by tp.user_id, srp.stage_id;

-- Eindbonus per deelnemer (gewogen)
create or replace view public.user_final_bonus as
select
  tp.user_id,
  sum(
    public.final_bonus_points(fr.result_type, fr.position) / sqrt(rpc.pick_count)
  ) as bonus_points
from public.final_results fr
join public.team_picks tp on tp.rider_id = fr.rider_id
join public.rider_pick_counts rpc on rpc.rider_id = fr.rider_id
group by tp.user_id;

-- Punten per deelnemer per etappe (gecumuleerd, voor grafiek)
create or replace view public.cumulative_points as
select
  usp.user_id,
  s.stage_number,
  sum(usp.weighted_points) over (
    partition by usp.user_id
    order by s.stage_number
    rows between unbounded preceding and current row
  ) as cumulative_points
from public.user_stage_points usp
join public.stages s on s.id = usp.stage_id;

-- Klassement (live ranglijst)
create or replace view public.klassement as
select
  p.id as user_id,
  p.display_name,
  p.email,
  coalesce(sum(usp.weighted_points), 0) + coalesce(ufb.bonus_points, 0) as total_points,
  coalesce(sum(usp.weighted_points), 0) as stage_points,
  coalesce(ufb.bonus_points, 0) as bonus_points,
  rank() over (
    order by coalesce(sum(usp.weighted_points), 0) + coalesce(ufb.bonus_points, 0) desc,
    p.display_name asc
  ) as rank
from public.profiles p
left join public.user_stage_points usp on usp.user_id = p.id
left join public.user_final_bonus ufb on ufb.user_id = p.id
where p.is_blocked = false
group by p.id, p.display_name, p.email, ufb.bonus_points;

-- Puntendetail per renner per deelnemer (voor mijn-team pagina)
create or replace view public.rider_score_detail as
select
  tp.user_id,
  tp.rider_id,
  r.full_name as rider_name,
  r.bib_number,
  r.team_name,
  r.bib_slot,
  coalesce(rpc.pick_count, 1) as pick_count,
  coalesce(sum(srp.raw_points / sqrt(rpc.pick_count)), 0) as weighted_stage_points,
  coalesce(
    sum(public.final_bonus_points(fr.result_type, fr.position) / sqrt(rpc.pick_count)),
    0
  ) as weighted_bonus_points
from public.team_picks tp
join public.riders r on r.id = tp.rider_id
left join public.rider_pick_counts rpc on rpc.rider_id = tp.rider_id
left join public.stage_raw_points srp on srp.rider_id = tp.rider_id
left join public.final_results fr on fr.rider_id = tp.rider_id
group by tp.user_id, tp.rider_id, r.full_name, r.bib_number, r.team_name, r.bib_slot, rpc.pick_count;
