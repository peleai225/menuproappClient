import { api } from './api'
import type {
  Address,
  AuthResponse,
  CreateOrderResponse,
  Customer,
  DeliveryEstimate,
  Menu,
  Order,
  Restaurant,
  TrackingResponse,
} from './types'

/* ---------------- Restaurants (public) ---------------- */

interface RestaurantQuery {
  city?: string
  category?: string
  lat?: number
  lng?: number
  open_now?: boolean
}

export async function getRestaurants(params: RestaurantQuery = {}): Promise<Restaurant[]> {
  const { data } = await api.get('/restaurants', { params })
  const list: Restaurant[] = data.data ?? data.restaurants ?? data
  return Array.isArray(list) ? list : []
}

export async function getNearbyRestaurants(
  lat: number,
  lng: number,
  radiusKm = 15,
): Promise<Restaurant[]> {
  const { data } = await api.get('/restaurants/nearby', {
    params: { lat, lng, radius_km: radiusKm },
  })
  const list: Restaurant[] = data.data ?? data.restaurants ?? data
  return Array.isArray(list) ? list : []
}

export async function getRestaurant(id: number): Promise<Restaurant> {
  const { data } = await api.get(`/restaurants/${id}`)
  return data.data ?? data.restaurant ?? data
}

export async function getMenu(id: number): Promise<Menu> {
  const { data } = await api.get(`/restaurants/${id}/menu`)
  const menu: Menu = data.data ?? data
  // Filter out empty categories
  if (menu.categories) {
    menu.categories = menu.categories.filter((c) => c.dishes && c.dishes.length > 0)
  }
  return menu
}

export async function getDeliveryEstimate(
  id: number,
  lat: number,
  lng: number,
): Promise<DeliveryEstimate | null> {
  try {
    const { data } = await api.get(`/restaurants/${id}/delivery-estimate`, {
      params: { lat, lng },
    })
    return data.data ?? data
  } catch (error: any) {
    if (error.response?.status === 422) {
      const d = error.response.data
      return d.data ?? d
    }
    return null
  }
}

/* ---------------- Auth ---------------- */

export async function login(payload: { phone: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post('/client/auth/login', payload)
  return data
}

export async function register(payload: {
  name: string
  phone: string
  password: string
  email?: string
  city?: string
}): Promise<AuthResponse> {
  // L'API n'attend pas password_confirmation
  const body: Record<string, string> = {
    name: payload.name,
    phone: payload.phone,
    password: payload.password,
  }
  if (payload.email) body.email = payload.email
  if (payload.city) body.city = payload.city
  const { data } = await api.post('/client/auth/register', body)
  return data
}

export async function getMe(): Promise<Customer> {
  const { data } = await api.get('/client/auth/me')
  return data.customer ?? data.data ?? data
}

export async function logout(): Promise<void> {
  try {
    await api.post('/client/auth/logout')
  } catch {
    /* ignore */
  }
}

export async function updateFcmToken(fcm_token: string): Promise<void> {
  await api.patch('/client/auth/fcm-token', { fcm_token })
}

export async function updateProfile(payload: {
  name?: string
  email?: string
  city?: string
}): Promise<Customer> {
  const { data } = await api.patch('/client/auth/profile', payload)
  return data.customer ?? data.data ?? data
}

/* ---------------- Addresses ---------------- */

export async function getAddresses(): Promise<Address[]> {
  const { data } = await api.get('/client/addresses')
  return data.data ?? data.addresses ?? data
}

export async function createAddress(payload: Partial<Address>): Promise<Address> {
  const { data } = await api.post('/client/addresses', payload)
  return data.data ?? data.address ?? data
}

export async function updateAddress(id: number, payload: Partial<Address>): Promise<Address> {
  const { data } = await api.patch(`/client/addresses/${id}`, payload)
  return data.data ?? data.address ?? data
}

export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`/client/addresses/${id}`)
}

/* ---------------- Orders ---------------- */

export interface CreateOrderPayload {
  restaurant_id: number
  items: { dish_id: number; quantity: number; notes?: string }[]
  delivery_lat: number
  delivery_lng: number
  delivery_address: string
  delivery_city: string
  delivery_instructions?: string
  payment_method: 'wave' | 'cash'
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const { data } = await api.post('/client/orders', payload)
  return data
}

export async function getOrderHistory(): Promise<Order[]> {
  const { data } = await api.get('/client/orders/history')
  return data.data ?? data.orders ?? data
}

export async function trackOrder(token: string): Promise<TrackingResponse> {
  const { data } = await api.get(`/client/orders/track/${token}`)
  return data.data ?? data
}

export async function cancelOrder(id: number): Promise<void> {
  await api.post(`/client/orders/${id}/cancel`)
}

/* ---------------- Payment ---------------- */

export async function initiatePayment(orderId: number): Promise<{ payment_url: string }> {
  const { data } = await api.post(`/client/payment/${orderId}/initiate`)
  return data
}

export async function getPaymentStatus(
  orderId: number,
): Promise<{ payment_status: string; order_status: string }> {
  const { data } = await api.get(`/client/payment/${orderId}/status`)
  return data
}
