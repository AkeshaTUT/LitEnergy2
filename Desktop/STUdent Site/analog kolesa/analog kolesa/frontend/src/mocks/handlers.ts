import * as msw from 'msw'
const rest = (msw as any).rest ?? (msw as any).http

// Use absolute base for handlers so node-mode MSW matches axios requests to http://localhost
const base = 'http://localhost/api'

const BRANDS = [
  { id: '1', name: 'Toyota' },
  { id: '2', name: 'Nissan' },
  { id: '3', name: 'BMW' },
  { id: '4', name: 'Hyundai' },
]

const MODELS = [
  { id: 'm1', name: 'Corolla', brandId: '1' },
  { id: 'm2', name: 'Camry', brandId: '1' },
  { id: 'm3', name: 'Skyline', brandId: '2' },
  { id: 'm4', name: 'X5', brandId: '3' },
]

const LISTINGS = Array.from({ length: 48 }).map((_, i) => {
  const brand = BRANDS[i % BRANDS.length]
  const model = MODELS[i % MODELS.length]
  return {
    id: String(i + 1),
    title: `${brand.name} ${model.name} ${2010 + (i % 12)}`,
    price: 500000 + (i * 10000),
    year: 2010 + (i % 12),
    km: 50000 + i * 1000,
    brand: brand.name,
    model: model.name,
    img: '/placeholder.png',
  }
})

export const handlers = [
  rest.get(/\/api\/brands/, (req, res, ctx) => {
    const q = (req.url.searchParams.get('q') || '').toLowerCase()
    const items = BRANDS.filter(b => b.name.toLowerCase().includes(q))
    return res(ctx.delay(200), ctx.status(200), ctx.json(items))
  }),

  rest.get(/\/api\/models/, (req, res, ctx) => {
    const q = (req.url.searchParams.get('q') || '').toLowerCase()
    const brandId = req.url.searchParams.get('brandId')
    let items = MODELS
    if (brandId) items = items.filter(m => m.brandId === brandId)
    items = items.filter(m => m.name.toLowerCase().includes(q))
    return res(ctx.delay(200), ctx.status(200), ctx.json(items))
  }),

  rest.get(/\/api\/listings/, (req, res, ctx) => {
    const qRaw = (req.url.searchParams.get('q') || '')
    const q = qRaw.toLowerCase()
    const minPrice = parseInt(req.url.searchParams.get('minPrice') || '0')
    const maxPrice = parseInt(req.url.searchParams.get('maxPrice') || '999999999')
    const page = parseInt(req.url.searchParams.get('page') || '1')
    const limit = parseInt(req.url.searchParams.get('limit') || '12')

    // If a text query is provided, return a deterministic single result to simplify tests
    if (q) {
      const item = {
        id: 'q1',
        title: `Result ${qRaw} 0`,
        price: 100000,
        year: 2020,
        km: 10000,
        brand: qRaw,
        model: qRaw,
        img: '/placeholder.png',
      }
      return res(ctx.delay(200), ctx.status(200), ctx.json({ data: [item], meta: { total: 1 } }))
    }

    let items = LISTINGS.filter(l => l.price >= minPrice && l.price <= maxPrice)

    const total = items.length
    const start = (page - 1) * limit
    const data = items.slice(start, start + limit)

    return res(ctx.delay(400), ctx.status(200), ctx.json({ data, meta: { total } }))
  }),
]
