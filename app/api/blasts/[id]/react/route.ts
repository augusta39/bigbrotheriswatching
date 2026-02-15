import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: blastId } = await params;
    const body = await request.json();
    const { memberId, kind } = body;

    if (!memberId || !kind) {
      return NextResponse.json(
        { error: 'Member ID and reaction kind are required' },
        { status: 400 }
      );
    }

    // Validate reaction kind
    const validKinds = ['MINE', 'ON_IT', 'NOT_ME', 'ACK'];
    if (!validKinds.includes(kind)) {
      return NextResponse.json(
        { error: 'Invalid reaction kind' },
        { status: 400 }
      );
    }

    // Check if blast exists
    const blast = await prisma.blast.findUnique({
      where: { id: blastId },
    });

    if (!blast) {
      return NextResponse.json(
        { error: 'Blast not found' },
        { status: 404 }
      );
    }

    // Create or update reaction
    const reaction = await prisma.reaction.upsert({
      where: {
        blastId_memberId_kind: {
          blastId,
          memberId,
          kind,
        },
      },
      update: {},
      create: {
        blastId,
        memberId,
        kind,
      },
    });

    // If reaction is MINE or ON_IT, update blast to CLAIMED
    if ((kind === 'MINE' || kind === 'ON_IT') && blast.status === 'OPEN') {
      await prisma.blast.update({
        where: { id: blastId },
        data: {
          status: 'CLAIMED',
          claimedByMemberId: memberId,
          claimedAt: new Date(),
        },
      });
    }

    // Fetch updated blast
    const updatedBlast = await prisma.blast.findUnique({
      where: { id: blastId },
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
    });

    return NextResponse.json({
      reaction,
      blast: updatedBlast,
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}
