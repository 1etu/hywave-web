export interface Category {
  name: string;
  icon: React.ElementType;  
}

export type ChangeType = "NEW_FEATURE" | "IMPROVEMENT" | "FIX" | "OTHER" | string;


export interface ChangelogEntry {
  id: number;
  date: string;
  version: string;
  title: string;
  categories: string[];
  description: string;
  changes: { text: string; type: ChangeType }[];
  images: string[];
  developerNotes: string;
  commitInfo: {
    author: string;
    commitType: string;
    commitDate: string;
    commitHash: string;
  };
}

export interface ForumPost {
  id: number;
  title: string;
  author: string;
  avatar: string;
  content: string;
  upvotes: number;
  downvotes: number;
  comments: { author: string; content: string }[];
  tags: string[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}