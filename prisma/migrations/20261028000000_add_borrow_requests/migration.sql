-- CreateEnum
CREATE TYPE "borrow_request_status" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "equipment_borrows"
    ADD COLUMN "request_status" "borrow_request_status" NOT NULL DEFAULT 'approved',
    ADD COLUMN "requested_at" TIMESTAMP(0),
    ADD COLUMN "decided_at" TIMESTAMP(0),
    ADD COLUMN "decided_by" VARCHAR(100),
    ADD COLUMN "reject_reason" VARCHAR(255);

-- CreateIndex
CREATE INDEX "idx_borrow_request_status" ON "equipment_borrows"("request_status");
