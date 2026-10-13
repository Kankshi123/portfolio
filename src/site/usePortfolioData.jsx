import { useState, useEffect, createContext, useContext } from 'react'
import { localContent as defaultContent } from './content'

const STORAGE_KEY = 'portfolio_cms_content_v1'
const ADMIN_PIN_KEY = 'portfolio_admin_pin_v1'
const DEFAULT_PIN = '1234'

const PortfolioContext = createContext(null)

export function PortfolioProvider({ children }) {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...defaultContent,
          ...parsed,
          settings: { ...defaultContent.settings, ...(parsed.settings || {}) },
          about: { ...defaultContent.about, ...(parsed.about || {}) },
          categories: parsed.categories?.length ? parsed.categories : defaultContent.categories,
          photos: parsed.photos?.length ? parsed.photos : defaultContent.photos,
          heroSlides: parsed.heroSlides?.length ? parsed.heroSlides : defaultContent.heroSlides,
        }
      }
    } catch (e) {
      console.warn('Failed to load portfolio storage:', e)
    }
    return defaultContent
  })

  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Listen for #admin or hash changes
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)

    // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault()
        setIsAdminOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  const saveContent = (newContent) => {
    setContent(newContent)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
      alert('Storage limit reached or local storage unavailable. If uploading large photos, try using image URLs or smaller image files.')
    }
  }

  const updateSettings = (newSettings) => {
    saveContent({
      ...content,
      settings: { ...content.settings, ...newSettings }
    })
  }

  const updateAbout = (newAbout) => {
    saveContent({
      ...content,
      about: { ...content.about, ...newAbout }
    })
  }

  // Photo management
  const addPhoto = (photoData) => {
    // photoData: { src, altText, caption, categorySlug, isFeatured }
    const newId = `custom-photo-${Date.now()}`
    const newPhoto = {
      _id: newId,
      categorySlug: photoData.categorySlug,
      image: { src: photoData.src, alt: photoData.altText || photoData.caption || 'Photograph' },
      altText: photoData.altText || photoData.caption || '',
      caption: photoData.caption || '',
      isFeatured: Boolean(photoData.isFeatured),
    }

    const updatedPhotos = [newPhoto, ...content.photos]
    saveContent({
      ...content,
      photos: updatedPhotos
    })
  }

  const editPhoto = (photoId, updatedFields) => {
    const updatedPhotos = content.photos.map(p => {
      if (p._id === photoId) {
        return {
          ...p,
          ...updatedFields,
          image: {
            ...p.image,
            src: updatedFields.src || p.image?.src || p.src,
            alt: updatedFields.altText ?? p.altText
          },
          altText: updatedFields.altText ?? p.altText,
          caption: updatedFields.caption ?? p.caption,
          categorySlug: updatedFields.categorySlug ?? p.categorySlug,
          isFeatured: updatedFields.isFeatured !== undefined ? updatedFields.isFeatured : p.isFeatured
        }
      }
      return p
    })
    saveContent({
      ...content,
      photos: updatedPhotos
    })
  }

  const deletePhoto = (photoId) => {
    const updatedPhotos = content.photos.filter(p => p._id !== photoId)
    saveContent({
      ...content,
      photos: updatedPhotos
    })
  }

  // Category management
  const addCategory = (title, coverSrc, description = '') => {
    const slug = title.toLowerCase().trim().replaceAll(' ', '-').replaceAll('&', 'and')
    if (content.categories.some(c => c.slug === slug)) {
      alert('A category with this name already exists.')
      return false
    }
    const newCategory = {
      title,
      slug,
      src: coverSrc,
      description,
      coverImage: { src: coverSrc, alt: `${title} portfolio collection` }
    }
    saveContent({
      ...content,
      categories: [...content.categories, newCategory]
    })
    return true
  }

  const editCategory = (slug, updatedFields) => {
    const updatedCategories = content.categories.map(c => {
      if (c.slug === slug) {
        const title = updatedFields.title || c.title
        const newSlug = title.toLowerCase().trim().replaceAll(' ', '-').replaceAll('&', 'and')
        const src = updatedFields.src || c.src
        return {
          ...c,
          title,
          slug: newSlug,
          src,
          description: updatedFields.description ?? c.description,
          coverImage: { src, alt: `${title} portfolio collection` }
        }
      }
      return c
    })

    // If slug changed, update photos matching old slug
    let updatedPhotos = content.photos
    if (updatedFields.title) {
      const newSlug = updatedFields.title.toLowerCase().trim().replaceAll(' ', '-').replaceAll('&', 'and')
      if (newSlug !== slug) {
        updatedPhotos = content.photos.map(p => p.categorySlug === slug ? { ...p, categorySlug: newSlug } : p)
      }
    }

    saveContent({
      ...content,
      categories: updatedCategories,
      photos: updatedPhotos
    })
  }

  const deleteCategory = (slug) => {
    if (!confirm('Are you sure you want to delete this category? Its photographs will also be deleted.')) return
    const updatedCategories = content.categories.filter(c => c.slug !== slug)
    const updatedPhotos = content.photos.filter(p => p.categorySlug !== slug)
    saveContent({
      ...content,
      categories: updatedCategories,
      photos: updatedPhotos
    })
  }

  // Reset to original content
  const resetToDefault = () => {
    if (confirm('Are you sure you want to restore original default content? All custom edits will be cleared.')) {
      localStorage.removeItem(STORAGE_KEY)
      setContent(defaultContent)
      alert('Portfolio has been reset to defaults.')
    }
  }

  // Export JSON backup
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `portfolio-content-backup-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Import JSON backup
  const importData = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      saveContent(parsed)
      alert('Content imported successfully!')
      return true
    } catch (e) {
      alert('Invalid backup JSON file.')
      return false
    }
  }

  // PIN validation
  const checkPin = (pin) => {
    const savedPin = localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_PIN
    if (pin === savedPin) {
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const changePin = (newPin) => {
    if (!newPin || newPin.length < 4) {
      alert('PIN must be at least 4 digits.')
      return false
    }
    localStorage.setItem(ADMIN_PIN_KEY, newPin)
    alert('Admin PIN updated successfully!')
    return true
  }

  const closeAdmin = () => {
    setIsAdminOpen(false)
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  return (
    <PortfolioContext.Provider value={{
      content,
      isAdminOpen,
      isAuthenticated,
      setIsAdminOpen,
      closeAdmin,
      checkPin,
      changePin,
      updateSettings,
      updateAbout,
      addPhoto,
      editPhoto,
      deletePhoto,
      addCategory,
      editCategory,
      deleteCategory,
      resetToDefault,
      exportData,
      importData,
      saveContent
    }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
