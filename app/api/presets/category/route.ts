import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateLabel } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { householdId, label } = body;

    if (!householdId) {
      return NextResponse.json(
        { error: 'Household ID is required' },
        { status: 400 }
      );
    }

    // Validate label
    const validation = validateLabel(label);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const trimmedLabel = label.trim();

    // Check if category already exists
    const existing = await prisma.categoryPreset.findUnique({
      where: {
        householdId_label: {
          householdId,
          label: trimmedLabel,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    // Create category preset
    const category = await prisma.categoryPreset.create({
      data: {
        householdId,
        label: trimmedLabel,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error creating category preset:', error);
    return NextResponse.json(
      { error: 'Failed to create category preset' },
      { status: 500 }
    );
  }
}
