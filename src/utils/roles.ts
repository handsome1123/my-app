export const roles = ['admin', 'seller', 'buyer'] as const;
export type Role = typeof roles[number];
