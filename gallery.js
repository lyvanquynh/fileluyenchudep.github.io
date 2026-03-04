// ===== THÔNG TIN SẢN PHẨM =====

const PRODUCT_INFO = {
A1:{name:"A1 - Giáo trình kỹ thuật LCĐ",price:600000},
A2:{name:"A2 - Giáo án dạy chữ nhỡ - TTH",price:150000},
A3:{name:"A3 - Giáo án dạy chữ nhỏ - TH",price:150000},
A4:{name:"A4 – Hạ cỡ chữ tròn li",price:69000},
A5:{name:"A5 – Hạ cỡ nhỏ chữ chuẩn BGD",price:89000},

E1:{name:"E1 – Chữ sáng tạo (Cơ bản)",price:69000},
E2:{name:"E2 - Copperplate Calligraphy",price:89000},
E3:{name:"E3 - Modern Calligraphy",price:89000},
E4:{name:"E4 - Unical Calligraphy",price:59000},

G1:{name:"G1 - Luyện viết nhanh/Tốc ký",price:99000}
}


// ===== CẤU HÌNH GALLERY =====

const PRODUCT_GALLERY = {

"A1":{path:"A1-Giaotrinhkythuat/images",count:20},
"A2":{path:"A2-Thuc hanhTTH5mm/images",count:20},
"A3":{path:"A3-ThuchanhTH2.5mm/images",count:20},
"A4":{path:"A4-Hacotronli/images",count:20},
"A5":{path:"A5-HaCoChuNho-ChuChuan-TieuHoc/images",count:20},

"E1":{path:"E1-SangtaoQuyen1Coban/images",count:20},
"E2":{path:"E2-SangtaoQuyen2Nangcao/images",count:20},
"E3":{path:"E3-SangtaoModernCalligraphy/images",count:20},
"E4":{path:"E4-Chuvietnghethuat/images",count:20},

"G1":{path:"G1-Luyenviettocky/images",count:20}

}


// ===== TẠO DANH SÁCH ẢNH =====

function buildImages(key){

const cfg=PRODUCT_GALLERY[key]
if(!cfg) return []

const arr=[]

for(let i=1;i<=cfg.count;i++){

const num=i.toString().padStart(2,"0")

arr.push({
src:`${cfg.path}/${num}.jpg`,
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

const product=PRODUCT_INFO[key]

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

el.querySelector(".pswp-add-cart")
onclick=()=>{

addToCart(product.name,product.price)

// hiệu ứng nút
const btn=el.querySelector(".pswp-add-cart")

btn.classList.add("added")

setTimeout(()=>{
btn.classList.remove("added")
},400)


// rung icon giỏ
const cart=document.querySelector("#cart-box")
if(cart){
cart.classList.add("cart-bounce")
setTimeout(()=>cart.classList.remove("cart-bounce"),500)
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

})


// preload ảnh khi hover
el.addEventListener("mouseenter",()=>{

const key = el.dataset.gallery
const cfg = PRODUCT_GALLERY[key]

if(!cfg) return

const img = new Image()

img.src = `${cfg.path}/01.jpg`

})

})

})