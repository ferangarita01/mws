// ================================================
// TIPOS PRINCIPALES DE LA APLICACIÓN MUSICAL
// ================================================

// ===== SIGNER =====
export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  signed: boolean;
  signedAt?: string; // ISO date string
  signature?: string; // Data URL of the signature image
}

// ===== USUARIO =====
export interface User {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  photoURL?: string;
  
  // Campos profesionales de la industria musical
  artistName?: string;
  primaryRole?: string;
  genres?: string[] | string;
  publisher?: string;
  proSociety?: 'none' | 'ascap' | 'bmi' | 'sesac' | 'other';
  ipiNumber?: string;
  phone?: string;
  locationCountry?: string;
  locationState?: string;
  locationCity?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'professional';
  bio?: string;
  website?: string;

  // Integración con Stripe
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
  planId?: 'free' | 'creator' | 'pro';
  agreementCount?: number;
}

// ===== COMPOSER (colaborador en un acuerdo) =====
export interface Composer {
  id: string;
  name: string;
  email: string;
  role: string;
  share: number;
  publisher: string;
  ipiNumber: string;
  isRegisteredUser: boolean;
  documentId: string;
  signature?: string;
  signedAt?: string;
}

// ===== AGREEMENT =====
export type AgreementStatus = 'draft' | 'pending' | 'signed' | 'archived';

export interface Agreement {
  id: string;
  name?: string; // opcional, algunos acuerdos pueden no tener "name"
  songTitle: string;
  composers: Composer[];
  publicationDate?: string;
  createdAt: string;
  lastModified: string;
  status: AgreementStatus; // ✅ unificado
  ownerId: string;
  isrc?: string;
  iswc?: string;
  signers?: Signer[];
}

// ===== CONTRACT / TEMPLATE (para librería) =====
export type ContractStatus = "Gratis" | "Pro" | "Completado" | "Borrador" | "Pendiente";

export interface Contract {
  id: string;
  title: string;
  tags: string;
  category: string;
  type: "Plantilla" | "Contrato";
  status: ContractStatus;
  mins?: string;
  filetypes?: string;
  verified?: boolean;
  image: string;
  desc: string;
  shortDesc: string;
  content?: string; 
  userId?: string;
  signers?: Signer[];
  createdAt: string;
  lastModified?: string;
  pdfUrl?: string;
}

// ================================================
// TIPOS DE UTILIDAD
// ================================================

export type EmailPasswordCredentials = {
  email: string;
  password: string;
};

export type SignUpDetails = {
  fullName: string;
  email: string;
  password: string;
  artistName?: string;
  primaryRole?: string;
  genres?: string;
  publisher?: string;
  proSociety?: string;
  ipiNumber?: string;
};

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: any;
};

// ================================================
// VALIDADORES (UTILIDAD)
// ================================================

export const isValidUser = (data: any): data is User => {
  return typeof data === 'object' &&
         typeof data.uid === 'string' &&
         typeof data.displayName === 'string' &&
         typeof data.email === 'string' &&
         typeof data.createdAt === 'string';
};

export const isValidComposer = (data: any): data is Composer => {
  return typeof data === 'object' &&
         typeof data.id === 'string' &&
         typeof data.name === 'string' &&
         typeof data.role === 'string' &&
         typeof data.share === 'number';
};

export const isValidAgreement = (data: any): data is Agreement => {
  return typeof data === 'object' &&
         typeof data.id === 'string' &&
         typeof data.songTitle === 'string' &&
         Array.isArray(data.composers) &&
         data.composers.every(isValidComposer);
};