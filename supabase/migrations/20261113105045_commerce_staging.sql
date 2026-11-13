-- Internal staging accepts only authenticated server-side commerce events.
create table public.woocommerce_order_snapshots (
  order_id bigint primary key check (order_id > 0),
  order_status text not null check (length(order_status) between 1 and 40),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  order_total numeric(16,4) not null check (order_total >= 0),
  modified_at timestamptz not null,
  -- Populate attribution only after a trusted account match and approved policy.
  customer_id uuid references auth.users on delete set null,
  representative_id uuid references auth.users on delete set null,
  commission_amount numeric(16,4) check (commission_amount >= 0)
);
alter table public.woocommerce_order_snapshots enable row level security;
revoke all on public.woocommerce_order_snapshots from public, anon, authenticated;
grant select, insert, update on public.woocommerce_order_snapshots to service_role;

create function public.stage_woocommerce_order(
  wc_id bigint, wc_status text, wc_currency text, wc_total numeric, wc_modified timestamptz
) returns void language sql set search_path = '' as $$
  insert into public.woocommerce_order_snapshots (order_id, order_status, currency, order_total, modified_at)
    values (wc_id, wc_status, wc_currency, wc_total, wc_modified)
  on conflict (order_id) do update set
    order_status = excluded.order_status,
    currency = excluded.currency,
    order_total = excluded.order_total,
    modified_at = excluded.modified_at
  where public.woocommerce_order_snapshots.modified_at < excluded.modified_at;
$$;
revoke all on function public.stage_woocommerce_order(bigint,text,text,numeric,timestamptz)
  from public, anon, authenticated;
grant execute on function public.stage_woocommerce_order(bigint,text,text,numeric,timestamptz) to service_role;
