/**
 * Renders a JSON-LD structured-data block. Server component: no client JS.
 * "<" is escaped so user-facing strings can never close the script tag.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
