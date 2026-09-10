export interface MediaInfo {
  embedUrl: string;
  originalUrl: string;
  isPdf: boolean;
  isDrive: boolean;
  fileType: 'pdf' | 'image' | 'drive' | 'unknown';
}

/**
 * Parses and formats a certificate file or document URL.
 * Converts Google Drive sharing links to embeddable preview URLs.
 */
export function getMediaInfo(url: string): MediaInfo {
  if (!url || typeof url !== 'string') {
    return {
      embedUrl: '',
      originalUrl: '',
      isPdf: false,
      isDrive: false,
      fileType: 'unknown',
    };
  }

  const trimmed = url.trim();

  // Check for Google Drive file link patterns
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  const driveOpenMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  const driveUcMatch = trimmed.match(/drive\.google\.com\/uc\?(?:[^&]+&)*id=([a-zA-Z0-9_-]+)/i);
  const docsMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i);

  const driveId =
    driveFileMatch?.[1] ||
    driveOpenMatch?.[1] ||
    driveUcMatch?.[1] ||
    docsMatch?.[1];

  if (driveId) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      originalUrl: trimmed,
      isPdf: true,
      isDrive: true,
      fileType: 'drive',
    };
  }

  // Check for direct PDF extensions or path
  const isPdf = /\.pdf($|\?)/i.test(trimmed) || trimmed.toLowerCase().includes('.pdf');

  if (isPdf) {
    return {
      embedUrl: trimmed,
      originalUrl: trimmed,
      isPdf: true,
      isDrive: false,
      fileType: 'pdf',
    };
  }

  return {
    embedUrl: trimmed,
    originalUrl: trimmed,
    isPdf: false,
    isDrive: false,
    fileType: 'image',
  };
}
