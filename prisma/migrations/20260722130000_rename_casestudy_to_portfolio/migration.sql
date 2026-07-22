-- Rename CaseStudy -> Portfolio, preserving existing rows.
ALTER TABLE "CaseStudy" RENAME TO "Portfolio";
ALTER TABLE "Portfolio" RENAME CONSTRAINT "CaseStudy_pkey" TO "Portfolio_pkey";
ALTER INDEX "CaseStudy_slug_key" RENAME TO "Portfolio_slug_key";
