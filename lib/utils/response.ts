import { NextResponse } from 'next/server';

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(error: string, status: number = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code && { code }),
    },
    { status }
  );
}
