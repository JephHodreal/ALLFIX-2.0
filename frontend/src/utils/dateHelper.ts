export function isExpired(updatedAt: any): boolean {
  if (!updatedAt) return false;
  
  // Handle Firestore Timestamp or standard Date string
  const date = updatedAt.toDate ? updatedAt.toDate() : new Date(updatedAt);
  
  if (isNaN(date.getTime())) return false;
  
  const now = new Date();
  const hoursSince = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  return hoursSince > 48;
}