export interface UtilisateurAdmin {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'editor';
  fullName: string;
  avatar?: string;
  phone?: string;
  dateCreated: string;
  dernierLogin: string | null;
  isActive: boolean;
}
