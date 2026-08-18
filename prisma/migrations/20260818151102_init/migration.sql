-- CreateEnum
CREATE TYPE "categories_type" AS ENUM ('news', 'download');

-- CreateEnum
CREATE TYPE "notifications_level" AS ENUM ('due_soon', 'overdue');

-- CreateEnum
CREATE TYPE "stations_type" AS ENUM ('ALS', 'BLS');

-- CreateEnum
CREATE TYPE "banners_position" AS ENUM ('hero', 'sidebar', 'popup');

-- CreateEnum
CREATE TYPE "users_role" AS ENUM ('superadmin', 'admin', 'editor');

-- CreateEnum
CREATE TYPE "equipment_borrows_return_condition" AS ENUM ('ปกติ', 'ชำรุด');

-- CreateEnum
CREATE TYPE "news_status" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "equipment_status" AS ENUM ('พร้อมใช้งาน', 'ถูกยืม', 'ชำรุด', 'ซ่อมบำรุง', 'จำหน่ายแล้ว');

-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200),
    "image" VARCHAR(255) NOT NULL,
    "link_url" VARCHAR(255),
    "position" "banners_position" NOT NULL DEFAULT 'hero',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "type" "categories_type" NOT NULL DEFAULT 'news',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "phone" VARCHAR(30),
    "subject" VARCHAR(200),
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "file_path" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(20),
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "photo" VARCHAR(255),
    "photo2" VARCHAR(255),
    "photo3" VARCHAR(255),
    "brand" VARCHAR(150),
    "unit" VARCHAR(30) NOT NULL DEFAULT 'ชิ้น',
    "location" VARCHAR(150),
    "status" "equipment_status" NOT NULL DEFAULT 'พร้อมใช้งาน',
    "purchase_date" DATE,
    "purchase_price" DECIMAL(12,2),
    "warranty_document" VARCHAR(255),
    "receipt_document" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_status_logs" (
    "id" SERIAL NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "old_status" "equipment_status",
    "new_status" "equipment_status" NOT NULL,
    "note" VARCHAR(255),
    "changed_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_maintenance_schedules" (
    "id" SERIAL NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "completed_date" DATE,
    "note" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_stock_takes" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "started_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(0),
    "note" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_stock_takes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_stock_take_items" (
    "id" SERIAL NOT NULL,
    "stock_take_id" INTEGER NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checked_at" TIMESTAMP(0),
    "note" VARCHAR(255),

    CONSTRAINT "equipment_stock_take_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_borrows" (
    "id" SERIAL NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "borrower_name" VARCHAR(150) NOT NULL,
    "borrower_contact" VARCHAR(150),
    "borrow_date" TIMESTAMP(0) NOT NULL,
    "due_date" DATE,
    "return_date" TIMESTAMP(0),
    "return_condition" "equipment_borrows_return_condition",
    "note" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_borrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_categories" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "equipment_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galleries" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "cover_image" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" SERIAL NOT NULL,
    "gallery_id" INTEGER NOT NULL,
    "image_path" VARCHAR(255) NOT NULL,
    "caption" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(280) NOT NULL,
    "excerpt" VARCHAR(500),
    "content" TEXT,
    "cover_image" VARCHAR(255),
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" "news_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(0),
    "author_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "borrow_id" INTEGER NOT NULL,
    "level" "notifications_level" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_structures" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200),
    "image" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER,
    "title" VARCHAR(20),
    "first_name" VARCHAR(80),
    "last_name" VARCHAR(80),
    "full_name" VARCHAR(150) NOT NULL,
    "position" VARCHAR(150),
    "photo" VARCHAR(255),
    "phone" VARCHAR(30),
    "email" VARCHAR(150),
    "bio" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_groups" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "personnel_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" TEXT,
    "setting_group" VARCHAR(50) NOT NULL DEFAULT 'general',

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(30),
    "type" "stations_type" NOT NULL DEFAULT 'ALS',
    "lat" DECIMAL(10,7) NOT NULL,
    "lng" DECIMAL(10,7) NOT NULL,
    "address" VARCHAR(255),
    "phone" VARCHAR(30),
    "service_area" VARCHAR(255),
    "description" TEXT,
    "photo" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "username" VARCHAR(60) NOT NULL,
    "email" VARCHAR(150),
    "password" VARCHAR(255) NOT NULL,
    "role" "users_role" NOT NULL DEFAULT 'editor',
    "avatar" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_banners_pos" ON "banners"("position", "is_active");

-- CreateIndex
CREATE INDEX "idx_categories_type" ON "categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "uq_categories_slug" ON "categories"("slug", "type");

-- CreateIndex
CREATE INDEX "idx_contacts_read" ON "contacts"("is_read");

-- CreateIndex
CREATE INDEX "idx_downloads_category" ON "downloads"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_equipment_code" ON "equipment"("code");

-- CreateIndex
CREATE INDEX "idx_equipment_category" ON "equipment"("category_id");

-- CreateIndex
CREATE INDEX "idx_equipment_status" ON "equipment"("status");

-- CreateIndex
CREATE INDEX "idx_status_log_equipment" ON "equipment_status_logs"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_maint_equipment" ON "equipment_maintenance_schedules"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_maint_scheduled" ON "equipment_maintenance_schedules"("scheduled_date");

-- CreateIndex
CREATE INDEX "idx_stock_take_item_equipment" ON "equipment_stock_take_items"("equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_stock_take_item" ON "equipment_stock_take_items"("stock_take_id", "equipment_id");

-- CreateIndex
CREATE INDEX "idx_borrow_equipment" ON "equipment_borrows"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_borrow_return_date" ON "equipment_borrows"("return_date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_equip_cat_code" ON "equipment_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_galleries_slug" ON "galleries"("slug");

-- CreateIndex
CREATE INDEX "idx_gimg_gallery" ON "gallery_images"("gallery_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_news_slug" ON "news"("slug");

-- CreateIndex
CREATE INDEX "idx_news_author" ON "news"("author_id");

-- CreateIndex
CREATE INDEX "idx_news_category" ON "news"("category_id");

-- CreateIndex
CREATE INDEX "idx_news_status_pub" ON "news"("status", "published_at");

-- CreateIndex
CREATE INDEX "idx_notif_borrow" ON "notifications"("borrow_id");

-- CreateIndex
CREATE INDEX "idx_notif_is_read" ON "notifications"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_notif_type_borrow" ON "notifications"("type", "borrow_id");

-- CreateIndex
CREATE INDEX "idx_org_structures_active" ON "org_structures"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "idx_personnel_group" ON "personnel"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pgroup_code" ON "personnel_groups"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_settings_key" ON "settings"("setting_key");

-- CreateIndex
CREATE INDEX "idx_stations_type" ON "stations"("type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_username" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_email" ON "users"("email");

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "fk_downloads_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "fk_equipment_category" FOREIGN KEY ("category_id") REFERENCES "equipment_categories"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "equipment_status_logs" ADD CONSTRAINT "fk_status_log_equipment" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "equipment_maintenance_schedules" ADD CONSTRAINT "fk_maint_equipment" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "equipment_stock_take_items" ADD CONSTRAINT "fk_stock_take_item_session" FOREIGN KEY ("stock_take_id") REFERENCES "equipment_stock_takes"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "equipment_stock_take_items" ADD CONSTRAINT "fk_stock_take_item_equipment" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "equipment_borrows" ADD CONSTRAINT "fk_borrow_equipment" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "fk_gimg_gallery" FOREIGN KEY ("gallery_id") REFERENCES "galleries"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "fk_news_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "fk_news_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_notif_borrow" FOREIGN KEY ("borrow_id") REFERENCES "equipment_borrows"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "personnel" ADD CONSTRAINT "fk_personnel_group" FOREIGN KEY ("group_id") REFERENCES "personnel_groups"("id") ON DELETE SET NULL ON UPDATE RESTRICT;
