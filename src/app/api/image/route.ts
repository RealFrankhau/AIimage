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
    // Create signed URL with longer expiry (1 hour)
    const { data, error } = await supabase.storage
      .from('works')
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Add transform parameters to the signed URL if provided
    let finalUrl = data.signedUrl;
    if (w || h) {
      const url = new URL(finalUrl);
      if (w) url.searchParams.set('width', w);
      if (h) url.searchParams.set('height', h);
      url.searchParams.set('resize', 'cover');
      finalUrl = url.toString();
    }

    // Redirect to the signed URL
    return NextResponse.redirect(finalUrl);
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}