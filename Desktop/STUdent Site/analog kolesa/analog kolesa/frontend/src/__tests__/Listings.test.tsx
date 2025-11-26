import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Listings from '../pages/Listings'

// mock complex filter components to simple inputs for tests
vi.mock('../components/filters/PriceRangeSlider', () => ({ default: () => React.createElement('input', { placeholder: 'price' }) }))
vi.mock('../components/filters/BrandModelAutocomplete', () => ({ default: (props: any) => React.createElement('input', { placeholder: 'Марка или модель', value: props.value, onChange: (e:any)=>props.onChange(e.target.value) }) }))

// mock API calls to be deterministic and support AbortSignal cancellation
vi.mock('../services/api', () => {
  return {
    getListings: (params: any, signal?: AbortSignal) => {
      return new Promise((resolve, reject) => {
        const q = params.q || ''
        const delay = q ? 200 : 400
        const t = setTimeout(() => {
          const item = { id: '1', title: `Result ${q} 0`, price: 100000, year: 2020, km: 10000, brand: q, model: q, img: '/placeholder.png' }
          resolve({ data: q ? [item] : [], meta: { total: q ? 1 : 0 } })
        }, delay)

        if (signal) signal.addEventListener('abort', () => { clearTimeout(t); const err: any = new Error('canceled'); err.name = 'CanceledError'; reject(err) })
      })
    },
    getBrands: async (q: string) => [] as any[],
    getModels: async (brandId: any, q: string) => [] as any[],
  }
})

describe('Listings page', ()=>{
  it('initializes filters from URL and renders results', async ()=>{
    render(
      <MemoryRouter initialEntries={["/listings?q=toyota&page=2"]}>
        <Routes>
          <Route path="/listings" element={<Listings/>} />
        </Routes>
      </MemoryRouter>
    )

  // page header present
  expect(screen.getByText(/Результаты поиска/)).toBeDefined()

  // wait for items to appear (after fetch)
  await screen.findByText(/Result toyota 0/)
  })

  it('updates URL and localStorage after debounce when changing filter', async ()=>{
    // use jsdom localStorage
    localStorage.clear()
    render(
      <MemoryRouter initialEntries={["/listings"]}>
        <Routes>
          <Route path="/listings" element={<Listings/>} />
        </Routes>
      </MemoryRouter>
    )

  const input = await screen.findByPlaceholderText(/Марка или модель/i)
    fireEvent.change(input, { target: { value: 'camry' } })

    // wait for debounce (350ms + fetch) and for stored query to be updated
    await waitFor(()=> {
      const raw = localStorage.getItem('filters')
      if (!raw) throw new Error('no filters yet')
      const stored = JSON.parse(raw)
      expect(stored.query).toBe('camry')
    }, { timeout: 2000 })
  })

  it('cancels previous requests so only last response is applied', async ()=>{
    render(
      <MemoryRouter initialEntries={["/listings"]}>
        <Routes>
          <Route path="/listings" element={<Listings/>} />
        </Routes>
      </MemoryRouter>
    )

  const input = await screen.findByPlaceholderText(/Марка или модель/i)
    // change quickly multiple times
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.change(input, { target: { value: 'abc' } })

  // wait for UI to update with last applied query
  await screen.findByText(/Result abc 0/)
  })
})
