-- CreateTable
CREATE TABLE "aed_locations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "lat" DECIMAL(10,7) NOT NULL,
    "lng" DECIMAL(10,7) NOT NULL,
    "address" VARCHAR(255),
    "detail" VARCHAR(255),
    "open_hours" VARCHAR(150),
    "phone" VARCHAR(30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aed_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_aed_locations_active" ON "aed_locations"("is_active");
