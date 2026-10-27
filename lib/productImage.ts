export const productImage = (p: { id: string; image?: string | null }) => p.image || `/${p.id}.jpg`;
