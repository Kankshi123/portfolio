export const identity = {
  name: 'Kashif Rashid Khan', firstName: 'Kashif', role: 'Photographer', city: 'Dehradun', year: '2027',
  position: 'Flashlite Photography', subline: 'Weddings · Fashion · Live Events · Culture', instagram: '@flashlitephotography',
  email: 'Kashifrashidkhan01@gmail.com',
}

export const imageUrl = (id, width = 1100) => {
  if (!id) return ''
  if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('data:') || id.startsWith('blob:') || id.startsWith('/')) {
    return id
  }
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`
}

const photo = (id, alt, caption = '') => ({ image: { src: id, alt }, altText: alt, caption })

const categoryPhotoPools = {
  'weddings': [
    { id: 'photo-1519741497674-611481863552', caption: 'Intimate vows beneath floral canopy' },
    { id: 'photo-1511285560929-80b456fea0bc', caption: 'Quiet portrait of the bride and groom' },
    { id: 'photo-1537633552985-df8429e8048b', caption: 'Golden hour moments of the celebration' },
    { id: 'photo-1511795409834-ef04bbd61622', caption: 'Evening reception and table lights' },
    { id: 'photo-1520857014576-2c4f4c972b57', caption: 'Walking hand in hand through the gardens' },
  ],
  'club-and-gigs': [
    { id: 'photo-1516483638261-f4dbaf036963', caption: 'Neon lights and electric crowd movement' },
    { id: 'photo-1514525253161-7a46d19cd819', caption: 'DJ booth in the pulse of the night' },
    { id: 'photo-1492684223066-81342ee5ff30', caption: 'Bassline drops under club strobe lights' },
    { id: 'photo-1470225620780-dba8ba36b745', caption: 'Midnight rhythm and stage visuals' },
  ],
  'event-photography': [
    { id: 'photo-1511285560929-80b456fea0bc', caption: 'Celebration dinner and toast' },
    { id: 'photo-1511795409834-ef04bbd61622', caption: 'Shared laughter and evening festivities' },
    { id: 'photo-1523438885200-e635ba2c371e', caption: 'Keynote moments and attendee connections' },
    { id: 'photo-1528605248644-14dd04022da1', caption: 'Festive table gathering and live cheers' },
  ],
  'models-and-fashion': [
    { id: 'photo-1470770841072-f978cf4d019e', caption: 'Editorial portrait in natural sunlight' },
    { id: 'photo-1534528741775-53994a69daeb', caption: 'High-contrast studio lookbook frame' },
    { id: 'photo-1515886657613-9f3515b0c78f', caption: 'Runway silhouette and contemporary styling' },
    { id: 'photo-1509631179647-0177331693ae', caption: 'Avant-garde fashion showcase' },
  ],
  'cultural-events': [
    { id: 'photo-1511795409834-ef04bbd61622', caption: 'Ceremonial heritage gathering' },
    { id: 'photo-1516450360452-9312f5e86fc7', caption: 'Traditional rhythm and celebration dance' },
    { id: 'photo-1533174072545-7a4b6ad7a6c3', caption: 'Festive folk gathering under lanterns' },
    { id: 'photo-1465847899084-d164df4dedc6', caption: 'Cultural heritage attire and artistry' },
  ],
  'concerts-and-shows': [
    { id: 'photo-1534528741775-53994a69daeb', caption: 'Front-row spotlight on the performer' },
    { id: 'photo-1470225620780-dba8ba36b745', caption: 'Arena concert ablaze with visual art' },
    { id: 'photo-1501386761578-eac5c94b800a', caption: 'Hands raised in the stadium roar' },
    { id: 'photo-1429962714451-bb934ecdc4ec', caption: 'Encore lights piercing the darkness' },
  ],
  'content-creation': [
    { id: 'photo-1518837695005-2083093ee35b', caption: 'Artisan product shoot in natural studio light' },
    { id: 'photo-1515377905703-c4788e51af15', caption: 'Behind-the-scenes digital brand story' },
    { id: 'photo-1498050108023-c5249f4df085', caption: 'Creative workshop and craft aesthetic' },
    { id: 'photo-1507238691740-187a5b1d37b8', caption: 'Visual composition for digital campaigns' },
  ],
}

export const images = {
  hero: [
    { src: 'photo-1519741497674-611481863552', alt: 'An intimate wedding celebration beneath a canopy of flowers' },
    { src: 'photo-1511285560929-80b456fea0bc', alt: 'A couple sharing a quiet moment on their wedding day' },
    { src: 'photo-1537633552985-df8429e8048b', alt: 'A sunlit portrait of a newly married couple' },
  ],
  categories: [
    ['Weddings', 'photo-1519741497674-611481863552', 'Stories of celebration, connection and light'],
    ['Club & Gigs', 'photo-1516483638261-f4dbaf036963', 'The energy and atmosphere of the night'],
    ['Event Photography', 'photo-1511285560929-80b456fea0bc', 'Moments that bring people together'],
    ['Models & Fashion', 'photo-1470770841072-f978cf4d019e', 'Editorial imagery with presence and movement'],
    ['Cultural Events', 'photo-1511795409834-ef04bbd61622', 'Tradition, expression and community'],
    ['Concerts & Shows', 'photo-1534528741775-53994a69daeb', 'Performance captured in full flow'],
    ['Content Creation', 'photo-1518837695005-2083093ee35b', 'Visual content for brands and social media'],
  ],
}

export const localContent = {
  settings: {
    ...identity,
    logoText: identity.name,
    tagline: identity.position,
    subtitle: identity.subline,
    heroHeading: 'Captured in light',
    baseCity: identity.city,
    aboutTeaser: 'Flashlite Photography captures the energy, emotion and detail of every moment.',
    pullQuote: 'Every frame is a moment that will never happen twice.',
    socialLinks: [{ label: 'Instagram', url: 'https://instagram.com/flashlitephotography' }],
    availabilityLine: 'Available for commissions across India.',
    footerText: '© 2026 Kashif Rashid Khan · Flashlite Photography.',
    seoTitle: 'Kashif Rashid Khan | Flashlite Photography',
    seoDescription: 'Photography by Kashif Rashid Khan. Weddings, fashion, live events, culture and content creation.',
  },
  heroSlides: images.hero.map(item => ({ ...item, altText: item.alt })),
  categories: images.categories.map(([title, src, description]) => ({
    title, src, description, slug: title.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and'),
    coverImage: { src, alt: `${title} portfolio collection` },
  })),
  photos: images.categories.flatMap(([title, cover], categoryIndex) => {
    const categorySlug = title.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')
    const pool = categoryPhotoPools[categorySlug] || [{ id: cover, caption: `${title} Photograph` }]
    return pool.map((item, photoIndex) => ({
      _id: `local-photo-${categorySlug}-${photoIndex}`,
      categorySlug,
      ...photo(item.id, `${title} - ${item.caption}`, `${title} · ${item.caption}`),
      isFeatured: categoryIndex === 0 && photoIndex < 3,
    }))
  }),
  about: {
    heading: 'About Kashif',
    heroImage: { src: 'photo-1523438885200-e635ba2c371e', alt: 'A photography portfolio image' },
    portrait: { src: 'photo-1534528741775-53994a69daeb', alt: 'Portrait placeholder for Kashif Rashid Khan' },
  },
  contact: {
    heading: 'Work with Kashif',
    subheading: 'Photography for people, places and moments',
    heroImage: { src: 'photo-1511795409834-ef04bbd61622', alt: 'Wedding reception celebration banner' },
  },
  publications: [],
  instagramImages: images.categories.map(([title, src]) => ({ image: { src, alt: `${title} portfolio photograph` } })),
}

export const localImage = (asset, width = 1100) => asset?.src ? imageUrl(asset.src, width) : ''
export const localSrcSet = (asset, widths = [480, 800, 1200, 1800]) => {
  if (!asset?.src || asset.src.startsWith('data:') || asset.src.startsWith('blob:')) return undefined
  return widths.map(width => `${imageUrl(asset.src, width)} ${width}w`).join(', ')
}
