insert into public.knowledge_sources (title, url, excerpt, approved_at)
select source.title, source.url, source.excerpt, now()
from (values
  ('سرم نیاسینامید ۱۰٪ و کافئین زویتر', 'https://zuyter.ir/product/acne-serum-oily-skin-zuyter/', 'نام محصول سرم نیاسینامید ۱۰٪ و کافئین زویتر است. حجم آن ۳۰ میلی‌لیتر است و زینک PCA هم دارد.'),
  ('سرم آلفا آربوتین ۲٪ زویتر', 'https://zuyter.ir/product/anti-dark-spot-brightening-serum-zuyter/', 'سرم آلفا آربوتین زویتر حاوی ۲٪ آلفا آربوتین است و در حجم ۳۰ میلی‌لیتر عرضه می‌شود.')
) as source(title, url, excerpt)
where not exists (
  select 1 from public.knowledge_sources existing where existing.url = source.url
);
