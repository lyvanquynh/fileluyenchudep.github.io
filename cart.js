/* ================================
   2 POPUP VERSION – SAFE MODE
================================ */

let cart = JSON.parse(localStorage.getItem("cart")) || []
let currentOrder = null

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart))
}

function updateCartCount(){
  let total=0,count=0
  cart.forEach(i=>{
    total+=i.price*i.qty
    count+=i.qty
  })
  const c=document.getElementById("cart-count")
  const t=document.getElementById("cart-total-mini")
  if(c) c.textContent=count
  if(t) t.textContent=total.toLocaleString()+"đ"
}

function addToCart(name,price){
  const f=cart.find(i=>i.name===name)
  if(f) f.qty++
  else cart.push({name,price,qty:1})
  saveCart()
  updateCartCount()
  renderCart()
}

function renderCart(){
  const list=document.getElementById("cart-items")
  const totalEl=document.getElementById("cart-total")
  if(!list) return
  list.innerHTML=""
  let total=0
  cart.forEach((item,i)=>{
    const line=item.price*item.qty
    total+=line
    list.innerHTML+=`
<li>
  ${item.name} x${item.qty}
  <span>${line.toLocaleString()}đ</span>
</li>`
  })
  totalEl.textContent=total.toLocaleString()
}

/* =============================
   OPEN POPUP 1
============================= */

function openPay(){
  if(cart.length===0) return

  let total=0
  let html=""

  cart.forEach(item=>{
    const line=item.price*item.qty
    total+=line
    html+=`<li>${item.name} x${item.qty} - ${line.toLocaleString()}đ</li>`
  })

  document.getElementById("confirm-order-id").innerText=
    "Mã đơn: #"+Math.floor(100000+Math.random()*900000)

  document.getElementById("confirm-items").innerHTML=html
  document.getElementById("confirm-amount").innerText=
    total.toLocaleString()+"đ"

  document.getElementById("confirm-modal").style.display="flex"
}

/* =============================
   STEP 1 -> STEP 2
============================= */

document.addEventListener("click",function(e){
  if(e.target && e.target.id==="confirm-btn"){
    const email=document.getElementById("confirm-email").value.trim()
    const error=document.getElementById("confirm-error")

    const pattern=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

    if(!pattern.test(email)){
      error.innerText="Email không hợp lệ"
      return
    }

    error.innerText=""

    let total=0
    cart.forEach(i=> total+=i.price*i.qty )

    currentOrder={
      id:"HD"+Math.floor(100000+Math.random()*900000),
      email:email,
      total:total,
      items:cart
    }

    const qr=`https://img.vietqr.io/image/ICB-100867092003-compact2.png?amount=${total}&addInfo=${currentOrder.id}&accountName=Dinh%20Thi%20Hong`

    document.getElementById("qr-img").src=qr
    document.getElementById("pay-amount").innerText=total.toLocaleString()+"đ"

    document.getElementById("confirm-modal").style.display="none"
    document.getElementById("pay-modal").style.display="flex"
  }
})

/* =============================
   CONFIRM PAYMENT
============================= */

document.addEventListener("click",async function(e){
  if(e.target && e.target.id==="copy-order-btn"){

    await fetch("YOUR_SCRIPT_URL",{
      method:"POST",
      body:JSON.stringify(currentOrder),
      mode:"no-cors"
    })

    cart=[]
    saveCart()
    updateCartCount()
    renderCart()

    alert("Đã thanh toán, vui lòng đợi 1-3 phút để nhận email.")

    window.location.href="index.html"
  }
})

function closeConfirm(){
  document.getElementById("confirm-modal").style.display="none"
}