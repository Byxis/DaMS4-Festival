export type RoleEn = 'admin' | 'editor' | 'guest' | 'publisher';
export type RoleFr = 'Administrateur' | 'Éditeur' | 'Éditeur de jeux' | 'Invité';

export const ROLE_EN_TO_FR: Record<RoleEn, RoleFr> = {
  admin: 'Administrateur',
  editor: 'Éditeur',
  publisher: 'Éditeur de jeux',
  guest: 'Invité',
};

export const ROLE_FR_TO_EN: Record<RoleFr, RoleEn> = {
  Administrateur: 'admin',
  Éditeur: 'editor',
  "Éditeur de jeux": 'publisher',
  Invité: 'guest',
};

//converters
export function roleEnToFr(role: string): string {
  return ROLE_EN_TO_FR[role as RoleEn] ?? role;
}

export function roleFrToEn(role: string): RoleEn {
  return ROLE_FR_TO_EN[role as RoleFr] ?? 'guest';
}
