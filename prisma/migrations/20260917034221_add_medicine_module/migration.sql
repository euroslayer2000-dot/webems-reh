-- CreateEnum
CREATE TYPE "medicine_classification" AS ENUM ('ทั่วไป', 'ยาอันตราย', 'ยาควบคุมพิเศษ', 'วัตถุออกฤทธิ์ต่อจิต', 'ยาเสพติด');

-- CreateEnum
CREATE TYPE "medicine_storage_condition" AS ENUM ('อุณหภูมิห้อง', 'แช่เย็น', 'เก็บให้พ้นแสง');

-- CreateEnum
CREATE TYPE "medicine_stock_logs_movement_type" AS ENUM ('received', 'dispensed', 'adjusted', 'expired_writeoff', 'lost');

-- CreateEnum
CREATE TYPE "medicine_checklist_items_expiry_flag" AS ENUM ('normal', 'near_expiry', 'expired');

-- CreateEnum
CREATE TYPE "medicine_notifications_type" AS ENUM ('medicine_expiring', 'medicine_expired', 'medicine_low_stock');

-- CreateTable
CREATE TABLE "medicine_categories" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "medicine_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicines" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "code" VARCHAR(50) NOT NULL,
    "generic_name" VARCHAR(200) NOT NULL,
    "trade_name" VARCHAR(200),
    "dosage_form" VARCHAR(80),
    "strength" VARCHAR(80),
    "unit" VARCHAR(30) NOT NULL DEFAULT 'เม็ด',
    "classification" "medicine_classification" NOT NULL DEFAULT 'ทั่วไป',
    "storage_condition" "medicine_storage_condition" NOT NULL DEFAULT 'อุณหภูมิห้อง',
    "min_stock" INTEGER NOT NULL DEFAULT 0,
    "photo" VARCHAR(255),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_batches" (
    "id" SERIAL NOT NULL,
    "medicine_id" INTEGER NOT NULL,
    "lot_no" VARCHAR(80) NOT NULL,
    "expiry_date" DATE NOT NULL,
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "location" VARCHAR(150),
    "supplier" VARCHAR(150),
    "purchase_price" DECIMAL(12,2),
    "received_date" DATE,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicine_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_stock_logs" (
    "id" SERIAL NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "movement_type" "medicine_stock_logs_movement_type" NOT NULL,
    "qty_change" INTEGER NOT NULL,
    "performed_by" VARCHAR(150) NOT NULL,
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicine_stock_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_dispenses" (
    "id" SERIAL NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "used_by" VARCHAR(150) NOT NULL,
    "used_at" TIMESTAMP(0) NOT NULL,
    "station" VARCHAR(150),
    "patient_report_id" INTEGER,
    "witness_name" VARCHAR(150),
    "note" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicine_dispenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_checklists" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "started_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(0),
    "note" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicine_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_checklist_items" (
    "id" SERIAL NOT NULL,
    "checklist_id" INTEGER NOT NULL,
    "medicine_id" INTEGER NOT NULL,
    "expected_qty" INTEGER NOT NULL DEFAULT 0,
    "actual_qty" INTEGER,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checked_at" TIMESTAMP(0),
    "expiry_flag" "medicine_checklist_items_expiry_flag",
    "snapshot_nearest_expiry" DATE,
    "note" VARCHAR(255),

    CONSTRAINT "medicine_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_notifications" (
    "id" SERIAL NOT NULL,
    "type" "medicine_notifications_type" NOT NULL,
    "level" "notifications_level" NOT NULL,
    "medicine_id" INTEGER,
    "medicine_batch_id" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "medicine_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_medicine_cat_code" ON "medicine_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_medicine_code" ON "medicines"("code");

-- CreateIndex
CREATE INDEX "idx_medicine_category" ON "medicines"("category_id");

-- CreateIndex
CREATE INDEX "idx_medicine_classification" ON "medicines"("classification");

-- CreateIndex
CREATE INDEX "idx_batch_medicine" ON "medicine_batches"("medicine_id");

-- CreateIndex
CREATE INDEX "idx_batch_expiry" ON "medicine_batches"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_stock_log_batch" ON "medicine_stock_logs"("batch_id");

-- CreateIndex
CREATE INDEX "idx_dispense_batch" ON "medicine_dispenses"("batch_id");

-- CreateIndex
CREATE INDEX "idx_dispense_patient_report" ON "medicine_dispenses"("patient_report_id");

-- CreateIndex
CREATE INDEX "idx_dispense_used_at" ON "medicine_dispenses"("used_at");

-- CreateIndex
CREATE INDEX "idx_checklist_item_medicine" ON "medicine_checklist_items"("medicine_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_checklist_item" ON "medicine_checklist_items"("checklist_id", "medicine_id");

-- CreateIndex
CREATE INDEX "idx_med_notif_is_read" ON "medicine_notifications"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "uq_med_notif_type_batch" ON "medicine_notifications"("type", "medicine_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_med_notif_type_medicine" ON "medicine_notifications"("type", "medicine_id");

-- AddForeignKey
ALTER TABLE "medicines" ADD CONSTRAINT "fk_medicine_category" FOREIGN KEY ("category_id") REFERENCES "medicine_categories"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "medicine_batches" ADD CONSTRAINT "fk_batch_medicine" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "medicine_stock_logs" ADD CONSTRAINT "fk_stock_log_batch" FOREIGN KEY ("batch_id") REFERENCES "medicine_batches"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "medicine_dispenses" ADD CONSTRAINT "fk_dispense_batch" FOREIGN KEY ("batch_id") REFERENCES "medicine_batches"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "medicine_dispenses" ADD CONSTRAINT "fk_dispense_patient_report" FOREIGN KEY ("patient_report_id") REFERENCES "patient_reports"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "medicine_checklist_items" ADD CONSTRAINT "fk_checklist_item_session" FOREIGN KEY ("checklist_id") REFERENCES "medicine_checklists"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "medicine_checklist_items" ADD CONSTRAINT "fk_checklist_item_medicine" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "medicine_notifications" ADD CONSTRAINT "fk_med_notif_medicine" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "medicine_notifications" ADD CONSTRAINT "fk_med_notif_batch" FOREIGN KEY ("medicine_batch_id") REFERENCES "medicine_batches"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
