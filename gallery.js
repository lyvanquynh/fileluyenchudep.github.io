// ==============================
// GALLERY FULL VERSION (STABLE)
// ==============================


// ===== PRODUCT DATA =====

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


// ===== IMAGE CONFIG =====

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
let modal = null


// ===== BUILD IMAGES =====

function buildImages(key){
  const cfg = PRODUCT_GALLERY[key]
  if(!cfg) return []

  const arr = []
  const ext = cfg.ext || "jpg"

  for(let i=1;i<=cfg.count;i++){
    const num = i.toString().padStart(2,"0")
    arr.push(`${cfg.path}/${num}.${ext}`)
  }

  return arr
}


// ===== CREATE MODAL =====

function createModal(){

  if(modal) return

  modal = document.createElement("div")
  modal.id = "gallery-modal"

  modal.innerHTML = `
    <div class="gallery-overlay"></div>

    <div class="gallery-box">
      <button class="gallery-close">×</button>

      <div id="gallery-counter"></div>

      <img id="gallery-main">

      <button class="gallery-nav prev">‹</button>
      <button class="gallery-nav next">›</button>

      <div id="gallery-thumbs"></div>

      <div class="gallery-cart-row">
        <button id="gallery-add-cart">Thêm vào giỏ</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  bindEvents()
}


// ===== OPEN =====

function openGallery(key){

  gKey = key
  gImages = buildImages(key)

  if(!gImages.length) return

  gIndex = 0

  createModal()

  renderMain()
  renderThumbs()

  modal.classList.add("show")
  document.body.style.overflow = "hidden"
}


// ===== CLOSE =====

function closeGallery(){
  modal.classList.remove("show")
  document.body.style.overflow = ""
}


// ===== RENDER =====

function renderMain(){

  const mainImg = document.getElementById("gallery-main")
  mainImg.style.opacity = 0

  setTimeout(()=>{
    mainImg.src = gImages[gIndex]
    mainImg.style.opacity = 1
  },120)

  updateCounter()
  updateThumbActive()
}


function renderThumbs(){

  const thumbs = document.getElementById("gallery-thumbs")
  thumbs.innerHTML = ""

  gImages.forEach((src,i)=>{
    const img = document.createElement("img")
    img.src = src
    img.loading = "lazy"
    img.onclick = ()=>{
      gIndex = i
      renderMain()
    }
    thumbs.appendChild(img)
  })
}


function updateCounter(){
  const counter = document.getElementById("gallery-counter")
  counter.textContent = `${gIndex+1}/${gImages.length}`
}


function updateThumbActive(){
  const thumbs = document.querySelectorAll("#gallery-thumbs img")

  thumbs.forEach((img,i)=>{
    img.classList.toggle("active", i===gIndex)
  })
}


// ===== NAVIGATION =====

function nextImg(){
  gIndex = (gIndex+1)%gImages.length
  renderMain()
}

function prevImg(){
  gIndex = (gIndex-1+gImages.length)%gImages.length
  renderMain()
}


// ===== EVENTS =====

function bindEvents(){

  modal.querySelector(".gallery-close").onclick = closeGallery
  modal.querySelector(".gallery-overlay").onclick = closeGallery
  modal.querySelector(".gallery-nav.next").onclick = nextImg
  modal.querySelector(".gallery-nav.prev").onclick = prevImg

  document.addEventListener("keydown", e=>{
    if(!modal.classList.contains("show")) return
    if(e.key==="Escape") closeGallery()
    if(e.key==="ArrowRight") nextImg()
    if(e.key==="ArrowLeft") prevImg()
  })

  // swipe mobile
  const mainImg = document.getElementById("gallery-main")
  let startX = 0

  mainImg.addEventListener("touchstart", e=>{
    startX = e.changedTouches[0].screenX
  })

  mainImg.addEventListener("touchend", e=>{
    const dx = e.changedTouches[0].screenX - startX
    if(Math.abs(dx)>40){
      dx<0 ? nextImg() : prevImg()
    }
  })

  // add cart
  document.getElementById("gallery-add-cart").onclick = ()=>{
    if(!gKey) return
    const p = PRODUCT_INFO[gKey]
    if(!p) return
    addToCart(p.name, p.price)
  }
}


// ===== CLICK BIND =====

document.addEventListener("click", e=>{
  const el = e.target.closest("[data-gallery]")
  if(!el) return
  e.preventDefault()
  openGallery(el.dataset.gallery)
})