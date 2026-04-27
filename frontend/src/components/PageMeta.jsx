import { Helmet } from 'react-helmet-async'

export default function PageMeta({ meta, jsonld }) {
  if (!meta) return null
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.canonical} />
      <meta property="og:title" content={meta['og:title']} />
      <meta property="og:description" content={meta['og:description']} />
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
