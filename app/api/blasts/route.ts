import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const householdId = searchParams.get('householdId');
    const status = searchParams.get('status');

    if (!householdId) {
      return NextResponse.json(
        { error: 'Household ID is required' },
        { status: 400 }
      );
    }

    const where: any = {
      householdId,
    };

    if (status) {
      where.status = status;
    }

    const blasts = await prisma.blast.findMany({
      where,
      include: {
        createdBy: true,
        claimedBy: true,
        doneBy: true,
        reactions: {
          include: {
            member: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ blasts });
  } catch (error) {
    console.error('Error fetching blasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blasts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      householdId,
      memberId,
      categoryLabel,
      eventLabel,
      urgency = 'whenever',
    } = body;

    if (!householdId || !memberId || !categoryLabel || !eventLabel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const blast = await prisma.blast.create({
      data: {
        householdId,
        createdByMemberId: memberId,
        categoryLabel,
        eventLabel,
        urgency,
        status: 'OPEN',
      },
      include: {
        createdBy: true,
        reactions: {
          include: {
            member: true,
          },
        },
      },
    });

    return NextResponse.json({ blast });
  } catch (error) {
    console.error('Error creating blast:', error);
    return NextResponse.json(
      { error: 'Failed to create blast' },
      { status: 500 }
    );
  }
}
