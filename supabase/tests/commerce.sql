begin;
select public.stage_woocommerce_order(9223372036854775807,'completed','IRR',150,'2026-01-02Z');
select public.stage_woocommerce_order(9223372036854775807,'pending','IRR',50,'2026-01-01Z');
select public.stage_woocommerce_order(9223372036854775807,'completed','IRR',150,'2026-01-02Z');
do $$
begin
  if not exists (select from public.woocommerce_order_snapshots where order_id = 9223372036854775807 and order_status = 'completed' and order_total = 150) then
    raise exception 'Order replay corrupted the snapshot';
  end if;
  if has_table_privilege('authenticated','public.woocommerce_order_snapshots','select')
    or has_function_privilege('authenticated','public.stage_woocommerce_order(bigint,text,text,numeric,timestamptz)','execute') then
    raise exception 'Client can access commerce staging';
  end if;
end;
$$;
rollback;
