export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface IPrivacyPolicy {
  id: number;
  shippingLineId: number;
  titleId: string;
  title: string;
  content: string | ParagraphBlock[];
}
