import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  min_stock: number
  supplier: string
  barcode?: string
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_amount: number
  customer_name: string
  created_at: string
}

export interface Purchase {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_amount: number
  supplier: string
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "staff"
  created_at: string
}
