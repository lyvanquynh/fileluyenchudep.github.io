// ===== PRODUCT GALLERY CONFIG =====
// path = thư mục CHỨA ảnh (có /images theo cấu trúc repo của bạn)
// count = số ảnh
// ext = đuôi file (mặc định jpg nếu không khai báo)

const PRODUCT_GALLERY = {
  "A1": { path:"A1-Giaotrinhkythuat/images", count:20, ext:"jpg" },

  "A2": { path:"A2-Thuc hanhTTH5mm/images", count:12, ext:"jpg" },
  "A3": { path:"A3-ThuchanhTH2.5mm/images", count:12, ext:"jpg" },
  "A4": { path:"A4-Hacotronli/images", count:10, ext:"jpg" },
  "A5": { path:"A5-HaCoChuNho-ChuChuan-TieuHoc/images", count:10, ext:"jpg" },

  "E1": { path:"E1-SangtaoQuyen1Coban/images", count:8, ext:"jpg" },
  "E2": { path:"E2-SangtaoQuyen2Nangcao/images", count:8, ext:"jpg" },
  "E3": { path:"E3-SangtaoModernCalligraphy/images", count:8, ext:"jpg" },
  "E4": { path:"E4-Chuvietnghethuat/images", count:8, ext:"jpg" }
}


// ===== STATE =====

let gImages = []
let gIndex = 0

const modal      = document.getElementById("gallery-modal")
const mainImg    = document.getElementById("gallery-main")
const thumbsBox  = document.getElementById("gallery-thumbs")

if(!modal || !mainImg || !thumbsBox){
  console.warn("Gallery modal elements not found")
}


// ===== BUILD IMAGE LIST =====

function buildImages(key){
  const cfg = PRODUCT_GALLERY[key]
  if(!cfg) return []

  const ext = cfg.ext || "jpg"
  const arr = []

  for(let i=1;i<=cfg.count;i++){
    const num = i.toString().padStart(2,"0")   // 01,02,03
    arr.push(`${cfg.path}/${num}.${ext}`)
  }

  return arr
}


// ===== OPEN / CLOSE =====

function openGallery(key){
  gImages = buildImages(key)
  if(!gImages.length){
    console.warn("No images for gallery key:", key)
    return
  }

  gIndex = 0
  renderMain()
  renderThumbs()

  modal.classList.add("show")
  document.body.style.overflow = "hidden"
}

function closeGallery(){
  modal.classList.remove("show")
  document.body.style.overflow = ""
}


// ===== RENDER =====

function renderMain(){
  mainImg.src = gImages[gIndex]

  // preload ảnh kế tiếp cho mượt
  const next = new Image()
  next.src = gImages[(gIndex+1) % gImages.length]

  updateThumbActive()
}

function renderThumbs(){
  thumbsBox.innerHTML = ""

  gImages.forEach((src,i)=>{
    const im = document.createElement("img")
    im.loading = "lazy"
    im.src = src
    im.onclick = ()=>{
      gIndex = i
      renderMain()
    }
    thumbsBox.appendChild(im)
  })

  updateThumbActive()
}

function updateThumbActive(){
  const list = thumbsBox.querySelectorAll("img")
  list.forEach((im,i)=>{
    im.classList.toggle("active", i === gIndex)
  })
}


// ===== NAVIGATION =====

function nextImg(){
  gIndex = (gIndex + 1) % gImages.length
  renderMain()
}

function prevImg(){
  gIndex = (gIndex - 1 + gImages.length) % gImages.length
  renderMain()
}


// ===== BUTTON EVENTS =====

document.querySelector(".gallery-close")?.addEventListener("click", closeGallery)
document.querySelector(".gallery-overlay")?.addEventListener("click", closeGallery)
document.querySelector(".gallery-nav.next")?.addEventListener("click", nextImg)
document.querySelector(".gallery-nav.prev")?.addEventListener("click", prevImg)


// ===== KEYBOARD =====

document.addEventListener("keydown", e=>{
  if(!modal.classList.contains("show")) return

  if(e.key === "Escape")     closeGallery()
  if(e.key === "ArrowRight") nextImg()
  if(e.key === "ArrowLeft")  prevImg()
})


// ===== CLICK BIND data-gallery =====

document.addEventListener("click", e=>{
  const el = e.target.closest("[data-gallery]")
  if(!el) return

  e.preventDefault()
  const key = el.dataset.gallery
  openGallery(key)
})


// ===== SWIPE MOBILE =====

document.addEventListener("DOMContentLoaded", ()=>{

  const modal      = document.getElementById("gallery-modal")
  const mainImg    = document.getElementById("gallery-main")
  const thumbsBox  = document.getElementById("gallery-thumbs")

  if(!modal || !mainImg || !thumbsBox){
    console.warn("Gallery modal elements not found")
    return
  }

  let touchX = 0

  mainImg.addEventListener("touchstart", e=>{
    touchX = e.changedTouches[0].screenX
  })

  mainImg.addEventListener("touchend", e=>{
    const dx = e.changedTouches[0].screenX - touchX
    if(Math.abs(dx) > 40){
      dx < 0 ? nextImg() : prevImg()
    }
  })

})

