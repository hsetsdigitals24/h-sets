-- CreateTable
CREATE TABLE "_CohortToInstructor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CohortToInstructor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CohortToInstructor_B_index" ON "_CohortToInstructor"("B");

-- AddForeignKey
ALTER TABLE "_CohortToInstructor" ADD CONSTRAINT "_CohortToInstructor_A_fkey" FOREIGN KEY ("A") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CohortToInstructor" ADD CONSTRAINT "_CohortToInstructor_B_fkey" FOREIGN KEY ("B") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
