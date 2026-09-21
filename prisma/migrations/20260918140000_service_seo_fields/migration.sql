-- Service page SEO + depth fields (Sept 2026 audit).
--   metaTitle / metaDescription: keyword- and geography-bearing strings for
--     <title> and <meta name="description">; `name` stays the short nav label.
--   sections: long-form body blocks ({ heading, body: string[] }[]). Service
--     pages were ~200 words, too thin for Google to assess topical relevance.
-- All three are nullable and additive: existing rows keep working untouched.
ALTER TABLE "Service" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "Service" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Service" ADD COLUMN "sections" JSONB;
