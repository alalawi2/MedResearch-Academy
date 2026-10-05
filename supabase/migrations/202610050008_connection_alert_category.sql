alter table public.adherence_alerts add column notification_kind text not null default 'data_gap'
check(notification_kind in ('data_gap','connection'));
