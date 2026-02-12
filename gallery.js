// ===== PRODUCT GALLERY CONFIG =====
// path = thư mục CHỨA ảnh (có /images theo cấu trúc repo của bạn)
// count = số ảnh
// ext = đuôi file (mặc định jpg nếu không khai báo)

const PRODUCT_INFO = {
  A1:{name:"A1 - Giáo trình kỹ thuật LCĐ", price:600000},
  A2:{name:"A2 - Giáo án dạy chữ nhỡ - TTH", price:150000},
  A3:{name:"A3 - Giáo án dạy chữ nhỏ - TH", price:150000},
  A4:{name:"A4 – Hạ cỡ chữ tròn li", price:69000},
  A5:{name:"A5 – Hạ cỡ nhỏ chữ chuẩn BGD", price:89000},

  E1:{name:"E1 – Chữ sáng tạo (Cơ bản)", price:69000},
  E2:{name:"E2 - Copperplate Calligraphy", price:89000},
  E3:{name:"E3 - Modern Calligraphy", price:89000},
  E4:{name:"E4 - Unical Calligraphy", price:59000},

  G1:{name:"G1 - Luyện viết nhanh/Tốc ký", price:99000}
}

const PRODUCT_GALLERY = {
  "A1": { path:"A1-Giaotrinhkythuat/images", count:20, ext:"jpg" },

  "A2": { path:"A2-Thuc hanhTTH5mm/images", count:20, ext:"jpg" },
  "A3": { path:"A3-ThuchanhTH2.5mm/images", count:20, ext:"jpg" },
  "A4": { path:"A4-Hacotronli/images", count:20, ext:"jpg" },
  "A5": { path:"A5-HaCoChuNho-ChuChuan-TieuHoc/images", count:20, ext:"jpg" },

  "E1": { path:"E1-SangtaoQuyen1Coban/images", count:20, ext:"jpg" },
  "E2": { path:"E2-SangtaoQuyen2Nangcao/images", count:20, ext:"jpg" },
  "E3": { path:"E3-SangtaoModernCalligraphy/images", count:20, ext:"jpg" },
  "E4": { path:"E4-Chuvietnghethuat/images", count:20, ext:"jpg" },
  "G1": { path:"G1-Luyenviettocky/images", count:20, ext:"jpg" }
}


// ===== STATE =====

let gKey = null
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
  gKey = key
  gImages = buildImages(key)
  if(!gImages.length) return

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
  mainImg.style.opacity = 0

  setTimeout(()=>{
    mainImg.src = gImages[gIndex]
    mainImg.style.opacity = 1
  },120)

  const next = new Image()
  next.src = gImages[(gIndex+1)%gImages.length]

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

    if(i === gIndex){
      im.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      })
    }
  })

  updateCounter()
}

function updateCounter(){
  const el = document.getElementById("gallery-counter")
  if(!el) return
  el.textContent = `${gIndex+1}/${gImages.length}`
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

document.getElementById("gallery-add-cart")?.addEventListener("click", ()=>{
  if(!gKey) return
  const p = PRODUCT_INFO[gKey]
  if(!p) return

  addToCart(p.name, p.price)
})
