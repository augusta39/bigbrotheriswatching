import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create household
  const household = await prisma.household.create({
    data: {
      name: 'Apartment 404',
      inviteCode: 'apt404',
      personaDefault: 'ghost',
    },
  });

  console.log('✅ Created household:', household.name);

  // Create anonymous member for the household
  const member = await prisma.member.create({
    data: {
      householdId: household.id,
      displayName: 'Anonymous',
      isAnonymous: true,
    },
  });

  console.log('✅ Created anonymous member');

  // Create default category presets
  const categories = ['Laundry', 'Dishes', 'Trash', 'Cleaning', 'Noise', 'Groceries', 'Mail', 'Shared Space'];
  for (const category of categories) {
    await prisma.categoryPreset.create({
      data: {
        householdId: household.id,
        label: category,
      },
    });
  }

  console.log('✅ Created default category presets');

  // Create default event presets
  const events = ['Done', 'Full', 'Blocked', 'Clear', 'Check', 'Needed', 'Overflow', 'Spill', 'Reset', 'Return'];
  for (const event of events) {
    await prisma.eventPreset.create({
      data: {
        householdId: household.id,
        label: event,
      },
    });
  }

  console.log('✅ Created default event presets');

  // Create one open blast for demo
  const blast = await prisma.blast.create({
    data: {
      householdId: household.id,
      categoryLabel: 'Laundry',
      eventLabel: 'Done',
      urgency: 'soon',
      status: 'OPEN',
      createdByMemberId: member.id,
    },
  });

  console.log('✅ Created demo blast: Laundry — Done');

  console.log('\n🎉 Seed completed!');
  console.log(`\n📋 Household: ${household.name}`);
  console.log(`🆔 Household ID: ${household.id}`);
  console.log(`\n🔔 Bell URL: http://localhost:3000/bell/${household.id}`);
  console.log(`📱 QR Code URL: http://localhost:3000/qr/${household.id}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
