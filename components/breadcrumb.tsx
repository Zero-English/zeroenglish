import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { JsonLd } from "@/components/seo/json-ld";
import { buildTrail, schemaLabels, type Crumb } from "@/lib/breadcrumb-trail";
import { SITE_URL } from "@/lib/site-config";

/**
 * A visible breadcrumb trail plus the matching `BreadcrumbList` schema. The
 * schema is only legitimate while the trail is on the page, which is why both
 * are rendered together here rather than separately per route.
 *
 * The schema is built here on the server so crawlers that do not execute
 * JavaScript still get the hierarchy, and so it stays in the initial HTML.
 * The visible trail is a client component that follows the language toggle.
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  const trail = buildTrail(items);
  const labels = schemaLabels(trail);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: labels[i],
      item: `${SITE_URL}${c.href === "/" ? "" : c.href}`,
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <BreadcrumbTrail items={items} className={className} />
    </>
  );
}
