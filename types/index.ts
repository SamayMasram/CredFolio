export type ProfileVisibility = 'public' | 'unlisted' | 'private';

export interface UserProfile {
  uid: string;
  username: string;
  full_name: string;
  headline?: string;
  bio?: string;
  avatar_url?: string;
  visibility: ProfileVisibility;
  created_at: string;
  updated_at: string;
}

export type CertificateType = 'certificate' | 'badge';

export interface Certificate {
  id: string;
  profile_id: string;
  title: string;
  issuer: string;
  issue_date: string; // ISO format YYYY-MM-DD
  expiry_date?: string | null;
  credential_url?: string | null;
  file_url?: string | null;
  type: CertificateType;
  category?: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UsernameMapping {
  username: string;
  uid: string;
  created_at: string;
}
