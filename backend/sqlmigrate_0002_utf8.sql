BEGIN;
--
-- Change Meta options on navigationitem
--
-- (no-op)
--
-- Change Meta options on navigationmenu
--
-- (no-op)
--
-- Remove field is_active from navigationitem
--
ALTER TABLE "navigation_navigationitem" DROP COLUMN "is_active" CASCADE;
--
-- Rename field label on navigationitem to label_en
--
ALTER TABLE "navigation_navigationitem" RENAME COLUMN "label" TO "label_en";
--
-- Add field anchor to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "anchor" varchar(120) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "anchor" DROP DEFAULT;
--
-- Add field email to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "email" varchar(254) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "email" DROP DEFAULT;
--
-- Add field icon to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "icon" varchar(120) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "icon" DROP DEFAULT;
--
-- Add field icon_asset to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "icon_asset_id" bigint NULL CONSTRAINT "navigation_navigatio_icon_asset_id_b2c59719_fk_media_lib" REFERENCES "media_library_mediaasset"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "navigation_navigatio_icon_asset_id_b2c59719_fk_media_lib" IMMEDIATE;
--
-- Add field is_visible to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "is_visible" boolean DEFAULT true NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "is_visible" DROP DEFAULT;
--
-- Add field label_ar to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "label_ar" varchar(120) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "label_ar" DROP DEFAULT;
--
-- Add field label_en to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "label_en" varchar(120) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "label_en" DROP DEFAULT;
--
-- Add field link_type to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "link_type" varchar(16) DEFAULT 'internal' NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "link_type" DROP DEFAULT;
--
-- Add field parent to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "parent_id" bigint NULL CONSTRAINT "navigation_navigatio_parent_id_9a68d7bd_fk_navigatio" REFERENCES "navigation_navigationitem"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "navigation_navigatio_parent_id_9a68d7bd_fk_navigatio" IMMEDIATE;
--
-- Add field phone to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "phone" varchar(40) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "phone" DROP DEFAULT;
--
-- Add field route_name to navigationitem
--
ALTER TABLE "navigation_navigationitem" ADD COLUMN "route_name" varchar(120) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationitem" ALTER COLUMN "route_name" DROP DEFAULT;
--
-- Add field description to navigationmenu
--
ALTER TABLE "navigation_navigationmenu" ADD COLUMN "description" varchar(255) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationmenu" ALTER COLUMN "description" DROP DEFAULT;
--
-- Add field order to navigationmenu
--
ALTER TABLE "navigation_navigationmenu" ADD COLUMN "order" integer DEFAULT 0 NOT NULL CHECK ("order" >= 0);
ALTER TABLE "navigation_navigationmenu" ALTER COLUMN "order" DROP DEFAULT;
--
-- Add field slug to navigationmenu
--
ALTER TABLE "navigation_navigationmenu" ADD COLUMN "slug" varchar(64) DEFAULT '' NOT NULL;
ALTER TABLE "navigation_navigationmenu" ALTER COLUMN "slug" DROP DEFAULT;
--
-- Raw Python operation
--
-- THIS OPERATION CANNOT BE WRITTEN AS SQL
--
-- Alter field slug on navigationmenu
--
ALTER TABLE "navigation_navigationmenu" ADD CONSTRAINT "navigation_navigationmenu_slug_af198189_uniq" UNIQUE ("slug");
CREATE INDEX "navigation_navigationmenu_slug_af198189_like" ON "navigation_navigationmenu" ("slug" varchar_pattern_ops);
--
-- Alter field order on navigationitem
--
-- (no-op)
--
-- Alter field url on navigationitem
--
-- (no-op)
--
-- Alter field is_active on navigationmenu
--
-- (no-op)
--
-- Alter field location on navigationmenu
--
ALTER TABLE "navigation_navigationmenu" DROP CONSTRAINT "navigation_navigationmenu_location_key";
DROP INDEX IF EXISTS "navigation_navigationmenu_location_a54f059e_like";
--
-- Alter field name on navigationmenu
--
-- (no-op)
--
-- Create index navigation__menu_id_11feef_idx on field(s) menu, parent, is_visible, order of model navigationitem
--
CREATE INDEX "navigation__menu_id_11feef_idx" ON "navigation_navigationitem" ("menu_id", "parent_id", "is_visible", "order");
--
-- Create index navigation__locatio_7c91eb_idx on field(s) location, is_active of model navigationmenu
--
CREATE INDEX "navigation__locatio_7c91eb_idx" ON "navigation_navigationmenu" ("location", "is_active");
CREATE INDEX "navigation_navigationitem_icon_asset_id_b2c59719" ON "navigation_navigationitem" ("icon_asset_id");
CREATE INDEX "navigation_navigationitem_parent_id_9a68d7bd" ON "navigation_navigationitem" ("parent_id");
CREATE INDEX "navigation_navigationmenu_slug_af198189" ON "navigation_navigationmenu" ("slug");
CREATE INDEX "navigation_navigationmenu_slug_af198189_like" ON "navigation_navigationmenu" ("slug" varchar_pattern_ops);
COMMIT;
