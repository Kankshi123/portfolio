import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Plus, Trash2, Edit3, Image as ImageIcon, Settings, User, 
  FolderPlus, Upload, Download, RefreshCw, Key, Check, AlertCircle, Eye, Layers
} from 'lucide-react'
import { usePortfolio } from './usePortfolioData'
import { imageUrl } from './content'

export function AdminModal() {
  const {
    content,
    isAdminOpen,
    isAuthenticated,
    closeAdmin,
    checkPin,
    changePin,
    updateSettings,
    updateAbout,
    updateContact,
    addHeroSlide,
    editHeroSlide,
    deleteHeroSlide,
    setHeroSlides,
    addPhoto,
    editPhoto,
    deletePhoto,
    addCategory,
    editCategory,
    deleteCategory,
    resetToDefault,
    exportData,
    importData
  } = usePortfolio()

  // PIN login state
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  // Active Tab: 'photos' | 'categories' | 'banners' | 'profile' | 'settings'
  const [activeTab, setActiveTab] = useState('photos')

  // Photo Filter & Form States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all')
  const [isAddingPhoto, setIsAddingPhoto] = useState(false)
  const [editingPhotoId, setEditingPhotoId] = useState(null)
  const [photoForm, setPhotoForm] = useState({
    src: '',
    caption: '',
    altText: '',
    categorySlug: '',
    isFeatured: false
  })

  // Category Form State
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [editingCategorySlug, setEditingCategorySlug] = useState(null)
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    src: '',
    description: ''
  })

  // Home Background Hero Slides State
  const [isAddingSlide, setIsAddingSlide] = useState(false)
  const [editingSlideIndex, setEditingSlideIndex] = useState(null)
  const [slideForm, setSlideForm] = useState({
    src: '',
    altText: ''
  })

  // Banner forms for About & Contact
  const [aboutBannerSrc, setAboutBannerSrc] = useState(content.about?.heroImage?.src || 'photo-1523438885200-e635ba2c371e')
  const [aboutBannerAlt, setAboutBannerAlt] = useState(content.about?.heroImage?.alt || 'About Kashif hero banner')

  const [contactBannerSrc, setContactBannerSrc] = useState(content.contact?.heroImage?.src || 'photo-1511795409834-ef04bbd61622')
  const [contactBannerAlt, setContactBannerAlt] = useState(content.contact?.heroImage?.alt || 'Work with Kashif hero banner')

  // Settings / Profile Form States
  const [settingsForm, setSettingsForm] = useState({ ...content.settings })
  const [aboutForm, setAboutForm] = useState({
    heading: content.about?.heading || '',
    teaser: content.settings?.aboutTeaser || '',
    pullQuote: content.settings?.pullQuote || '',
    portraitSrc: content.about?.portrait?.src || '',
    heroImageSrc: content.about?.heroImage?.src || ''
  })

  // PIN change state
  const [newPin, setNewPin] = useState('')
  const fileInputRef = useRef(null)
  const backupInputRef = useRef(null)
  const slideFileRef = useRef(null)
  const aboutBannerFileRef = useRef(null)
  const contactBannerFileRef = useRef(null)

  if (!isAdminOpen) return null

  // Handle PIN submission
  const handlePinSubmit = (e) => {
    e.preventDefault()
    if (checkPin(pinInput)) {
      setPinError('')
      setPinInput('')
    } else {
      setPinError('Incorrect PIN. Please try again.')
    }
  }

  // Handle file upload to Base64
  const handleFileUpload = (e, callback) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2.5 * 1024 * 1024) {
      alert('File is quite large (> 2.5MB). Please use an image URL or compress the image so it fits within browser storage.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      callback(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Open Edit Photo Modal
  const startEditPhoto = (photo) => {
    setEditingPhotoId(photo._id)
    setPhotoForm({
      src: photo.image?.src || photo.src || '',
      caption: photo.caption || '',
      altText: photo.altText || '',
      categorySlug: photo.categorySlug || content.categories[0]?.slug || '',
      isFeatured: Boolean(photo.isFeatured)
    })
    setIsAddingPhoto(true)
  }

  const handleSavePhoto = (e) => {
    e.preventDefault()
    if (!photoForm.src.trim()) {
      alert('Please provide an image link or upload an image file.')
      return
    }
    const slug = photoForm.categorySlug || content.categories[0]?.slug
    if (!slug) {
      alert('Please create at least one category before adding photos.')
      return
    }

    if (editingPhotoId) {
      editPhoto(editingPhotoId, {
        ...photoForm,
        categorySlug: slug
      })
    } else {
      addPhoto({
        ...photoForm,
        categorySlug: slug
      })
    }

    setIsAddingPhoto(false)
    setEditingPhotoId(null)
    setPhotoForm({ src: '', caption: '', altText: '', categorySlug: '', isFeatured: false })
  }

  // Handle Category Save
  const startEditCategory = (cat) => {
    setEditingCategorySlug(cat.slug)
    setCategoryForm({
      title: cat.title,
      src: cat.src || cat.coverImage?.src || '',
      description: cat.description || ''
    })
    setIsAddingCategory(true)
  }

  const handleSaveCategory = (e) => {
    e.preventDefault()
    if (!categoryForm.title.trim() || !categoryForm.src.trim()) {
      alert('Please fill in category title and cover image.')
      return
    }

    if (editingCategorySlug) {
      editCategory(editingCategorySlug, categoryForm)
    } else {
      addCategory(categoryForm.title, categoryForm.src, categoryForm.description)
    }

    setIsAddingCategory(false)
    setEditingCategorySlug(null)
    setCategoryForm({ title: '', src: '', description: '' })
  }

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault()
    updateSettings(settingsForm)
    alert('General settings updated successfully!')
  }

  // Save About page
  const handleSaveAbout = (e) => {
    e.preventDefault()
    updateSettings({
      aboutTeaser: aboutForm.teaser,
      pullQuote: aboutForm.pullQuote
    })
    updateAbout({
      heading: aboutForm.heading,
      portrait: { src: aboutForm.portraitSrc, alt: 'Photographer Portrait' },
      heroImage: { src: aboutForm.heroImageSrc, alt: 'About Hero Image' }
    })
    alert('About page details updated successfully!')
  }

  // Save Home Slide
  const handleSaveSlide = (e) => {
    e.preventDefault()
    if (!slideForm.src.trim()) {
      alert('Please specify an image URL or upload an image file.')
      return
    }
    if (editingSlideIndex !== null) {
      editHeroSlide(editingSlideIndex, slideForm)
      alert(`Home background slide #${editingSlideIndex + 1} updated!`)
    } else {
      addHeroSlide(slideForm)
      alert('New Home background slide added!')
    }
    setIsAddingSlide(false)
    setEditingSlideIndex(null)
    setSlideForm({ src: '', altText: '' })
  }

  // Save About Banner
  const handleSaveAboutHero = () => {
    if (!aboutBannerSrc.trim()) {
      alert('Please enter an image URL or upload an image.')
      return
    }
    updateAbout({
      heroImage: { src: aboutBannerSrc.trim(), alt: aboutBannerAlt.trim() || 'About hero banner' }
    })
    alert('About page banner image updated successfully!')
  }

  // Save Contact Banner
  const handleSaveContactHero = () => {
    if (!contactBannerSrc.trim()) {
      alert('Please enter an image URL or upload an image.')
      return
    }
    updateContact({
      heroImage: { src: contactBannerSrc.trim(), alt: contactBannerAlt.trim() || 'Contact hero banner' }
    })
    alert('Contact page banner image updated successfully!')
  }

  // Filtered photos
  const filteredPhotos = selectedCategoryFilter === 'all'
    ? content.photos
    : content.photos.filter(p => p.categorySlug === selectedCategoryFilter)

  return (
    <div className="admin-overlay" role="dialog" aria-modal="true" aria-label="Admin Control Panel">
      <div className="admin-container">
        
        {/* Header */}
        <div className="admin-header">
          <div className="admin-title-area">
            <span className="admin-badge">Admin Studio</span>
            <h2>Portfolio Management</h2>
          </div>
          <button className="admin-close-btn" onClick={closeAdmin} aria-label="Close admin panel">
            <X size={20} />
          </button>
        </div>

        {/* PIN Screen */}
        {!isAuthenticated ? (
          <div className="admin-pin-screen">
            <div className="admin-pin-card">
              <div className="admin-pin-icon">
                <Key size={32} />
              </div>
              <h3>Enter Admin PIN</h3>
              <p>Enter your security PIN to access portfolio management.</p>
              
              <form onSubmit={handlePinSubmit}>
                <input 
                  type="password" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10} 
                  value={pinInput} 
                  onChange={e => setPinInput(e.target.value)} 
                  placeholder="PIN" 
                  autoFocus
                  className="admin-input admin-pin-input"
                />
                {pinError && <div className="admin-error"><AlertCircle size={14}/> {pinError}</div>}
                <button type="submit" className="admin-btn admin-btn-primary">Unlock Panel</button>
              </form>
            </div>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="admin-body">
            {/* Sidebar Navigation */}
            <aside className="admin-sidebar">
              <button 
                className={`admin-nav-item ${activeTab === 'photos' ? 'active' : ''}`}
                onClick={() => { setActiveTab('photos'); setIsAddingPhoto(false); }}
              >
                <ImageIcon size={18} /> Photographs ({content.photos.length})
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => { setActiveTab('categories'); setIsAddingCategory(false); }}
              >
                <FolderPlus size={18} /> Categories ({content.categories.length})
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'banners' ? 'active' : ''}`}
                onClick={() => { setActiveTab('banners'); setIsAddingSlide(false); }}
              >
                <Layers size={18} /> Hero &amp; Banners
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> Profile & Bio
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} /> Settings & Backup
              </button>

              <div className="admin-sidebar-footer">
                <button className="admin-btn-secondary admin-btn-sm" onClick={exportData}>
                  <Download size={14}/> Export Backup
                </button>
                <button className="admin-btn-secondary admin-btn-sm" onClick={() => backupInputRef.current?.click()}>
                  <Upload size={14}/> Import Backup
                </button>
                <input 
                  type="file" 
                  ref={backupInputRef} 
                  style={{ display: 'none' }} 
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (evt) => importData(evt.target.result)
                      reader.readAsText(file)
                    }
                  }} 
                />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
              
              {/* TAB 1: PHOTOGRAPHS */}
              {activeTab === 'photos' && (
                <div className="admin-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>Manage Photographs</h3>
                      <p>Add, edit captions, switch categories, or delete images.</p>
                    </div>
                    {!isAddingPhoto && (
                      <button 
                        className="admin-btn admin-btn-primary" 
                        onClick={() => {
                          setEditingPhotoId(null)
                          setPhotoForm({
                            src: '',
                            caption: '',
                            altText: '',
                            categorySlug: content.categories[0]?.slug || '',
                            isFeatured: false
                          })
                          setIsAddingPhoto(true)
                        }}
                      >
                        <Plus size={16} /> Add Photograph
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Photo Form */}
                  {isAddingPhoto ? (
                    <div className="admin-card form-card">
                      <h4>{editingPhotoId ? 'Edit Photograph' : 'Add New Photograph'}</h4>
                      <form onSubmit={handleSavePhoto}>
                        <div className="admin-form-group">
                          <label>Image Source (URL or Upload File)</label>
                          <div className="admin-input-upload">
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="Enter image URL (Unsplash, Cloudinary, etc.)"
                              value={photoForm.src}
                              onChange={e => setPhotoForm({ ...photoForm, src: e.target.value })}
                            />
                            <button 
                              type="button" 
                              className="admin-btn admin-btn-secondary"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload size={14} /> Upload Device File
                            </button>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(e, (dataUrl) => setPhotoForm({ ...photoForm, src: dataUrl }))}
                            />
                          </div>
                          {photoForm.src && (
                            <div className="admin-preview-box">
                              <img src={imageUrl(photoForm.src, 400)} alt="Preview" />
                            </div>
                          )}
                        </div>

                        <div className="admin-form-row">
                          <div className="admin-form-group">
                            <label>Category</label>
                            <select 
                              className="admin-input"
                              value={photoForm.categorySlug}
                              onChange={e => setPhotoForm({ ...photoForm, categorySlug: e.target.value })}
                              required
                            >
                              {content.categories.map(c => (
                                <option key={c.slug} value={c.slug}>{c.title}</option>
                              ))}
                            </select>
                          </div>
                          <div className="admin-form-group">
                            <label>Caption / Title</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="e.g. An Evening in the Mountains"
                              value={photoForm.caption}
                              onChange={e => setPhotoForm({ ...photoForm, caption: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="admin-form-actions">
                          <button type="submit" className="admin-btn admin-btn-primary">
                            <Check size={16} /> Save Photograph
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-secondary" 
                            onClick={() => { setIsAddingPhoto(false); setEditingPhotoId(null); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : null}

                  {/* Filter by Category */}
                  <div className="admin-filters">
                    <span>Filter:</span>
                    <button 
                      className={`admin-filter-pill ${selectedCategoryFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedCategoryFilter('all')}
                    >
                      All ({content.photos.length})
                    </button>
                    {content.categories.map(c => (
                      <button 
                        key={c.slug}
                        className={`admin-filter-pill ${selectedCategoryFilter === c.slug ? 'active' : ''}`}
                        onClick={() => setSelectedCategoryFilter(c.slug)}
                      >
                        {c.title} ({content.photos.filter(p => p.categorySlug === c.slug).length})
                      </button>
                    ))}
                  </div>

                  {/* Photo Grid */}
                  <div className="admin-photo-grid">
                    {filteredPhotos.map((photo) => (
                      <div key={photo._id} className="admin-photo-card">
                        <div className="admin-photo-thumb">
                          <img src={imageUrl(photo.image?.src || photo.src, 300)} alt={photo.caption || 'Thumbnail'} />
                          <span className="admin-photo-category">
                            {content.categories.find(c => c.slug === photo.categorySlug)?.title || photo.categorySlug}
                          </span>
                        </div>
                        <div className="admin-photo-details">
                          <p className="admin-photo-title">{photo.caption || 'Untitled Photograph'}</p>
                          <div className="admin-photo-actions">
                            <button 
                              className="admin-action-btn edit" 
                              onClick={() => startEditPhoto(photo)}
                              title="Edit photograph"
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            <button 
                              className="admin-action-btn delete" 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this photograph?')) {
                                  deletePhoto(photo._id)
                                }
                              }}
                              title="Delete photograph"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredPhotos.length === 0 && (
                      <div className="admin-empty-state">
                        <p>No photographs found in this category.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="admin-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>Manage Categories</h3>
                      <p>Create new collections or edit cover images and titles.</p>
                    </div>
                    {!isAddingCategory && (
                      <button 
                        className="admin-btn admin-btn-primary" 
                        onClick={() => {
                          setEditingCategorySlug(null)
                          setCategoryForm({ title: '', src: '', description: '' })
                          setIsAddingCategory(true)
                        }}
                      >
                        <Plus size={16} /> Add Category
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Category Form */}
                  {isAddingCategory && (
                    <div className="admin-card form-card">
                      <h4>{editingCategorySlug ? 'Edit Category' : 'Create New Category'}</h4>
                      <form onSubmit={handleSaveCategory}>
                        <div className="admin-form-row">
                          <div className="admin-form-group">
                            <label>Category Title</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="e.g. Wildlife, Fashion, Studio"
                              value={categoryForm.title}
                              onChange={e => setCategoryForm({ ...categoryForm, title: e.target.value })}
                              required
                            />
                          </div>
                          <div className="admin-form-group">
                            <label>Description / Tagline</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="e.g. Stories in raw landscapes"
                              value={categoryForm.description}
                              onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label>Cover Image (URL or Upload)</label>
                          <div className="admin-input-upload">
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="Unsplash ID, URL or uploaded image"
                              value={categoryForm.src}
                              onChange={e => setCategoryForm({ ...categoryForm, src: e.target.value })}
                              required
                            />
                            <button 
                              type="button" 
                              className="admin-btn admin-btn-secondary"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload size={14} /> Upload
                            </button>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(e, (dataUrl) => setCategoryForm({ ...categoryForm, src: dataUrl }))}
                            />
                          </div>
                          {categoryForm.src && (
                            <div className="admin-preview-box">
                              <img src={imageUrl(categoryForm.src, 400)} alt="Cover preview" />
                            </div>
                          )}
                        </div>

                        <div className="admin-form-actions">
                          <button type="submit" className="admin-btn admin-btn-primary">
                            <Check size={16} /> Save Category
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-secondary" 
                            onClick={() => { setIsAddingCategory(false); setEditingCategorySlug(null); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Categories List */}
                  <div className="admin-category-list">
                    {content.categories.map((category) => {
                      const count = content.photos.filter(p => p.categorySlug === category.slug).length
                      return (
                        <div key={category.slug} className="admin-category-card">
                          <div className="admin-cat-thumb">
                            <img src={imageUrl(category.src || category.coverImage?.src, 250)} alt={category.title} />
                          </div>
                          <div className="admin-cat-info">
                            <h4>{category.title}</h4>
                            <p>{category.description || 'No description provided'}</p>
                            <span className="admin-cat-count">{count} {count === 1 ? 'photograph' : 'photographs'}</span>
                          </div>
                          <div className="admin-cat-actions">
                            <a 
                              href={`/portfolio/${category.slug}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="admin-action-btn"
                              title="View Collection Page"
                              style={{ color: '#1a1a1a', textDecoration: 'none' }}
                            >
                              <Eye size={15}/> View Page
                            </a>
                            <button className="admin-action-btn edit" onClick={() => startEditCategory(category)}>
                              <Edit3 size={15}/> Edit
                            </button>
                            <button className="admin-action-btn delete" onClick={() => deleteCategory(category.slug)}>
                              <Trash2 size={15}/> Delete
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB: HERO & PAGE BANNERS */}
              {activeTab === 'banners' && (
                <div className="admin-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>Hero Slides &amp; Page Banners</h3>
                      <p>Modify, upload, edit, or delete background images for the Home screen, About banner, and Contact banner.</p>
                    </div>
                  </div>

                  {/* Section 1: Home Screen Background Slides */}
                  <div className="admin-card" style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>Home Background Slides ({content.heroSlides?.length || 0})</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>Images that cycle in the background behind "Captured in Light".</p>
                      </div>
                      {!isAddingSlide && (
                        <button 
                          type="button" 
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          onClick={() => {
                            setSlideForm({ src: '', altText: '' })
                            setEditingSlideIndex(null)
                            setIsAddingSlide(true)
                          }}
                        >
                          <Plus size={15}/> Add New Slide
                        </button>
                      )}
                    </div>

                    {/* Slide Add/Edit Form */}
                    {isAddingSlide && (
                      <form onSubmit={handleSaveSlide} style={{ background: '#fcfcfc', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                        <h5 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>
                          {editingSlideIndex !== null ? `Edit Slide #${editingSlideIndex + 1}` : 'Add New Home Background Slide'}
                        </h5>

                        <div className="admin-form-group">
                          <label>Image URL or Device Upload</label>
                          <div className="admin-input-upload">
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="Unsplash ID, https://..., or upload image below" 
                              value={slideForm.src}
                              onChange={e => setSlideForm({ ...slideForm, src: e.target.value })}
                              required
                            />
                            <button 
                              type="button" 
                              className="admin-btn-secondary" 
                              onClick={() => slideFileRef.current?.click()}
                            >
                              <Upload size={14}/> Upload
                            </button>
                            <input 
                              type="file" 
                              ref={slideFileRef} 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={e => handleFileUpload(e, base64 => setSlideForm(f => ({ ...f, src: base64 })))} 
                            />
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label>Slide Label / Description (optional)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            placeholder="e.g. Wedding golden hour moments" 
                            value={slideForm.altText}
                            onChange={e => setSlideForm({ ...slideForm, altText: e.target.value })}
                          />
                        </div>

                        {slideForm.src && (
                          <div className="admin-preview-box" style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '6px', marginBottom: '14px' }}>
                            <img src={imageUrl(slideForm.src, 600)} alt="Preview" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                          </div>
                        )}

                        <div className="admin-form-actions">
                          <button type="submit" className="admin-btn admin-btn-primary">
                            <Check size={15}/> {editingSlideIndex !== null ? 'Update Slide' : 'Save Slide'}
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-secondary" 
                            onClick={() => { setIsAddingSlide(false); setEditingSlideIndex(null); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Hero Slides List */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                      {(content.heroSlides || []).map((s, idx) => (
                        <div key={idx} style={{ border: '1px solid #ebebeb', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                          <div style={{ height: '130px', position: 'relative', background: '#111' }}>
                            <img src={imageUrl(s.src, 400)} alt={s.altText || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', padding: '3px 7px', borderRadius: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              Slide {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div style={{ padding: '10px 12px' }}>
                            <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.altText || 'Hero background slide'}
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                type="button" 
                                className="admin-action-btn edit" 
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => {
                                  setSlideForm({ src: s.src, altText: s.altText || '' })
                                  setEditingSlideIndex(idx)
                                  setIsAddingSlide(true)
                                }}
                              >
                                <Edit3 size={13}/> Edit
                              </button>
                              <button 
                                type="button" 
                                className="admin-action-btn delete" 
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => {
                                  if (confirm(`Delete slide ${idx + 1}?`)) {
                                    deleteHeroSlide(idx)
                                  }
                                }}
                              >
                                <Trash2 size={13}/> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {(!content.heroSlides || content.heroSlides.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '13px' }}>
                        No custom slides. Click "+ Add New Slide" to add a background image.
                      </div>
                    )}
                  </div>

                  {/* Section 2: About Page Hero Banner */}
                  <div className="admin-card" style={{ marginBottom: '28px' }}>
                    <h4>About Page Banner Image ("About Kashif")</h4>
                    <p style={{ margin: '4px 0 16px', fontSize: '13px', color: '#666' }}>
                      Large background photo appearing behind the "ABOUT KASHIF" heading.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ width: '220px', height: '130px', borderRadius: '8px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                        <img 
                          src={imageUrl(aboutBannerSrc || content.about?.heroImage?.src, 400)} 
                          alt="About Banner Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div style={{ flex: '1 1 300px' }}>
                        <div className="admin-form-group">
                          <label>Image URL or Device Upload</label>
                          <div className="admin-input-upload">
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="Unsplash ID, https://..., or upload image" 
                              value={aboutBannerSrc}
                              onChange={e => setAboutBannerSrc(e.target.value)}
                            />
                            <button 
                              type="button" 
                              className="admin-btn-secondary" 
                              onClick={() => aboutBannerFileRef.current?.click()}
                            >
                              <Upload size={14}/> Upload
                            </button>
                            <input 
                              type="file" 
                              ref={aboutBannerFileRef} 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={e => handleFileUpload(e, base64 => setAboutBannerSrc(base64))} 
                            />
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label>Banner Alt Text / Description</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={aboutBannerAlt} 
                            onChange={e => setAboutBannerAlt(e.target.value)}
                            placeholder="e.g. About Kashif floral canopy"
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            onClick={handleSaveAboutHero}
                          >
                            <Check size={14}/> Save About Banner
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => {
                              if (confirm('Reset About banner to original default photo?')) {
                                setAboutBannerSrc('photo-1523438885200-e635ba2c371e')
                                updateAbout({ heroImage: { src: 'photo-1523438885200-e635ba2c371e', alt: 'About Kashif hero banner' } })
                              }
                            }}
                          >
                            Reset to Default
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Contact Page Hero Banner */}
                  <div className="admin-card">
                    <h4>Contact Page Banner Image ("Work with Kashif")</h4>
                    <p style={{ margin: '4px 0 16px', fontSize: '13px', color: '#666' }}>
                      Large background photo appearing behind the "WORK WITH KASHIF" heading.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ width: '220px', height: '130px', borderRadius: '8px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                        <img 
                          src={imageUrl(contactBannerSrc || content.contact?.heroImage?.src, 400)} 
                          alt="Contact Banner Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div style={{ flex: '1 1 300px' }}>
                        <div className="admin-form-group">
                          <label>Image URL or Device Upload</label>
                          <div className="admin-input-upload">
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="Unsplash ID, https://..., or upload image" 
                              value={contactBannerSrc}
                              onChange={e => setContactBannerSrc(e.target.value)}
                            />
                            <button 
                              type="button" 
                              className="admin-btn-secondary" 
                              onClick={() => contactBannerFileRef.current?.click()}
                            >
                              <Upload size={14}/> Upload
                            </button>
                            <input 
                              type="file" 
                              ref={contactBannerFileRef} 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={e => handleFileUpload(e, base64 => setContactBannerSrc(base64))} 
                            />
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label>Banner Alt Text / Description</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={contactBannerAlt} 
                            onChange={e => setContactBannerAlt(e.target.value)}
                            placeholder="e.g. Wedding celebration reception table"
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            onClick={handleSaveContactHero}
                          >
                            <Check size={14}/> Save Contact Banner
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => {
                              if (confirm('Reset Contact banner to original default photo?')) {
                                setContactBannerSrc('photo-1511795409834-ef04bbd61622')
                                updateContact({ heroImage: { src: 'photo-1511795409834-ef04bbd61622', alt: 'Contact hero banner' } })
                              }
                            }}
                          >
                            Reset to Default
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROFILE & BIO */}
              {activeTab === 'profile' && (
                <div className="admin-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>Profile &amp; Biography Details</h3>
                      <p>Update personal information, location, role, and text without touching code.</p>
                    </div>
                  </div>

                  <div className="admin-card">
                    <h4>Primary Information</h4>
                    <form onSubmit={handleSaveSettings}>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>Full Name</label>
                          <input 
                            type="text" 
                            className="admin-input"
                            value={settingsForm.name || ''} 
                            onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value, logoText: e.target.value })} 
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Studio Brand / Position</label>
                          <input 
                            type="text" 
                            className="admin-input"
                            value={settingsForm.position || ''} 
                            onChange={e => setSettingsForm({ ...settingsForm, position: e.target.value, tagline: e.target.value })} 
                          />
                        </div>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>City / Location</label>
                          <input 
                            type="text" 
                            className="admin-input"
                            value={settingsForm.city || ''} 
                            onChange={e => setSettingsForm({ ...settingsForm, city: e.target.value, baseCity: e.target.value })} 
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Hero Subtitle / Genres</label>
                          <input 
                            type="text" 
                            className="admin-input"
                            value={settingsForm.subline || ''} 
                            onChange={e => setSettingsForm({ ...settingsForm, subline: e.target.value, subtitle: e.target.value })} 
                          />
                        </div>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>Email Address</label>
                          <input 
                            type="email" 
                            className="admin-input"
                            value={settingsForm.email || ''} 
                            onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })} 
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Instagram Handle</label>
                          <input 
                            type="text" 
                            className="admin-input"
                            value={settingsForm.instagram || ''} 
                            onChange={e => setSettingsForm({ ...settingsForm, instagram: e.target.value, instagramHandle: e.target.value })} 
                          />
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label>Availability Line</label>
                        <input 
                          type="text" 
                          className="admin-input"
                          value={settingsForm.availabilityLine || ''} 
                          onChange={e => setSettingsForm({ ...settingsForm, availabilityLine: e.target.value })} 
                        />
                      </div>

                      <div className="admin-form-actions">
                        <button type="submit" className="admin-btn admin-btn-primary">
                          <Check size={16}/> Save Profile Details
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="admin-card" style={{ marginTop: '24px' }}>
                    <h4>About Page Copy &amp; Imagery</h4>
                    <form onSubmit={handleSaveAbout}>
                      <div className="admin-form-group">
                        <label>About Heading</label>
                        <input 
                          type="text" 
                          className="admin-input"
                          value={aboutForm.heading} 
                          onChange={e => setAboutForm({ ...aboutForm, heading: e.target.value })} 
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Short Bio Teaser</label>
                        <textarea 
                          className="admin-input" 
                          rows={3}
                          value={aboutForm.teaser}
                          onChange={e => setAboutForm({ ...aboutForm, teaser: e.target.value })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Pull Quote</label>
                        <input 
                          type="text" 
                          className="admin-input"
                          value={aboutForm.pullQuote} 
                          onChange={e => setAboutForm({ ...aboutForm, pullQuote: e.target.value })} 
                        />
                      </div>

                      <div className="admin-form-actions">
                        <button type="submit" className="admin-btn admin-btn-primary">
                          <Check size={16}/> Save About Information
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS & BACKUP */}
              {activeTab === 'settings' && (
                <div className="admin-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>System &amp; Security Settings</h3>
                      <p>Manage security PIN, export/import backups, and reset options.</p>
                    </div>
                  </div>

                  {/* Change PIN */}
                  <div className="admin-card">
                    <h4>Change Admin PIN</h4>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      changePin(newPin)
                      setNewPin('')
                    }}>
                      <div className="admin-form-group" style={{ maxWidth: '300px' }}>
                        <label>New PIN (Minimum 4 digits)</label>
                        <input 
                          type="password" 
                          className="admin-input"
                          value={newPin}
                          onChange={e => setNewPin(e.target.value)}
                          placeholder="Enter new PIN..."
                          required
                        />
                      </div>
                      <button type="submit" className="admin-btn admin-btn-primary">
                        Update PIN
                      </button>
                    </form>
                  </div>

                  {/* Backup & Restore */}
                  <div className="admin-card" style={{ marginTop: '24px' }}>
                    <h4>Backup &amp; Export Data</h4>
                    <p>Download a JSON backup of all your content, categories, and photographs. You can use this file anytime to restore your website data.</p>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
                      <button className="admin-btn admin-btn-secondary" onClick={exportData}>
                        <Download size={16}/> Download Content Backup (.json)
                      </button>
                      <button className="admin-btn admin-btn-secondary" onClick={() => backupInputRef.current?.click()}>
                        <Upload size={16}/> Restore from Backup File
                      </button>
                    </div>
                  </div>

                  {/* Factory Reset */}
                  <div className="admin-card admin-danger-card" style={{ marginTop: '24px' }}>
                    <h4 style={{ color: '#d32f2f' }}>Reset to Default Factory Content</h4>
                    <p>This will erase any custom additions made in the browser and restore original website data.</p>
                    <button className="admin-btn admin-btn-danger" onClick={resetToDefault} style={{ marginTop: '14px' }}>
                      <RefreshCw size={15}/> Reset Everything to Defaults
                    </button>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

      </div>
    </div>
  )
}
