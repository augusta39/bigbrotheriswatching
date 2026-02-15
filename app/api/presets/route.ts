import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const householdId = searchParams.get('householdId');

    if (!householdId) {
      return NextResponse.json(
        { error: 'Household ID is required' },
        { status: 400 }
      );
    }

    // Fetch all category and event presets for this household
    const [categories, events] = await Promise.all([
      prisma.categoryPreset.findMany({
        where: { householdId },
        orderBy: { label: 'asc' },
      }),
      prisma.eventPreset.findMany({
        where: { householdId },
        orderBy: { label: 'asc' },
      }),
    ]);

    return NextResponse.json({
      categories: categories.map(c => c.label),
      events: events.map(e => e.label),
    });
  } catch (error) {
    console.error('Error fetching presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presets' },
      { status: 500 }
    );
  }
}
