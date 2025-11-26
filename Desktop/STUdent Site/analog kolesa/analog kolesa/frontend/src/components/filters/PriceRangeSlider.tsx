import React from 'react'

type Props = {
  min: number | null
  max: number | null
  onChange: (min:number|null,max:number|null)=>void
}

export default function PriceRangeSlider({ min, max, onChange }: Props){
  return (
    <div>
      <div className="flex gap-2">
        <input type="number" value={min ?? ''} onChange={e=>onChange(e.target.value?parseInt(e.target.value):null, max)} className="w-1/2 rounded-md p-2 bg-white/6" />
        <input type="number" value={max ?? ''} onChange={e=>onChange(min, e.target.value?parseInt(e.target.value):null)} className="w-1/2 rounded-md p-2 bg-white/6" />
      </div>
      <div className="text-sm small-muted mt-1">Используйте ползунки или введите вручную</div>
    </div>
  )
}
