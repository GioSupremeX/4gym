---
name: Article image storage
description: Database and bandwidth safeguards for article images stored as inline data URLs.
---

Article images remain in the existing database-backed `imageUrls` field for compatibility, but new local uploads must be resized and compressed in the browser before saving. Keep the server-side image count and aggregate payload limits in place.

**Why:** Inline image data is convenient but grows PostgreSQL rows and makes public article responses heavier on mobile devices. The development database was only about 12 MB during the September 7, 2026 review, with most usage coming from one legacy inline-image article, so compatibility matters while new growth is controlled.

**How to apply:** Preserve existing images when editing old articles, compress new uploads to WebP/JPEG with a bounded dimension and size, cap the number of images, and use lazy decoding for public article thumbnails and galleries. Move to object storage only if image volume approaches the database limit.