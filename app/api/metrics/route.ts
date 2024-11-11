import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/features/task-manager/metrics';
import { register } from 'prom-client';

export async function GET(req: NextRequest) {
  return new NextResponse(await metrics(), {
    headers: {
      'Content-Type': register.contentType
    }
  });
}
