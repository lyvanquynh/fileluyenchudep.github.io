// ======================
// GALLERY PRO VERSION
// ======================

const galleryState = {
  key: null,
  images: [],
  index: 0,
  overlay: null,
  mainImg: null,
  thumbsWrap: null,
  spinner: null
}


// ======================
// CẤU HÌNH SẢN PHẨM
// ======================

const galleryConfig = {
  tronbo: { prefix: "images/tronbo_", count: 20 },
  giaovien: { prefix: "images/giaovien_", count: 20 },
  hocsinh: { prefix: "images/hocsinh_", count: 20 },
  sangtao: { prefix: "images/sangtao_", count: 20 }
}


// ======================
// BUILD IMAGE LIST
// ======================

function buildImages(key){
  const cfg = galleryConfig[key]
  if(!cfg) return []

  const arr = []
  for(let i=1;i<=cfg.count;i++){
    const num = String(i).padStart(2,"0")
    arr.push(`${cfg.prefix}${num}.webp`)
  }
  return arr
}


// ======================
// OPEN GALLERY
// ======================

function openGallery(key){

  // RESET STATE
  galleryState.key = key
  galleryState.images = buildImages(key)
  galleryState.index = 0

  if(!galleryState.images.length) return

  createOverlay()
  renderMain()
  renderThumbs()

  galleryState.overlay.style.display = "flex"
}


// ======================
// CREATE OVERLAY
// ======================

function createOverlay(){

  if(galleryState.overlay) return

  const overlay = document.createElement("div")
  overlay.className = "gallery-overlay"

  overlay.innerHTML = `
    <div class="gallery-box">
      <span class="gallery-close">✕</span>
      <div class="gallery-main">
        <div class="gallery-spinner"></div>
        <img>
      </div>
      <div class="gallery-thumbs"></div>
    </div>
  `

  document.body.appendChild(overlay)

  galleryState.overlay = overlay
  galleryState.mainImg = overlay.querySelector("img")
  galleryState.thumbsWrap = overlay.querySelector(".gallery-thumbs")
  galleryState.spinner = overlay.querySelector(".gallery-spinner")

  overlay.querySelector(".gallery-close").onclick = closeGallery

  enableSwipe()
}


// ======================
// CLOSE
// ======================

function closeGallery(){
  galleryState.overlay.style.display = "none"
}


// ======================
// RENDER MAIN IMAGE
// ======================

function renderMain(){

  const src = galleryState.images[galleryState.index]
  if(!src) return

  galleryState.spinner.style.display = "block"
  galleryState.mainImg.style.opacity = 0

  const img = new Image()
  img.src = src

  img.onload = ()=>{
    galleryState.mainImg.src = src
    galleryState.spinner.style.display = "none"
    galleryState.mainImg.style.opacity = 1
  }

  preloadNext()
  updateThumbActive()
}


// ======================
// PRELOAD NEXT
// ======================

function preloadNext(){
  const nextIndex = (galleryState.index + 1) % galleryState.images.length
  const preload = new Image()
  preload.src = galleryState.images[nextIndex]
}


// ======================
// RENDER THUMBS
// ======================

function renderThumbs(){

  galleryState.thumbsWrap.innerHTML = ""

  galleryState.images.forEach((src,i)=>{

    const thumb = document.createElement("img")
    thumb.src = src
    thumb.loading = "lazy"

    thumb.onclick = ()=>{
      galleryState.index = i
      renderMain()
    }

    galleryState.thumbsWrap.appendChild(thumb)
  })
}


// ======================
// UPDATE ACTIVE THUMB
// ======================

function updateThumbActive(){

  const thumbs = galleryState.thumbsWrap.querySelectorAll("img")

  thumbs.forEach((img,i)=>{
    img.classList.toggle("active", i===galleryState.index)
  })
}


// ======================
// SWIPE SUPPORT
// ======================

function enableSwipe(){

  let startX = 0

  galleryState.mainImg.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX
  })

  galleryState.mainImg.addEventListener("touchend", e=>{
    const diff = e.changedTouches[0].clientX - startX

    if(diff > 50){
      prevImage()
    }else if(diff < -50){
      nextImage()
    }
  })
}


function nextImage(){
  galleryState.index = (galleryState.index + 1) % galleryState.images.length
  renderMain()
}

function prevImage(){
  galleryState.index =
    (galleryState.index - 1 + galleryState.images.length) % galleryState.images.length
  renderMain()
}


// ======================
// CLICK DELEGATION
// ======================

document.addEventListener("click", e=>{
  const el = e.target.closest("[data-gallery]")
  if(!el) return
  openGallery(el.dataset.gallery)
})