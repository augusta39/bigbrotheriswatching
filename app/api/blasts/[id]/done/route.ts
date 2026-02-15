import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: blastId } = await params;
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Check if blast exists and get reactions
    const blast = await prisma.blast.findUnique({
      where: { id: blastId },
      include: {
        reactions: true,
      },
    });

    if (!blast) {
      return NextResponse.json(
        { error: 'Blast not found' },
        { status: 404 }
      );
    }

    // Check if this member has claimed it via reactions (MINE or ON_IT)
    const hasClaimed = blast.reactions.some(
      r => r.memberId === memberId && (r.kind === 'MINE' || r.kind === 'ON_IT')
    );

    if (blast.status === 'CLAIMED' && !hasClaimed) {
      return NextResponse.json(
        { error: 'Only the person who claimed this can mark it done' },
        { status: 403 }
      );
    }

    // Update blast to DONE
    const updatedBlast = await prisma.blast.update({
      where: { id: blastId },
      data: {
        status: 'DONE',
        doneByMemberId: memberId,
        doneAt: new Date(),
      },
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

    return NextResponse.json({ blast: updatedBlast });
  } catch (error) {
    console.error('Error marking blast as done:', error);
    return NextResponse.json(
      { error: 'Failed to mark blast as done' },
      { status: 500 }
    );
  }
}
