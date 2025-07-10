export interface Item {
  id?: string
  created_at: string
  name: string
  category: string
  description: string
  location: string
  date: string
  type: "lost" | "found"
  status: "pending" | "matched" | "claimed" | "closed"
  user_id: string
  images: string[]
  condition?: string
}


export interface Profile {
  id: string
  created_at: string
  updated_at: string
  username: string
  full_name: string
  avatar_url: string
  email: string
  is_admin: boolean
}

export interface Message {
  id?: string
  created_at: string
  sender_id: string
  receiver_id: string
  content: string
  item_id: string
  read: boolean
}

export interface Match {
  id?: string
  created_at: string
  lost_item_id: string
  found_item_id: string
  status: "suggested" | "pending" | "confirmed" | "rejected"
  finder_confirmed?: boolean
  loser_confirmed?: boolean
  rejected_by?: string
  rejection_reason?: string
}

export interface Meetup {
  id?: string
  match_id: string
  lost_item_id: string
  found_item_id: string
  loser_id: string
  finder_id: string
  status: "scheduled" | "pending" | "completed" | "cancelled"
  created_at: string
  scheduled_date: any
  scheduled_time?: string
  location?: string
  notes?: string
  completed_at?: string
  completed_by?: string
}

export interface Notification {
  id?: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  match_id?: string
  meetup_id?: string
  item_id?: string
}

export interface Payment {
  id?: string
  created_at: string
  sender_id: string
  receiver_id: string
  item_id: string
  match_id?: string
  meetup_id?: string
  amount: number
  platform_fee: number
  receiver_amount: number
  status: "pending" | "completed" | "failed"
  payment_type: "item_payment" | "reward_payment"
  order_id?: string
  payment_session_id?: string
  payment_details?: any
  completed_at?: string
  failed_at?: string
}
