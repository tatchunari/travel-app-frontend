export interface Trip {
  id: number | null;
  title: string;
  description: string;
  photos: string[];
  tags: string[];
  latitude: number;
  longitude: number;

  authorId: string;
  authorName: string;
  authorImageUrl: string;
}
