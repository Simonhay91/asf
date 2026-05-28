import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import SiteSubNav from './components/SiteSubNav'
import Footer from './components/Footer'
import QuoteModal from './components/QuoteModal'
import TrailingSlashRedirect from './components/TrailingSlashRedirect'
import Home from './pages/Home'
import District from './pages/District'
import City from './pages/City'
import Blog from './pages/Blog'
import BlogList from './pages/BlogList'
import Admin from './pages/Admin'
import Service from './pages/Service'
import ServiceList from './pages/ServiceList'
import PriceList from './pages/PriceList'
import RegionList from './pages/RegionList'
import MoscowList from './pages/MoscowList'
import MoscowOkrug from './pages/MoscowOkrug'
import Kontakty from './pages/Kontakty'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quoteComment, setQuoteComment] = useState('')
  const location = useLocation()

  const openQuote = (comment = '') => {
    setQuoteComment(typeof comment === 'string' ? comment : '')
    setQuoteOpen(true)
  }

  const closeQuote = () => {
    setQuoteOpen(false)
    setQuoteComment('')
  }

  const isAdmin = location.pathname.startsWith('/sys-9x4k2m')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onQuoteClick={openQuote} />
      {!isAdmin && <SiteSubNav />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home onQuoteClick={openQuote} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/home/" element={<Navigate to="/" replace />} />
          <Route path="/moskva/" element={<MoscowList />} />
          <Route path="/moskva" element={<TrailingSlashRedirect />} />
          <Route path="/moskva/:okrug/" element={<MoscowOkrug onQuoteClick={openQuote} />} />
          <Route path="/moskva/:okrug" element={<TrailingSlashRedirect />} />
          <Route path="/moskva/:okrug/:slug/" element={<District onQuoteClick={openQuote} />} />
          <Route path="/moskva/:okrug/:slug" element={<TrailingSlashRedirect />} />
          <Route path="/podmoskovye/:slug/" element={<City onQuoteClick={openQuote} />} />
          <Route path="/podmoskovye/:slug" element={<TrailingSlashRedirect />} />
          <Route path="/uslugi/" element={<ServiceList onQuoteClick={openQuote} />} />
          <Route path="/uslugi" element={<TrailingSlashRedirect />} />
          <Route path="/uslugi/:slug/" element={<Service onQuoteClick={openQuote} />} />
          <Route path="/uslugi/:slug" element={<TrailingSlashRedirect />} />
          <Route path="/prajs-list/" element={<PriceList onQuoteClick={openQuote} />} />
          <Route path="/prajs-list" element={<TrailingSlashRedirect />} />
          <Route path="/regiony/" element={<RegionList onQuoteClick={openQuote} />} />
          <Route path="/regiony" element={<TrailingSlashRedirect />} />
          <Route path="/blog/" element={<BlogList onQuoteClick={openQuote} />} />
          <Route path="/blog/:slug/" element={<Blog onQuoteClick={openQuote} />} />
          <Route path="/blog/:slug" element={<TrailingSlashRedirect />} />
          <Route path="/kontakty/" element={<Kontakty onQuoteClick={openQuote} />} />
          <Route path="/kontakty" element={<TrailingSlashRedirect />} />
          <Route path="/o-kompanii/" element={<About onQuoteClick={openQuote} />} />
          <Route path="/o-kompanii" element={<TrailingSlashRedirect />} />
          <Route path="/asfalt-kroshka-primineniye" element={<Navigate to="/uslugi/asfaltovaya-kroshka/" replace />} />
          <Route path="/asfalt-kroshka-primineniye/" element={<Navigate to="/uslugi/asfaltovaya-kroshka/" replace />} />
          <Route path="/sys-9x4k2m" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <QuoteModal
        isOpen={quoteOpen}
        onClose={closeQuote}
        sourceUrl={location.pathname}
        initialComment={quoteComment}
      />
    </div>
  )
}

