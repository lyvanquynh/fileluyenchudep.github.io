// ===== PRODUCT GALLERY CONFIG =====
// path = thư mục ảnh
// count = số ảnh (đặt tên 1.jpg → count.jpg)

const PRODUCT_GALLERY = {
  "A1": { path:"A1-Giaotrinhkythuat", count:20 },
  "A2": { path:"A2-Thuc hanhTTH5mm", count:12 },
  "A3": { path:"A3-ThuchanhTH2.5mm", count:12 },
  "A4": { path:"A4-Hacotronli", count:10 },
  "A5": { path:"A5-HaCoChuNho-ChuChuan-TieuHoc", count:10 },

  "E1": { path:"E1-SangtaoQuyen1Coban", count:8 },
  "E2": { path:"E2-SangtaoQuyen2Nangcao", count:8 },
  "E3": { path:"E3-SangtaoModernCalligraphy", count:8 },
  "E4": { path:"E4-Chuvietnghethuat", count:8 }
}

let gImages = []
let gIndex = 0

const modal = document.getElementById("gallery-modal")
const mainImg = document.getElementById("gallery-main")
const thumbsBox = document.getElementById("gallery-thumbs")

function buildImages(key){
  const cfg = PRODUCT_GALLERY[key]
  if(!cfg) return []

  const arr = []

  for(let i=1;i<=cfg.count;i++){
    const num = i.toString().padStart(2,"0")   // ⭐ thêm dòng này
    arr.push(`${cfg.path}/${num}.jpg`)
  }

  return arr
}


function openGallery(key){
  gImages = buildImages(key)
  if(!gImages.length) return

  gIndex = 0
  renderMain()
  renderThumbs()

  modal.classList.add("show")
  document.body.style.overflow="hidden"
}

function closeGallery(){
  modal.classList.remove("show")
  document.body.style.overflow=""
}

function renderMain(){
  mainImg.src = gImages[gIndex]

  // preload ảnh kế tiếp
  const next = new Image()
  next.src = gImages[(gIndex+1) % gImages.length]

  updateThumbActive()
}

function renderThumbs(){
  thumbsBox.innerHTML = ""
  gImages.forEach((src,i)=>{
    const im = document.createElement("img")
    im.src = src
    im.onclick = ()=>{ gIndex=i; renderMain() }
    thumbsBox.appendChild(im)
  })
  updateThumbActive()
}

function updateThumbActive(){
  thumbsBox.querySelectorAll("img").forEach((im,i)=>{
    im.classList.toggle("active", i===gIndex)
  })
}

function nextImg(){
  gIndex = (gIndex+1) % gImages.length
  renderMain()
}

function prevImg(){
  gIndex = (gIndex-1+gImages.length) % gImages.length
  renderMain()
}

// ===== events =====

document.querySelector(".gallery-close").onclick = closeGallery
document.querySelector(".gallery-overlay").onclick = closeGallery
document.querySelector(".gallery-nav.next").onclick = nextImg
document.querySelector(".gallery-nav.prev").onclick = prevImg

document.addEventListener("keydown", e=>{
  if(!modal.classList.contains("show")) return
  if(e.key==="Escape") closeGallery()
  if(e.key==="ArrowRight") nextImg()
  if(e.key==="ArrowLeft") prevImg()
})

// ===== bind click cho ảnh + nút =====

document.addEventListener("click", e=>{
  const el = e.target.closest("[data-gallery]")
  if(!el) return
  const key = el.dataset.gallery
  openGallery(key)
})

// ===== swipe mobile =====

let touchX=0
mainImg.addEventListener("touchstart",e=>{
  touchX = e.changedTouches[0].screenX
})

mainImg.addEventListener("touchend",e=>{
  const dx = e.changedTouches[0].screenX - touchX
  if(Math.abs(dx)>40){
    dx<0 ? nextImg() : prevImg()
  }
})
