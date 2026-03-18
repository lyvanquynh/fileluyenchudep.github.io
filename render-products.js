document.addEventListener("DOMContentLoaded",function(){

const container=document.getElementById("sanpham")

if(!container) return

const groups={
featured:[],
combo:[],
bo1:[],
bo2:[],
bo3:[]
}

Object.values(PRODUCTS).forEach(p=>{
if(groups[p.category]){
groups[p.category].push(p)
}
})

function buildProductHTML(p){

let percent = 0

if(p.oldPrice){
percent = Math.round((1-(p.price/p.oldPrice))*100)
}

return `
<div class="product">

${p.badge ? `<span class="badge">${p.badge}</span>` : ""}

<img src="${p.image}"
loading="lazy"
${p.galleryPath ? `data-gallery="${p.id}"` : ""}
style="cursor:pointer">

<div class="product-content">

<h3>${p.name}</h3>

<p>${p.description}</p>

<div class="product-code">
Mã SP: ${p.id}
</div>

<div class="price-sale">

${p.oldPrice ? `
<span class="old">
${p.oldPrice.toLocaleString()}đ
</span>

<span class="percent">
-${percent}%
</span>
` : ""}

<span class="new">
${p.price.toLocaleString()}đ
</span>

</div>

<div class="product-actions">

${p.galleryPath ? `
<button data-gallery="${p.id}">
Xem chi tiết
</button>
` : ""}

<button class="btn-cart"
onclick="addToCart('${p.id}'); flyProduct(this)">
Thêm giỏ
</button>

</div>

</div>
</div>
`
}

function renderGroup(title,desc,list){

const data = getSectionData(title)

let html=`

<section class="section">

<div class="block-title ${data.class}">
  <div class="title-main">
    <span class="title-label">
      <span class="title-icon">${data.icon}</span>
      ${title.replace("🔥","")}
    </span>
    <div class="title-line"></div>
  </div>
  <p class="title-desc">${desc}</p>
</div>

<div class="products">
`

list.forEach(p=>{
html+=buildProductHTML(p)
})

html+=`
</div>
</section>
`

container.insertAdjacentHTML("beforeend",html)

}

renderGroup(
"🔥 SẢN PHẨM MỚI",
"Sản phẩm mới cập nhật",
groups.featured
)

renderGroup(
"🔥 COMBO ƯU ĐÃI",
"Mua combo tiết kiệm hơn mua lẻ",
groups.combo
)

renderGroup(
"Bộ 1 – Tài liệu giảng dạy luyện chữ đẹp",
"Giáo trình và giáo án luyện chữ cho giáo viên – học sinh",
groups.bo1
)

renderGroup(
"Bộ 2 – Cẩm nang luyện chữ sáng tạo - Calligraphy",
"Luyện chữ nghệ thuật, chữ sáng tạo",
groups.bo2
)

renderGroup(
"Bộ 3 – Luyện viết nhanh tốc ký",
"Luyện chữ viết nhanh chuẩn mẫu cho học sinh cấp 2 và người lớn",
groups.bo3
)

})

function getSectionData(title){

if(title.includes("COMBO")) return {class:"combo", icon:"🎁"}
if(title.includes("Bộ 1")) return {class:"bo1", icon:"📘"}
if(title.includes("Bộ 2")) return {class:"bo2", icon:"✍️"}
if(title.includes("Bộ 3")) return {class:"bo3", icon:"⚡"}
if(title.includes("SẢN PHẨM MỚI")) return {class:"new", icon:"🆕"}

return {class:"", icon:""}
}