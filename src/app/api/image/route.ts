import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const w = searchParams.get('w');
  const h = searchParams.get('h');

  if (!path) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const allowedEmail = process.env.ALLOWED_EMAIL?.toLowerCase();
  if (user.email?.toLowerCase() !== allowedEmail) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Verify the user owns this image
  if (!path.startsWith(`${user.id}/`)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    // Use Supabase Image Transform with signed URL
    const transformOptions: Record<string, unknown> = {};
    if (w) transformOptions.width = parseInt(w, 10);
    if (h) transformOptions.height = parseInt(h, 10);
    if (w || h) transformOptions.resize = 'cover';
    if (w || h) transformOptions.format = 'webp';
    if (w || h) transformOptions.quality = 80;

    const { data, error } = await supabase.storage
      .from('works')
      .createSignedUrl(path, 3600, {
        transform: Object.keys(transformOptions).length > 0 ? transformOptions : undefined,
      });

    if (error || !data?.signedUrl) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Fetch the image from the signed URL and stream it back
    const imageResponse = await fetch(data.signedUrl);
    
    if (!imageResponse.ok) {
      return new NextResponse('Failed to fetch image', { status: 500 });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const cacheControl = imageResponse.headers.get('cache-control') || 'public, max-age=3600';

    return new NextResponse(imageResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      },
    });
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}