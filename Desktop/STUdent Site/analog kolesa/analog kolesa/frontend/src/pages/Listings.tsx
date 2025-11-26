import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useLocalStorage from '../hooks/useLocalStorage'
import ListingCard from '../components/ListingCard'
import { getListings, Listing as APIListing } from '../services/api'
import Toast from '../components/Toast'
import SkeletonCard from '../components/SkeletonCard'
import PriceRangeSlider from '../components/filters/PriceRangeSlider'
import BrandModelAutocomplete from '../components/filters/BrandModelAutocomplete'

function rangeClamp(v:number, min:number, max:number){ return Math.max(min, Math.min(max, v)) }

export default function Listings(){
  const [storedFilters, setStoredFilters] = useLocalStorage<Record<string,string | number | null>>('filters', {})

  const [searchParams, setSearchParams] = useSearchParams()

  const [minPrice, setMinPrice] = useState<number | null>(storedFilters.minPrice ? Number(storedFilters.minPrice) : null)
  const [maxPrice, setMaxPrice] = useState<number | null>(storedFilters.maxPrice ? Number(storedFilters.maxPrice) : null)
  const [yearFrom, setYearFrom] = useState<number | null>(storedFilters.yearFrom ? Number(storedFilters.yearFrom) : null)
  const [yearTo, setYearTo] = useState<number | null>(storedFilters.yearTo ? Number(storedFilters.yearTo) : null)
  const [query, setQuery] = useState(storedFilters.query ? String(storedFilters.query) : '')

  const [page, setPage] = useState(1)
  const perPage = 12

  const [listings, setListings] = useState<APIListing[]>([])
  const [meta, setMeta] = useState<{ total: number }>({ total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // initialize from URL params on first load
  useEffect(()=>{
    const pMin = searchParams.get('min_price')
    const pMax = searchParams.get('max_price')
    const yFrom = searchParams.get('year_from')
    const yTo = searchParams.get('year_to')
    const q = searchParams.get('q')
    const p = searchParams.get('page')
    if(pMin) setMinPrice(Number(pMin))
    if(pMax) setMaxPrice(Number(pMax))
    if(yFrom) setYearFrom(Number(yFrom))
    if(yTo) setYearTo(Number(yTo))
    if(q) setQuery(q)
    if(p) setPage(Number(p))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // fetch with debounce + abort
  useEffect(()=>{
    const controller = new AbortController()
    const handler = setTimeout(()=>{
      setLoading(true)
      setError(null)

      // prepare params matching our mock API
      const params: Record<string, any> = { page, limit: perPage }
      if (minPrice != null) params.minPrice = minPrice
      if (maxPrice != null) params.maxPrice = maxPrice
      if (yearFrom != null) params.yearFrom = yearFrom
      if (yearTo != null) params.yearTo = yearTo
      if (query) params.q = query

      // sync URL + localStorage (no extra debounce)
      const urlParams: Record<string,string> = {}
      if(minPrice != null) urlParams.min_price = String(minPrice)
      if(maxPrice != null) urlParams.max_price = String(maxPrice)
      if(yearFrom != null) urlParams.year_from = String(yearFrom)
      if(yearTo != null) urlParams.year_to = String(yearTo)
      if(query) urlParams.q = String(query)
      if(page) urlParams.page = String(page)
      setSearchParams(urlParams)
      setStoredFilters({ minPrice, maxPrice, yearFrom, yearTo, query })

      getListings(params, controller.signal)
        .then(res=>{
          setListings(res.data)
          setMeta(res.meta)
        })
        .catch((err:any)=>{
          if (err?.name === 'CanceledError' || err?.message === 'canceled') return
          setError('Ошибка загрузки данных')
        })
        .finally(()=> setLoading(false))
    }, 350)

    return ()=>{ clearTimeout(handler); controller.abort() }
  }, [minPrice, maxPrice, yearFrom, yearTo, query, page])

  const total = meta.total
  const pages = Math.max(1, Math.ceil(total / perPage))

  function reset(){ setMinPrice(null); setMaxPrice(null); setYearFrom(null); setYearTo(null); setQuery(''); setPage(1) }

  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 py-8">
      <aside className="lg:col-span-1">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Фильтры</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm small-muted">Цена</label>
              <div className="mt-1">
                <PriceRangeSlider min={minPrice} max={maxPrice} onChange={(a:number|null,b:number|null)=>{ setMinPrice(a); setMaxPrice(b) }} />
              </div>
            </div>

            <div>
              <label className="block text-sm small-muted">Год от</label>
              <input type="number" value={yearFrom ?? ''} onChange={e=>setYearFrom(e.target.value?parseInt(e.target.value):null)} className="w-full mt-1 rounded-md p-2 bg-white/6" />
            </div>
            <div>
              <label className="block text-sm small-muted">Год до</label>
              <input type="number" value={yearTo ?? ''} onChange={e=>setYearTo(e.target.value?parseInt(e.target.value):null)} className="w-full mt-1 rounded-md p-2 bg-white/6" />
            </div>
            <div>
              <label className="block text-sm small-muted">Поиск (марка/модель)</label>
              <div className="mt-1">
                <BrandModelAutocomplete value={query} onChange={(v:string)=>setQuery(v)} />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={()=>{ setPage(1) }} className="px-3 py-2 rounded-md bg-white/6">Показать</button>
              <button onClick={reset} className="px-3 py-2 rounded-md bg-white/6">Сбросить фильтры</button>
            </div>
          </div>
        </div>
      </aside>

      <section className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Результаты поиска</h1>
          <div className="small-muted">Найдено: {total}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? Array.from({length:6}).map((_,i)=>(<SkeletonCard key={i} />)) : listings.map(item=> <ListingCard key={item.id} listing={{...item, price: `${item.price} ₸`, photos:[{url:item.img||'/placeholder.png'}]}} />)}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 rounded-md bg-white/6">Назад</button>
          {Array.from({length:pages}).map((_,i)=> (
            <button key={i} onClick={()=>setPage(i+1)} className={`px-3 py-2 rounded-md ${page===i+1? 'bg-iris text-white' : 'bg-white/6'}`}>{i+1}</button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(pages,p+1))} className="px-3 py-2 rounded-md bg-white/6">Вперёд</button>
        </div>

        <div className="mt-8 card p-4">
          <h3 className="font-semibold mb-2">Популярные запросы</h3>
          <div className="flex gap-3 flex-wrap">
            <a href="#" className="px-3 py-1 bg-white/6 rounded">Camry 70</a>
            <a href="#" className="px-3 py-1 bg-white/6 rounded">Prado 150</a>
            <a href="#" className="px-3 py-1 bg-white/6 rounded">Tesla Model 3</a>
          </div>
        </div>

        {error && <Toast message={error} onRetry={()=>{/* just re-run by toggling page (simple) */ setPage(p=>p) }} onClose={()=>setError(null)} />}
      </section>
    </div>
  )
}
