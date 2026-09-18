import { NextRequest, NextResponse } from 'next/server';
import { getMediaFileById } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    const fileRecord = await getMediaFileById(fileId);

    if (!fileRecord || !fileRecord.buffer || fileRecord.buffer.length === 0) {
      return NextResponse.json({ error: 'File not found or is empty' }, { status: 404 });
    }

    // Set appropriate streaming headers
    const headers = new Headers();
    headers.set('Content-Type', fileRecord.contentType || 'application/octet-stream');
    headers.set('Content-Length', fileRecord.buffer.length.toString());
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(fileRecord.filename)}"`);
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(new Uint8Array(fileRecord.buffer), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error fetching media file from MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve media file' },
      { status: 500 }
    );
  }
}
