import { Helmet } from 'react-helmet-async'

const DEFAULT_DESCRIPTION =
  'Асфальтирование в Москве и Подмосковье под ключ. Цены от 630 руб/м², выезд замерщика в день обращения, гарантия 5 лет.'

export default function PageMeta({ meta, jsonld, noindex = false }) {
  if (!meta) return null
  const description = (meta.description || '').trim() || DEFAULT_DESCRIPTION
  const ogDescription = (meta['og:description'] || meta.description || '').trim() || DEFAULT_DESCRIPTION
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <link rel="canonical" href={meta.canonical} />
      <meta property="og:title" content={meta['og:title']} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={meta['og:url']} />
      <meta property="og:image" content={meta['og:image']} />
      <meta property="og:type" content={meta['og:type']} />
      <meta property="og:locale" content="ru_RU" />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonld && jsonld.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
