import React, { useEffect, useState, useRef } from 'react'
import { getBrands, getModels, Brand, Model } from '../../services/api'

type Props = {
  value: string
  onChange: (v: string)=>void
}

export default function BrandModelAutocomplete({ value, onChange }: Props){
  const [options, setOptions] = useState<(Brand|Model)[]>([])
  const [loading, setLoading] = useState(false)

  // search both brands and models, debounce 300ms using useEffect
  const lastQuery = useRef('')
  useEffect(()=>{
    const q = value || ''
    if (!q || q.length < 2) { setOptions([]); return }
    lastQuery.current = q
    setLoading(true)
    const t = setTimeout(async ()=>{
      try{
        const [b,m] = await Promise.all([getBrands(q), getModels(undefined, q)])
        // only set if query didn't change
        if (lastQuery.current === q) setOptions([...b, ...m])
      }catch(e){
        // ignore
      }finally{ if (lastQuery.current === q) setLoading(false) }
    }, 300)

    return ()=>{ clearTimeout(t); }
  }, [value])

  return (
    <div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder="Марка или модель" className="w-full mt-1 rounded-md p-2 bg-white/6" />
      {loading && <div className="text-sm small-muted mt-1">Поиск...</div>}
      {options.length>0 && (
        <div className="mt-1 bg-white/3 rounded shadow-sm max-h-40 overflow-auto p-1">
          {options.map(opt=> (
            <div key={(opt as any).id} className="px-2 py-1 hover:bg-white/6 cursor-pointer" onClick={()=>onChange((opt as any).name)}>
              {(opt as any).name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
