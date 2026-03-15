// ===== LẤY THÔNG TIN TỪ PRODUCTS =====

function getProductInfo(key){

const p = PRODUCTS[key]

if(!p) return null

return {
name:p.name,
price:p.price
}

}


// ===== LẤY CẤU HÌNH GALLERY TỪ PRODUCTS =====

function getGalleryConfig(key){

const p = PRODUCTS[key]

if(!p) return null

return {
path:p.galleryPath,
count:p.galleryCount,
ext:p.galleryExt
}

}


// ===== TẠO DANH SÁCH ẢNH =====

function buildImages(key){

const cfg = getGalleryConfig(key)

if(!cfg) return []

const arr=[]
const ext = cfg.ext || "jpg"

for(let i=1;i<=cfg.count;i++){

const num=i.toString().padStart(2,"0")

arr.push({
src:`${cfg.path}/${num}.${ext}`,
width:1600,
height:2400
})

}

return arr

}


// ===== MỞ GALLERY =====

function openGallery(key){

const images=buildImages(key)
if(!images.length) return

const product=getProductInfo(key)

const lightbox=new PhotoSwipeLightbox({

dataSource:images,

pswpModule:()=>import(
'https://unpkg.com/photoswipe@5/dist/photoswipe.esm.js'
),

preload:[1,2],

wheelToZoom:true,
escKey:true,
arrowKeys:true

})


// ===== UI TÊN + GIÁ =====

lightbox.on('uiRegister',()=>{

lightbox.pswp.ui.registerElement({

name:'product-info',
order:9,
isButton:false,

html:`
<div class="pswp-product-box">
<div class="pswp-product-title">${product.name}</div>
<div class="pswp-product-price">${product.price.toLocaleString()}đ</div>
<button class="pswp-add-cart">🛒 Thêm giỏ</button>
</div>
`,

onInit:(el)=>{

el.querySelector(".pswp-add-cart").onclick=()=>{

addToCart(key)

const img = document.querySelector(".pswp__img")

if(img){

const rect = img.getBoundingClientRect()

const fake = document.createElement("div")

fake.style.position = "fixed"
fake.style.left = rect.left + "px"
fake.style.top = rect.top + "px"
fake.style.width = rect.width + "px"
fake.style.height = rect.height + "px"

document.body.appendChild(fake)

flyToCart(img.src,fake)

setTimeout(()=>{
fake.remove()
},900)

}

// hiệu ứng nút
const btn=el.querySelector(".pswp-add-cart")

btn.classList.add("added")

setTimeout(()=>{
btn.classList.remove("added")
},400)

}
}

})

})

lightbox.init()

lightbox.loadAndOpen(0)

}


// ===== CLICK SẢN PHẨM =====

document.addEventListener("DOMContentLoaded",()=>{

document.querySelectorAll("[data-gallery]").forEach(el=>{

el.addEventListener("click",(e)=>{

e.preventDefault()

const key=el.dataset.gallery

openGallery(key)

location.hash = key

})

// preload ảnh khi hover
el.addEventListener("mouseenter",()=>{

const key = el.dataset.gallery

const product = PRODUCTS[key]

if(!product) return
if(!product.galleryPath) return

const img = new Image()

const ext = product.galleryExt || "jpg"

img.src = `${product.galleryPath}/01.${ext}`

})

})

})



// preload ảnh khi hover
el.addEventListener("mouseenter",()=>{

const key = el.dataset.gallery

const product = PRODUCTS[key]

if(!product) return

if(!product.galleryPath) return

const img = new Image()

const ext = product.galleryExt || "jpg"

img.src = `${product.galleryPath}/01.${ext}`

})

})

})

// ===== MỞ SẢN PHẨM TỪ URL =====

document.addEventListener("DOMContentLoaded",()=>{

const hash = location.hash.replace("#","")

if(!hash) return

if(PRODUCTS[hash]){

setTimeout(()=>{
openGallery(hash)
},300)

}

})