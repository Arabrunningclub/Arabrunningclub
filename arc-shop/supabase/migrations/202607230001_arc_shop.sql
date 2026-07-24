create extension if not exists pgcrypto;

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'fulfillment', 'editor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_shop_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'arabrunningclub@gmail.com'
    or exists (
      select 1
      from public.staff_members
      where active
        and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  eyebrow text not null default 'ARC / System',
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  price_cents integer not null check (price_cents >= 0),
  image_url text not null,
  image_alt text not null default '',
  category text not null check (category in ('Tops', 'Outerwear', 'Bottoms', 'Accessories')),
  collection text not null check (collection in ('Run', 'Off-duty', 'Objects')),
  colors jsonb not null default '[]'::jsonb,
  sizes text[] not null default '{}',
  featured boolean not null default false,
  badge text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  size text not null,
  color text not null,
  price_cents integer check (price_cents >= 0),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= stock_on_hand),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null,
  reason text not null check (reason in ('initial', 'adjustment', 'sale', 'return', 'damage')),
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001),
  customer_email text,
  customer_name text,
  customer_phone text,
  shipping_address jsonb,
  billing_address jsonb,
  currency text not null default 'usd',
  subtotal_cents integer not null default 0,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  discount_cents integer not null default 0,
  total_cents integer not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'processing', 'fulfilled', 'cancelled')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  tracking_number text,
  tracking_url text,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  sku text not null,
  size text not null,
  color text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  line_total_cents integer generated always as (unit_price_cents * quantity) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  status text not null default 'active' check (status in ('active', 'converted', 'released', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  order_id uuid references public.orders(id) on delete set null,
  received_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  carrier text,
  service text,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent', 'fixed', 'free_shipping')),
  value integer not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer,
  created_at timestamptz not null default now()
);

create table if not exists public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discounts(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_email text,
  created_at timestamptz not null default now(),
  unique (discount_id, order_id)
);

create table if not exists public.shop_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  content jsonb not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'shop_footer',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_status_sort_idx on public.products(status, sort_order);
create index if not exists variants_product_idx on public.product_variants(product_id);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_fulfillment_idx on public.orders(fulfillment_status, created_at desc);
create index if not exists reservations_expiry_idx on public.inventory_reservations(status, expires_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists variants_touch_updated_at on public.product_variants;
create trigger variants_touch_updated_at
before update on public.product_variants
for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

create or replace view public.storefront_products
with (security_invoker = true)
as
select
  id,
  slug,
  name,
  eyebrow,
  description,
  details,
  price_cents,
  image_url,
  image_alt,
  category,
  collection,
  colors,
  sizes,
  featured,
  badge,
  sort_order,
  created_at,
  updated_at
from public.products
where status = 'active';

alter table public.staff_members enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_reservations enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.shipments enable row level security;
alter table public.discounts enable row level security;
alter table public.discount_redemptions enable row level security;
alter table public.shop_settings enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.audit_log enable row level security;
alter table public.newsletter_signups enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
using (status = 'active');

drop policy if exists "Public can read active variants" on public.product_variants;
create policy "Public can read active variants"
on public.product_variants for select
using (
  active and exists (
    select 1 from public.products
    where products.id = product_variants.product_id
      and products.status = 'active'
  )
);

drop policy if exists "Staff manage products" on public.products;
create policy "Staff manage products"
on public.products for all
using (public.is_shop_admin())
with check (public.is_shop_admin());

drop policy if exists "Staff manage variants" on public.product_variants;
create policy "Staff manage variants"
on public.product_variants for all
using (public.is_shop_admin())
with check (public.is_shop_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'staff_members',
    'inventory_movements',
    'orders',
    'order_items',
    'inventory_reservations',
    'stripe_webhook_events',
    'shipments',
    'discounts',
    'discount_redemptions',
    'shop_settings',
    'homepage_sections',
    'audit_log',
    'newsletter_signups'
  ]
  loop
    execute format('drop policy if exists "ARC staff access" on public.%I', table_name);
    execute format(
      'create policy "ARC staff access" on public.%I for all using (public.is_shop_admin()) with check (public.is_shop_admin())',
      table_name
    );
  end loop;
end;
$$;

insert into public.staff_members (email, role)
values ('arabrunningclub@gmail.com', 'admin')
on conflict (email) do update set active = true, role = 'admin';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-media',
  'shop-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads shop media" on storage.objects;
create policy "Public reads shop media"
on storage.objects for select
using (bucket_id = 'shop-media');

drop policy if exists "ARC staff manage shop media" on storage.objects;
create policy "ARC staff manage shop media"
on storage.objects for all
using (bucket_id = 'shop-media' and public.is_shop_admin())
with check (bucket_id = 'shop-media' and public.is_shop_admin());

create or replace function public.upsert_shop_product(p_product jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_colors jsonb := coalesce(p_product -> 'colors', '[]'::jsonb);
  v_sizes text[] := coalesce(
    array(select jsonb_array_elements_text(coalesce(p_product -> 'sizes', '[]'::jsonb))),
    '{}'
  );
  v_result jsonb;
begin
  if not public.is_shop_admin() then
    raise exception 'Not authorized';
  end if;

  v_id := nullif(p_product ->> 'id', '')::uuid;
  if v_id is null then v_id := gen_random_uuid(); end if;

  insert into public.products (
    id, slug, name, eyebrow, description, details, price_cents,
    image_url, image_alt, category, collection, colors, sizes,
    featured, badge, status, sort_order
  )
  values (
    v_id,
    lower(p_product ->> 'slug'),
    p_product ->> 'name',
    coalesce(p_product ->> 'eyebrow', 'ARC / System'),
    coalesce(p_product ->> 'description', ''),
    coalesce(p_product -> 'details', '[]'::jsonb),
    (p_product ->> 'price_cents')::integer,
    p_product ->> 'image_url',
    coalesce(p_product ->> 'image_alt', p_product ->> 'name'),
    p_product ->> 'category',
    p_product ->> 'collection',
    v_colors,
    v_sizes,
    coalesce((p_product ->> 'featured')::boolean, false),
    nullif(p_product ->> 'badge', ''),
    coalesce(p_product ->> 'status', 'active'),
    coalesce((p_product ->> 'sort_order')::integer, 0)
  )
  on conflict (id) do update set
    slug = excluded.slug,
    name = excluded.name,
    eyebrow = excluded.eyebrow,
    description = excluded.description,
    details = excluded.details,
    price_cents = excluded.price_cents,
    image_url = excluded.image_url,
    image_alt = excluded.image_alt,
    category = excluded.category,
    collection = excluded.collection,
    colors = excluded.colors,
    sizes = excluded.sizes,
    featured = excluded.featured,
    badge = excluded.badge,
    status = excluded.status,
    sort_order = excluded.sort_order;

  insert into public.product_variants (
    product_id, sku, size, color, stock_on_hand
  )
  select
    v_id,
    upper(regexp_replace(p_product ->> 'slug', '[^a-zA-Z0-9]+', '-', 'g'))
      || '-' || upper(regexp_replace(size_value, '[^a-zA-Z0-9]+', '', 'g'))
      || '-' || upper(regexp_replace(color_value ->> 'name', '[^a-zA-Z0-9]+', '', 'g')),
    size_value,
    color_value ->> 'name',
    coalesce((p_product ->> 'initial_stock')::integer, 20)
  from unnest(v_sizes) as size_value
  cross join jsonb_array_elements(v_colors) as color_value
  on conflict (product_id, size, color) do update set active = true;

  select to_jsonb(storefront_products)
  into v_result
  from public.storefront_products
  where id = v_id;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, after_data)
  values (auth.uid(), 'upsert', 'product', v_id::text, v_result);

  return v_result;
end;
$$;

create or replace function public.reserve_shop_order(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_expires_at timestamptz := now() + interval '30 minutes';
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_quantity integer;
  v_subtotal integer := 0;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty.';
  end if;

  insert into public.orders (id, expires_at)
  values (v_order_id, v_expires_at);

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := greatest(1, least(10, (v_item ->> 'quantity')::integer));

    select *
    into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
      and status = 'active';

    if not found then
      raise exception 'A product in your bag is unavailable.';
    end if;

    select *
    into v_variant
    from public.product_variants
    where product_id = v_product.id
      and size = v_item ->> 'size'
      and color = v_item ->> 'color'
      and active
    for update;

    if not found or (v_variant.stock_on_hand - v_variant.reserved) < v_quantity then
      raise exception '% / % / % does not have enough stock.',
        v_product.name, v_item ->> 'color', v_item ->> 'size';
    end if;

    update public.product_variants
    set reserved = reserved + v_quantity
    where id = v_variant.id;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name, sku,
      size, color, unit_price_cents, quantity
    )
    values (
      v_order_id, v_product.id, v_variant.id, v_product.name, v_variant.sku,
      v_variant.size, v_variant.color,
      coalesce(v_variant.price_cents, v_product.price_cents),
      v_quantity
    );

    insert into public.inventory_reservations (
      order_id, variant_id, quantity, expires_at
    )
    values (v_order_id, v_variant.id, v_quantity, v_expires_at);

    v_subtotal := v_subtotal
      + coalesce(v_variant.price_cents, v_product.price_cents) * v_quantity;
  end loop;

  update public.orders
  set subtotal_cents = v_subtotal,
      total_cents = v_subtotal
  where id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'subtotal_cents', v_subtotal,
    'expires_at', v_expires_at
  );
exception
  when others then
    delete from public.orders where id = v_order_id;
    raise;
end;
$$;

create or replace function public.release_shop_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation record;
begin
  for v_reservation in
    select *
    from public.inventory_reservations
    where order_id = p_order_id and status = 'active'
    for update
  loop
    update public.product_variants
    set reserved = greatest(0, reserved - v_reservation.quantity)
    where id = v_reservation.variant_id;

    update public.inventory_reservations
    set status = 'released'
    where id = v_reservation.id;
  end loop;

  update public.orders
  set payment_status = 'cancelled'
  where id = p_order_id and payment_status = 'pending';
end;
$$;

create or replace function public.expire_shop_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_count integer := 0;
begin
  for v_order in
    select id from public.orders
    where payment_status = 'pending'
      and expires_at < now()
    for update skip locked
  loop
    perform public.release_shop_order(v_order.id);
    update public.inventory_reservations
    set status = 'expired'
    where order_id = v_order.id and status = 'released';
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.mark_shop_order_paid(
  p_order_id uuid,
  p_stripe_event_id text,
  p_stripe_session_id text,
  p_payment_intent_id text,
  p_customer_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  if exists (
    select 1 from public.stripe_webhook_events where id = p_stripe_event_id
  ) then
    return;
  end if;

  insert into public.stripe_webhook_events (id, event_type, order_id)
  values (p_stripe_event_id, 'checkout.session.completed', p_order_id);

  for v_item in
    select variant_id, quantity, id
    from public.order_items
    where order_id = p_order_id
    for update
  loop
    update public.product_variants
    set stock_on_hand = stock_on_hand - v_item.quantity,
        reserved = greatest(0, reserved - v_item.quantity)
    where id = v_item.variant_id;

    insert into public.inventory_movements (
      variant_id, quantity, reason, reference_type, reference_id
    )
    values (
      v_item.variant_id, -v_item.quantity, 'sale', 'order', p_order_id
    );
  end loop;

  update public.inventory_reservations
  set status = 'converted'
  where order_id = p_order_id and status = 'active';

  update public.orders
  set payment_status = 'paid',
      customer_email = p_customer_email,
      stripe_checkout_session_id = p_stripe_session_id,
      stripe_payment_intent_id = p_payment_intent_id,
      paid_at = now(),
      expires_at = null
  where id = p_order_id;
end;
$$;

grant execute on function public.reserve_shop_order(jsonb) to service_role;
grant execute on function public.release_shop_order(uuid) to service_role;
grant execute on function public.expire_shop_reservations() to service_role;
grant execute on function public.mark_shop_order_paid(uuid, text, text, text, text) to service_role;
grant execute on function public.upsert_shop_product(jsonb) to authenticated, service_role;

insert into public.products (
  id, slug, name, eyebrow, description, details, price_cents,
  image_url, image_alt, category, collection, colors, sizes,
  featured, badge, status, sort_order
)
values
(
  '71b32848-5cb1-4ee8-857b-0048ac54e141', 'unity-heavy-tee', 'Unity Heavy Tee', '01 / Core',
  'A structured everyday tee cut with room to move. Dense, soft cotton holds its shape from warm-up to wind-down.',
  '["280 GSM combed cotton","Relaxed unisex fit","Reinforced collar","Made for daily rotation"]',
  5400, '/images/unity-heavy-tee.webp', 'Black heavyweight ARC Unity Tee on limestone',
  'Tops', 'Off-duty',
  '[{"name":"Ink","hex":"#151513"},{"name":"Bone","hex":"#eee8dc"},{"name":"Track","hex":"#355844"}]',
  array['XS','S','M','L','XL','2XL','3XL'], true, 'New', 'active', 1
),
(
  '98d896ee-30d9-4b76-a4fe-e2e0bb4015d7', 'field-shell', 'Field Shell', '02 / Weather',
  'A packable weather layer with quiet structure, mapped ventilation, and just enough protection for miles between forecasts.',
  '["Wind-resistant ripstop","PFC-free water repellency","Packable hood","Two-way front zip"]',
  14800, '/images/field-shell.webp', 'Track green ARC Field Shell jacket',
  'Outerwear', 'Run',
  '[{"name":"Track","hex":"#355844"},{"name":"Ink","hex":"#151513"}]',
  array['XS','S','M','L','XL','2XL'], true, 'Limited', 'active', 2
),
(
  '41ecbf59-2080-4521-992d-71e889235557', 'movement-short-5', 'Movement Short 5"', '03 / Pace',
  'Fast, unfussy movement shorts with a clean waistband and secure storage that disappears once you start moving.',
  '["Lightweight stretch woven","Bonded phone pocket","Quick-dry liner","Reflective rear detail"]',
  7200, '/images/movement-short.webp', 'Bone ARC Movement Shorts on track green',
  'Bottoms', 'Run',
  '[{"name":"Bone","hex":"#eee8dc"},{"name":"Ink","hex":"#151513"},{"name":"Oxide","hex":"#ad3b2d"}]',
  array['XS','S','M','L','XL','2XL'], true, 'Core', 'active', 3
),
(
  '035ab0d0-8a29-4832-b539-11db8ad92c68', 'transit-warmup-pant', 'Transit Warmup Pant', '04 / Transit',
  'An articulated technical pant built to layer, commute, and move without the familiar track-pant noise.',
  '["Four-way stretch weave","Articulated knee","Locking ankle zips","Five secure pockets"]',
  11800, '/images/transit-pant.webp', 'Black ARC Transit Warmup Pant on limestone',
  'Bottoms', 'Off-duty',
  '[{"name":"Ink","hex":"#151513"},{"name":"Track","hex":"#355844"}]',
  array['XS','S','M','L','XL','2XL'], false, 'New', 'active', 4
),
(
  '4a5ffea5-68a7-4456-8b50-2d196e40f5f8', 'route-five-panel', 'Route Five-Panel', '05 / Objects',
  'A low-profile movement cap with laser-cut airflow and a pliable brim that packs without losing its line.',
  '["Featherweight stretch shell","Laser-cut ventilation","Adjustable cord lock","Hand-washable"]',
  3800, '/images/route-cap.webp', 'Oxide red ARC Route Five-Panel cap',
  'Accessories', 'Objects',
  '[{"name":"Oxide","hex":"#ad3b2d"},{"name":"Ink","hex":"#151513"},{"name":"Bone","hex":"#eee8dc"}]',
  array['One size'], false, 'New', 'active', 5
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  eyebrow = excluded.eyebrow,
  description = excluded.description,
  details = excluded.details,
  price_cents = excluded.price_cents,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  category = excluded.category,
  collection = excluded.collection,
  colors = excluded.colors,
  sizes = excluded.sizes,
  featured = excluded.featured,
  badge = excluded.badge,
  status = excluded.status,
  sort_order = excluded.sort_order;

insert into public.product_variants (
  product_id, sku, size, color, stock_on_hand
)
select
  product.id,
  upper(regexp_replace(product.slug, '[^a-zA-Z0-9]+', '-', 'g'))
    || '-' || upper(regexp_replace(size_value, '[^a-zA-Z0-9]+', '', 'g'))
    || '-' || upper(regexp_replace(color_value ->> 'name', '[^a-zA-Z0-9]+', '', 'g')),
  size_value,
  color_value ->> 'name',
  20
from public.products product
cross join lateral unnest(product.sizes) as size_value
cross join lateral jsonb_array_elements(product.colors) as color_value
on conflict (product_id, size, color) do nothing;

insert into public.shop_settings (key, value)
values
  ('announcement', '{"enabled":true,"text":"Free shipping over $100 · Easy returns"}'),
  ('shipping', '{"free_threshold_cents":10000,"flat_rate_cents":800,"currency":"usd"}'),
  ('brand', '{"name":"ARC Shop","tagline":"Movement apparel for every pace."}')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.homepage_sections (section_key, content, sort_order)
values
  ('hero', '{"eyebrow":"Arab Recreational Club / Drop 001","heading":"Move as one.","body":"Technical essentials for training, transit, and everything between.","primary_cta":"Shop the drop"}', 1),
  ('manifesto', '{"eyebrow":"More than apparel","heading":"The route changes. The reason stays.","body":"Movement makes room for people."}', 2)
on conflict (section_key) do update set content = excluded.content, sort_order = excluded.sort_order;
