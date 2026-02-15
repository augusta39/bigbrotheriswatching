import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteCode, householdId, displayName, anonymous = false } = body;

    let household;

    // Support both invite code and direct household ID
    if (householdId) {
      household = await prisma.household.findUnique({
        where: { id: householdId },
      });
    } else if (inviteCode) {
      household = await prisma.household.findUnique({
        where: { inviteCode },
      });
    } else {
      return NextResponse.json(
        { error: 'Invite code or household ID is required' },
        { status: 400 }
      );
    }

    if (!household) {
      return NextResponse.json(
        { error: 'Invalid invite code or household ID' },
        { status: 404 }
      );
    }

    // For anonymous joining, use default display name
    const memberDisplayName = anonymous ? 'Anonymous' : displayName;

    if (!anonymous && (!displayName || typeof displayName !== 'string')) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        householdId: household.id,
        displayName: memberDisplayName,
        isAnonymous: anonymous,
      },
    });

    return NextResponse.json({
      memberId: member.id,
      householdId: household.id,
      displayName: member.displayName,
      householdName: household.name,
      personaDefault: household.personaDefault,
    });
  } catch (error) {
    console.error('Error joining household:', error);
    return NextResponse.json(
      { error: 'Failed to join household' },
      { status: 500 }
    );
  }
}
