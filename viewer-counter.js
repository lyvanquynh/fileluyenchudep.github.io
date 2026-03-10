document.addEventListener("DOMContentLoaded",function(){

const products=[...document.querySelectorAll(".product")]

if(!products.length) return

let activeBoxes=[]
let cartMemory=new WeakMap()

function random(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

function shuffle(arr){
return arr.sort(()=>0.5-Math.random())
}

function clearViewers(){

document.querySelectorAll(".viewer-counter").forEach(v=>v.remove())

activeBoxes=[]

}

function createViewer(product){

const priceBox=product.querySelector(".price-sale")

if(!priceBox) return

const viewer=document.createElement("div")

viewer.className="viewer-counter"

const viewerCount=random(6,14)

const cartCount=random(1,3)

cartMemory.set(viewer,cartCount)

viewer.innerHTML=`
<div class="viewer-line">👀 <span class="viewer-num">${viewerCount}</span> người đang xem</div>
<div class="viewer-line">🛒 <span class="cart-num">${cartCount}</span> người vừa thêm giỏ</div>
`

priceBox.insertAdjacentElement("afterend",viewer)

activeBoxes.push(viewer)

}

function updateNumbers(){

activeBoxes.forEach(box=>{

const viewerNum=box.querySelector(".viewer-num")
const cartNum=box.querySelector(".cart-num")

let currentViewer=parseInt(viewerNum.textContent)

currentViewer+=random(-2,2)

currentViewer=Math.max(5,currentViewer)

viewerNum.textContent=currentViewer

let cartValue=cartMemory.get(box)

if(Math.random()>0.6){
cartValue+=1
}

cartMemory.set(box,cartValue)

cartNum.textContent=cartValue

})

}

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

createViewer(entry.target)

observer.unobserve(entry.target)

}

})

},{
threshold:0.4
})

function spawnViewers(){

clearViewers()

const count=random(3,5)

const selected=shuffle([...products]).slice(0,count)

selected.forEach(product=>{

observer.observe(product)

})

}

spawnViewers()

setInterval(updateNumbers,8000)

setInterval(spawnViewers,15000)

})