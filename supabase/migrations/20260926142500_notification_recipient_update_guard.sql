-- Prevent recipients from altering notification delivery/audit fields through the authenticated API.
create or replace function public.bct_guard_my_notification_update()
returns trigger language plpgsql set search_path=public,auth as $f$
begin
 if public.is_bct_admin() then return new; end if;
 if old.recipient_user_id<>auth.uid() then raise exception 'Notification access denied'; end if;
 if new.id<>old.id or new.recipient_user_id<>old.recipient_user_id or new.project_id is distinct from old.project_id
 or new.notification_type<>old.notification_type or new.subject<>old.subject or new.message<>old.message
 or new.channel<>old.channel or new.status<>old.status or new.sent_at is distinct from old.sent_at
 or new.error_message is distinct from old.error_message or new.created_at<>old.created_at
 or new.delivery_attempt_count<>old.delivery_attempt_count or new.last_attempt_at is distinct from old.last_attempt_at
 or new.provider_message_id is distinct from old.provider_message_id
 then raise exception 'Only notification read status may be changed'; end if;
 if old.read_at is not null and new.read_at is null then raise exception 'Read notifications cannot be marked unread'; end if;
 return new;
end $f$;
drop trigger if exists bct_guard_my_notification_update on public.bct_notifications;
create trigger bct_guard_my_notification_update before update on public.bct_notifications
for each row execute function public.bct_guard_my_notification_update();
