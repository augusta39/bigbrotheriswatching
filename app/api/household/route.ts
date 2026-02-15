import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, personaDefault = 'ghost' } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Household name is required' },
        { status: 400 }
      );
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let existing = await prisma.household.findUnique({
      where: { inviteCode },
    });

    // Regenerate if collision (unlikely but safe)
    while (existing) {
      inviteCode = generateInviteCode();
      existing = await prisma.household.findUnique({
        where: { inviteCode },
      });
    }

    const household = await prisma.household.create({
      data: {
        name,
        inviteCode,
        personaDefault,
      },
    });

    return NextResponse.json({
      householdId: household.id,
      name: household.name,
      inviteCode: household.inviteCode,
      personaDefault: household.personaDefault,
    });
  } catch (error) {
    console.error('Error creating household:', error);
    return NextResponse.json(
      { error: 'Failed to create household' },
      { status: 500 }
    );
  }
}
