import axios from 'axios'

// In the browser we use the relative '/api' base path. In the Node test environment
// axios needs an absolute URL so MSW's node server can intercept the request.
const isNode = typeof window === 'undefined' || process.env.NODE_ENV === 'test'
// include /api in the base when running under Node tests so handlers defined for
// '/api/*' paths match (MSW node server listens on http://localhost)
const api = axios.create({ baseURL: isNode ? 'http://localhost/api' : '/api' })

export type Brand = { id: string; name: string }
export type Model = { id: string; name: string; brandId: string }
export type Listing = {
  id: string
  title: string
  price: number
  year: number
  km: number
  brand: string
  model: string
  img?: string
}

export async function getBrands(query: string) {
  const res = await api.get<Brand[]>('/brands', { params: { q: query } })
  return res.data
}

export async function getModels(brandId: string | undefined, query: string) {
  const res = await api.get<Model[]>('/models', { params: { brandId, q: query } })
  return res.data
}

export type ListingsResponse = { data: Listing[]; meta: { total: number } }
export async function getListings(params: Record<string, any>, signal?: AbortSignal) {
  const res = await api.get<ListingsResponse>('/listings', { params, signal })
  return res.data
}

export default api
