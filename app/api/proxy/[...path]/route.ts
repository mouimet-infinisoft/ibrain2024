// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SERVICES = {
  grafana: 'http://localhost:3001',
  prometheus: 'http://192.168.10.4:9090',
  redisinsight: 'http://192.168.10.3:5540',
  queues: 'http://192.168.10.2:3000/api/queues'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
    const p = await params
  const service = p.path[0];
  const restPath = p.path.slice(1).join('/');
  
  const targetUrl = SERVICES[service as keyof typeof SERVICES];
  if (!targetUrl) {
    return new NextResponse('Service not found', { status: 404 });
  }

  const url = `${targetUrl}/${restPath}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        ...Object.fromEntries(request.headers),
        'host': new URL(targetUrl).host,
      },
    });

    const body = await response.blob();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Proxy error', { status: 500 });
  }
}

// Required for WebSocket connections
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}