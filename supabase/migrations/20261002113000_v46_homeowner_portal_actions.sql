-- V46 homeowner portal actions + Home Record composition.
-- DEVELOPMENT BRANCH ONLY. Reuses customer concerns, feedback, warranties, closeout and punch-list systems.

create or replace function public.bct_homeowner_report_problem(p_project_id uuid,p_concern_type text,p_description text,p_severity text default 'normal')
returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_customer uuid; v_id uuid; v_severity text:=lower(coalesce(nullif(btrim(p_severity),''),'normal'));
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select p.customer_id into v_customer from public.bct_projects p join public.bct_customers c on c.id=p.customer_id
 where p.id=p_project_id and c.auth_user_id=auth.uid();
 if v_customer is null then raise exception 'Project access denied'; end if;
 if nullif(btrim(p_description),'') is null then raise exception 'Problem description is required'; end if;
 if v_severity not in ('normal','high','urgent','critical') then raise exception 'Invalid concern severity'; end if;
 insert into public.bct_customer_concerns(project_id,customer_id,concern_type,description,severity,status,opened_at)
 values(p_project_id,v_customer,coalesce(nullif(btrim(p_concern_type),''),'project_problem'),btrim(p_description),v_severity,'open',now()) returning id into v_id;
 if v_severity in ('high','urgent','critical') then
  insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at) values(p_project_id,'customer_concern',concat('Homeowner reported a ',coalesce(nullif(btrim(p_concern_type),''),'project problem')),case when v_severity='critical' then 'critical' else 'high' end,'open',now());
 end if;
 return v_id;
end $$;
revoke all on function public.bct_homeowner_report_problem(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.bct_homeowner_report_problem(uuid,text,text,text) to authenticated;

create or replace function public.bct_homeowner_daily_feedback(p_project_id uuid,p_rating integer,p_feedback text)
returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_customer uuid; v_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select p.customer_id into v_customer from public.bct_projects p join public.bct_customers c on c.id=p.customer_id
 where p.id=p_project_id and c.auth_user_id=auth.uid();
 if v_customer is null then raise exception 'Project access denied'; end if;
 if p_rating not between 1 and 5 then raise exception 'Rating must be from 1 to 5'; end if;
 insert into public.bct_customer_feedback(project_id,customer_id,rating,feedback,follow_up_required,follow_up_status,feedback_type,project_day,severity,routed_attention)
 values(p_project_id,v_customer,p_rating,nullif(btrim(p_feedback),''),p_rating<=2,case when p_rating<=2 then 'needed' else 'not_required' end,'daily',current_date,case when p_rating=1 then 'high' when p_rating=2 then 'normal' else 'low' end,p_rating=1)
 returning id into v_id;
 if p_rating=1 then
  insert into public.bct_action_inbox(project_id,action_type,title,priority,status,created_at) values(p_project_id,'customer_feedback','Homeowner daily feedback requires attention','high','open',now());
 end if;
 return v_id;
end $$;
revoke all on function public.bct_homeowner_daily_feedback(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.bct_homeowner_daily_feedback(uuid,integer,text) to authenticated;

create or replace function public.bct_homeowner_home_record(p_project_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare v_customer uuid; v_result jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select p.customer_id into v_customer from public.bct_projects p join public.bct_customers c on c.id=p.customer_id
 where p.id=p_project_id and c.auth_user_id=auth.uid();
 if v_customer is null then raise exception 'Project access denied'; end if;
 select jsonb_build_object(
  'warranties',coalesce((select jsonb_agg(jsonb_build_object('type',w.warranty_type,'provider',w.provider,'starts_on',w.starts_on,'expires_on',w.expires_on,'status',w.status,'trade',w.trade,'manufacturer',w.manufacturer,'product_model',w.product_model,'serial_number',w.serial_number,'care_maintenance',w.care_maintenance,'documents',w.document_refs)) from public.bct_warranties w where w.project_id=p_project_id),'[]'::jsonb),
  'closeout',coalesce((select jsonb_agg(jsonb_build_object('type',c.item_type,'description',c.description,'status',c.status,'category',c.homeowner_record_category,'documents',c.document_refs)) from public.bct_closeout_items c where c.project_id=p_project_id and c.homeowner_visible),'[]'::jsonb),
  'punch_list',coalesce((select jsonb_agg(jsonb_build_object('description',pl.description,'status',pl.status,'due_date',pl.due_date,'verified_at',pl.verified_at)) from public.bct_punch_list_items pl where pl.project_id=p_project_id),'[]'::jsonb)
 ) into v_result;
 return v_result;
end $$;
revoke all on function public.bct_homeowner_home_record(uuid) from public,anon,authenticated;
grant execute on function public.bct_homeowner_home_record(uuid) to authenticated;
