/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SystemSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_name_key" ON "SystemSettings"("name");
