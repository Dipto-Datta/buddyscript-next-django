export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
  avatar: string | null;
  date_joined: string;
  reaction_type?: string;
}

export interface Reply {
  id: number;
  author: User;
  content: string;
  like_count: number;
  is_liked: boolean;
  user_reaction: string | null;
  reaction_counts: Record<string, number>;
  created_at: string;
}

export interface Comment {
  id: number;
  author: User;
  content: string;
  parent: number | null;
  replies: Reply[];
  like_count: number;
  is_liked: boolean;
  user_reaction: string | null;
  reaction_counts: Record<string, number>;
  created_at: string;
}

export interface Post {
  id: number;
  author: User;
  content: string;
  image: string | null;
  visibility: "public" | "private";
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  user_reaction: string | null;
  reaction_counts: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Notification {
  id: number;
  recipient: number;
  sender: User | null;
  notification_type: "post_created" | "post_reacted" | "comment_created" | "comment_reacted" | "reply_created";
  object_id: number | null;
  text: string;
  is_read: boolean;
  created_at: string;
}
