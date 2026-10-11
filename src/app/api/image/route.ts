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
    // Use Supabase transform feature directly in createSignedUrl
    const transformOptions: Record<string, string> = {};
    if (w) transformOptions.width = w;
    if (h) transformOptions.height = h;
    if (w || h) transformOptions.resize = 'cover';

    const { data, error } = await supabase.storage
      .from('works')
      .createSignedUrl(path, 3600, {
        transform: Object.keys(transformOptions).length > 0 ? transformOptions : undefined,
      });

    if (error || !data?.signedUrl) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl);
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}