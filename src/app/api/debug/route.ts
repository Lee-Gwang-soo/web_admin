import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
    keyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
  });
}
