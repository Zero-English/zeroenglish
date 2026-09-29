export type Crumb = {
  /** Bangla label. Also the label used in the `BreadcrumbList` schema. */
  nameBn: string;
  /** English label for the visible trail. */
  nameEn: string;
  href: string;
  /**
   * Clears the persisted "last level" when clicked. Defaults to true for the
   * `/vocabulary` hub link, which is the one page that should forget it.
   */
  clearLevel?: boolean;
};

export const HOME_CRUMB = { nameBn: "হোম", nameEn: "Home", href: "/" } as const;

/** Every trail starts at Home, so callers only supply the pages below it. */
export function buildTrail(items: Crumb[]): Crumb[] {
  return [HOME_CRUMB, ...items];
}

/**
 * Labels for the `BreadcrumbList` schema.
 *
 * Schema is rendered on the server and never changes with the reader's
 * language toggle, so it always uses the Bangla labels: Bangla is the
 * server-rendered default (`getServerSnapshot` returns `"bn"`) and the language
 * of record for the content. Flipping the schema per-visitor would also
 * desync it from the crawler's own language settings.
 */
export function schemaLabels(trail: Crumb[]): string[] {
  return trail.map((c) => c.nameBn);
}
