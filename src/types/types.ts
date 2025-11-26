export interface Trip {
  id: number | null; // null for new trips
  title: string;
  description: string;
  photos: string[]; // List of photo URLs
  tags: string[]; // List of tags
  latitude: number;
  longitude: number;

  // Author fields synced from Clerk on submission
  authorId: string;
  authorName: string;
  authorImageUrl: string;
}
