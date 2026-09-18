import { NextRequest, NextResponse } from 'next/server';
import { storeMediaFile } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Max file size: 14MB (MongoDB BSON document limit is 16MB; leaving room for metadata overhead)
const MAX_FILE_SIZE = 14 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in request' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed size of 16MB' },
        { status: 400 }
      );
    }

    let contentType = file.type || 'application/octet-stream';
    const filename = file.name || 'uploaded_file';

    // Infer content type from file extension if missing or generic
    if (contentType === 'application/octet-stream' || !contentType) {
      const lowerName = filename.toLowerCase();
      if (lowerName.endsWith('.pdf')) contentType = 'application/pdf';
      else if (lowerName.endsWith('.png')) contentType = 'image/png';
      else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (lowerName.endsWith('.webp')) contentType = 'image/webp';
      else if (lowerName.endsWith('.svg')) contentType = 'image/svg+xml';
    }

    const isAllowed = ALLOWED_MIME_TYPES.some((allowed) => contentType.startsWith(allowed));
    if (!isAllowed) {
      return NextResponse.json(
        { error: `File type '${contentType}' is not supported. Please upload a PDF or image file.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileId = await storeMediaFile({
      filename,
      contentType,
      buffer,
    });

    const fileUrl = `/api/media/${fileId}`;

    return NextResponse.json({
      success: true,
      id: fileId,
      url: fileUrl,
      filename,
      contentType,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error uploading file to MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file to MongoDB' },
      { status: 500 }
    );
  }
}
