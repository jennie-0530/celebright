export interface User {
  id: number;
  username: string;
  email: string;
  about_me?: string;
  created_at: string;
  is_influencer: boolean;
  profile_picture?: string | null;
  influencer?: Influencer;
}

export interface Influencer {
  id: number;
  category: string;
  banner_picture: string;
  follower_count: number;
  products: MembershipProduct[];
}

export interface MembershipProduct {
  id: number;
  level: number;
  name: string;
  image?: string | null;
  price: number;
  benefits: string[];
  is_active: boolean;
}