export type ReelCommentReply = {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  authorCompany?: string;
  authorCountry?: string;
  isVerified?: boolean;
  content: string;
  createdAt: string;
  likes: number;
};

export type ReelComment = {
  id: string;
  reelId: string;
  authorName: string;
  authorAvatarUrl: string;
  authorCompany?: string;
  authorCountry?: string;
  isVerified?: boolean;
  content: string;
  createdAt: string;
  likes: number;
  replies: ReelCommentReply[];
};
