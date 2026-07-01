export interface Customer {
  id: number
  name: string
  phone: string
  email?: string | null
  city?: string | null
  total_orders?: number
}

export interface AuthResponse {
  token: string
  customer: Customer
}

export interface OpeningHourDay {
  is_open: boolean
  open: string
  close: string
}

export interface Restaurant {
  id: number
  name: string
  slug: string
  category: string
  city: string | null
  address: string | null
  phone: string
  logo_url: string | null
  banner_url: string | null
  is_open: boolean
  min_order_amount: number
  avg_prep_time: number | string
  latitude: string | null
  longitude: string | null
  distance_km?: number | null
  delivery_fee?: number | null
  delivery_base_fee?: string | null
  delivery_fee_per_km?: string | null
  max_delivery_km?: string | null
  opening_hours?: Record<string, OpeningHourDay> | string | null
  description?: string | null
  tagline?: string | null
}

export interface Dish {
  id: number
  name: string
  description: string | null
  price: number
  compare_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  is_spicy: boolean
  is_vegetarian: boolean
  prep_time: number | null
  calories: number | null
}

export interface MenuCategory {
  id: number
  name: string
  dishes: Dish[]
}

export interface Menu {
  restaurant_id: number
  currency: string
  categories: MenuCategory[]
}

export interface DeliveryEstimate {
  deliverable: boolean
  delivery_fee: number
  distance_km: number
  estimated_minutes: number
  is_peak_hour: boolean
  breakdown: {
    base_fee: number
    distance_fee: number
    peak_surcharge: number
    prep_minutes: number
    transit_minutes: number
  }
}

export interface Address {
  id: number
  label: string
  address: string
  city: string
  zone?: string
  latitude: number | string
  longitude: number | string
  instructions?: string | null
  is_default: boolean
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  name: string
  quantity: number
  unit_price: number
  total: number
}

export interface Order {
  id: number
  reference: string
  tracking_token: string
  status: OrderStatus
  payment_method: string
  subtotal: number
  delivery_fee: number
  total: number
  estimated_minutes: number
  restaurant_name?: string
  created_at?: string
  items: OrderItem[]
}

export interface CreateOrderResponse {
  order: Order
  tracking_token: string
  payment_url: string
}

export interface Driver {
  name: string
  phone: string
  latitude: number
  longitude: number
  rating: string
  vehicle?: string
}

export interface TrackingResponse {
  order_status: OrderStatus
  estimated_minutes: number
  delivery_address?: string
  delivery_lat?: number
  delivery_lng?: number
  delivery: {
    status: string
    status_label: string
    driver: Driver | null
  }
  timeline: {
    ordered_at: string | null
    confirmed_at: string | null
    preparing_at: string | null
    ready_at: string | null
    driver_assigned_at: string | null
    picked_up_at: string | null
    completed_at: string | null
  }
}
