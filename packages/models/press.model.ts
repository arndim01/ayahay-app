export interface IPress {
  id: number;
  shippingLineId: number;
  title: string;
  content: string;
  publishedDate: Date;
  isPublish: boolean;
  videoUrl: string;
  articleUrl: string;
  type: string;
  category: string;
}