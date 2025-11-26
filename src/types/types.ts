export interface Trip {
  id: number | undefined; // null for new trips
  title: string;
  description: string;
  photos: string[]; // List of photo URLs
  tags: string[]; // List of tags
  latitude: number;
  longitude: number;
  // authorId is managed by the backend
}
