-- CreateTable
CREATE TABLE "patient_reports" (
    "id" SERIAL NOT NULL,
    "report_date" DATE NOT NULL,
    "patient_count" INTEGER NOT NULL DEFAULT 0,
    "emergency_count" INTEGER NOT NULL DEFAULT 0,
    "traffic_injury_count" INTEGER NOT NULL DEFAULT 0,
    "general_injury_count" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "patient_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_patient_reports_date" ON "patient_reports"("report_date");

-- CreateIndex
CREATE INDEX "idx_patient_reports_date" ON "patient_reports"("report_date");
