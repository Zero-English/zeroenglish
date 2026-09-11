export const ALLOWED_SITE_HOSTS = [
    "localhost:3000",
    "localhost:7273",
    "zeroenglish.vercel.app",
    "ze.tahmidhasan.net",
    "zeroenglish.tahmidhasan.net",
    "zeroenglish.org",
] as const;

export const ALLOWED_SITE_ORIGINS = ALLOWED_SITE_HOSTS.map((host) =>
    host.startsWith("localhost") ? `http://${host}` : `https://${host}`
);
