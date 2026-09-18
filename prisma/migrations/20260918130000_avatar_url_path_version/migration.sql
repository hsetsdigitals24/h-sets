-- Avatar URLs carried their version as a query string (/api/users/<id>/avatar?v=<ts>).
-- next/image refuses to optimise a local URL with a search string, so every such
-- picture rendered as a broken image. Move the version into the path.
UPDATE "User"
SET "image" = replace("image", '/avatar?v=', '/avatar/')
WHERE "image" LIKE '/api/users/%/avatar?v=%';
