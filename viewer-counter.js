document.addEventListener("DOMContentLoaded",function(){

const products=document.querySelectorAll(".product")

if(!products.length) return

let scrollBoost=0

products.forEach(product=>{

const priceBox=product.querySelector(".price-sale")

if(!priceBox) return

const viewer=document.createElement("div")

viewer.className="viewer-counter"

viewer.innerHTML=`
<div class="viewer-line">👀 <span class="viewer-num">5</span> người đang xem</div>
<div class="viewer-line">🛒 <span class="cart-num">1</span> người vừa thêm giỏ</div>
`

priceBox.insertAdjacentElement("afterend",viewer)

updateNumbers(viewer)

})

function updateNumbers(box){

const viewerNum=box.querySelector(".viewer-num")
const cartNum=box.querySelector(".cart-num")

let baseViewer=random(5,10)+scrollBoost
let baseCart=random(1,3)

viewerNum.textContent=baseViewer
cartNum.textContent=baseCart

}

function random(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

// khi cuộn trang → tăng số
window.addEventListener("scroll",function(){

scrollBoost=Math.min(scrollBoost+1,8)

document.querySelectorAll(".viewer-counter").forEach(box=>{
updateNumbers(box)
})

})

// update nhẹ mỗi 20s
setInterval(()=>{

document.querySelectorAll(".viewer-counter").forEach(box=>{
updateNumbers(box)
})

},20000)

})