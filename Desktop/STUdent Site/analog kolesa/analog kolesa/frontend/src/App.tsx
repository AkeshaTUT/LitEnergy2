import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Listing from './pages/Listing'
import Profile from './pages/Profile'
import Listings from './pages/Listings'
import Sell from './pages/Sell'
import News from './pages/News'
import About from './pages/About'
import Footer from './components/Footer'
import Favorites from './pages/Favorites'
import Compare from './pages/Compare'

export default function App(){
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="fixed top-0 left-0 right-0 bg-paper/70 backdrop-blur border-b border-white/6">
        <div className="container mx-auto px-4 py-4 grid grid-cols-3 items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div style={{width:40,height:40,borderRadius:10,background:'#5351e5'}} aria-hidden></div>
              <div className="text-2xl font-bold">Rovante.kz</div>
            </Link>
          </div>

          <nav className="flex justify-center">
            <ul className="flex items-center gap-6">
              <li><Link to="/listings" className="small-muted">Объявления</Link></li>
              <li><Link to="/" className="small-muted">Категории</Link></li>
              <li><Link to="/news" className="small-muted">Новости</Link></li>
              <li><Link to="/about" className="small-muted">О нас</Link></li>
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-3">
            <button className="p-2 rounded-md small-muted" aria-label="Поиск">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <Link to="/favorites" className="p-2 rounded-md small-muted" aria-label="Избранное">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7-4.35-9-7.2C-" fill="currentColor"/></svg>
            </Link>

            <Link to="/profile" className="w-9 h-9 rounded-full bg-white/6 flex items-center justify-center small-muted avatar" aria-label="Профиль">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" opacity="0.9" />
                <path d="M4 20c0-2.761 4.477-5 8-5s8 2.239 8 5v1H4v-1z" fill="currentColor" opacity="0.6" />
              </svg>
            </Link>

            <Link to="/sell" className="px-5 py-2 text-white rounded-full cta-gradient header-cta">+ Подать объявление</Link>
          </div>

        </div>
      </header>

  <main className="main-content px-6 pt-28">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings/>} />
          <Route path="/listings/:id" element={<Listing />} />
          <Route path="/favorites" element={<Favorites/>} />
          <Route path="/compare" element={<Compare/>} />
          <Route path="/sell" element={<Sell/>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/news" element={<News/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
        <Footer />
      </main>
    </div>
  )
}
