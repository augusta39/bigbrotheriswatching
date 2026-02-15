-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "personaDefault" TEXT NOT NULL DEFAULT 'ghost',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blast" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "eventLabel" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'whenever',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedByMemberId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "doneByMemberId" TEXT,
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "Blast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "blastId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPreset" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPreset" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Household_inviteCode_key" ON "Household"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_blastId_memberId_kind_key" ON "Reaction"("blastId", "memberId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPreset_householdId_label_key" ON "CategoryPreset"("householdId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "EventPreset_householdId_label_key" ON "EventPreset"("householdId", "label");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blast" ADD CONSTRAINT "Blast_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blast" ADD CONSTRAINT "Blast_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blast" ADD CONSTRAINT "Blast_claimedByMemberId_fkey" FOREIGN KEY ("claimedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blast" ADD CONSTRAINT "Blast_doneByMemberId_fkey" FOREIGN KEY ("doneByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_blastId_fkey" FOREIGN KEY ("blastId") REFERENCES "Blast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPreset" ADD CONSTRAINT "CategoryPreset_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPreset" ADD CONSTRAINT "EventPreset_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
