export const formatBookingId = (id: string | undefined | null) => {
  if (!id) return 'BK-000000';
  if (id.startsWith('BK-')) return id; // Already correctly formatted by backend
  // Fallback for old IDs
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const numId = Math.abs(hash).toString().slice(0, 6).padStart(6, '0');
  return `BK-${numId}`;
};
