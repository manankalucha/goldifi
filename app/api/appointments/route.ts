import { NextRequest, NextResponse } from 'next/server';
import { CreateAppointmentPayload } from '@/types';

// In a real deployment, this writes to Firestore via the Admin SDK.
// Client-side writes are handled directly in the booking component.

export async function POST(request: NextRequest) {
  try {
    const body: CreateAppointmentPayload = await request.json();
    const { customerName, customerPhone, customerEmail, serviceType, kioskLocation, customerAddress, scheduledAt } = body as CreateAppointmentPayload;

    if (!customerName || !customerPhone || !scheduledAt || !serviceType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (serviceType === 'kiosk' && !kioskLocation) {
      return NextResponse.json({ error: 'Missing kiosk location for kiosk service' }, { status: 400 });
    }

    if (serviceType === 'home' && (!customerAddress || customerAddress.length < 10)) {
      return NextResponse.json({ error: 'Missing or invalid customer address for home service' }, { status: 400 });
    }

    // Validate phone (10-digit Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerPhone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // In production with Admin SDK:
    // const db = getFirestore();
    // const ref = await db.collection('appointments').add({ ...body, status: 'pending', createdAt: new Date().toISOString() });
    // return NextResponse.json({ id: ref.id });

    // For development, return a mock confirmation ID
    const confirmationId = `GLD-${Date.now().toString(36).toUpperCase()}`;
    return NextResponse.json({
      id: confirmationId,
      status: 'pending',
      message: 'Appointment request received. We will confirm within 2 hours.',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to create an appointment' });
}
