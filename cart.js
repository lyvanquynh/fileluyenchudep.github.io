/* ======================================
   CART SYSTEM – 2 POPUP PRO VERSION
====================================== */

let cart = JSON.parse(localStorage.getItem("cart")) || []
let currentOrder = null

const BANK_CODE = "ICB"
const BANK_ACC  = "100867092003"
const BANK_NAME = "Dinh Thi Hong"

cart = cart.map(i=>{
  if(!i.qty) i.qty = 1
  return i
})

/* ================= CORE ================= */

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart))
}

function updateCartCount(){
  let total = 0
  let count = 0

  cart.forEach(i=>{
    total += i.price * i.qty
    count += i.qty
  })

  const countEl = document.getElementById("cart-count")
  const totalMini = document.getElementById("cart-total-mini")

  if(countEl) countEl.textContent = count
  if(totalMini) totalMini.textContent = total.toLocaleString()+"đ"
}

function addToCart(name, price){
  const found = cart.find(i=>i.name===name)

  if(found){
    found.qty += 1
  }else{
    cart.push({name, price, qty:1})
  }

  saveCart()
  updateCartCount()
  renderCart()
  showToast("Đã thêm vào giỏ hàng","success")
}

function removeItem(index){
  cart.splice(index,1)
  saveCart()
  updateCartCount()
  renderCart()
}

function changeQty(index, delta){
  cart[index].qty += delta
  if(cart[index].qty <= 0){
    cart.splice(index,1)
  }
  saveCart()
  updateCartCount()
  renderCart()
}

/* ================= CART PANEL ================= */

function openCart(){
  document.getElementById("cart-box").style.display="none"
  const box = document.getElementById("cart-box-full")
  box.style.display="block"
  setTimeout(()=> box.classList.add("show"),10)
}

function toggleCart(){
  const box = document.getElementById("cart-box-full")
  box.classList.remove("show")
  setTimeout(()=>{
    box.style.display="none"
    document.getElementById("cart-box").style.display="flex"
  },300)
}

function renderCart(){
  const list=document.getElementById("cart-items")
  const totalEl=document.getElementById("cart-total")
  if(!list || !totalEl) return

  list.innerHTML=""
  let total=0

  cart.forEach((item,i)=>{
    const lineTotal = item.price * item.qty
    total += lineTotal

    const li=document.createElement("li")
    li.innerHTML=`
      <span class="cart-item-name">${item.name} x${item.qty}</span>
      <span class="cart-price">${lineTotal.toLocaleString()}đ</span>
      <button class="cart-remove" onclick="removeItem(${i})">🗑</button>
    `
    list.appendChild(li)
  })

  totalEl.textContent = total.toLocaleString()
}

/* ================= POPUP 1 ================= */

function openPay(){

  if(cart.length===0){
    showToast("Giỏ hàng trống","warn")
    return
  }

  let total = 0
  let itemsHTML = ""

  cart.forEach((item,i)=>{
    const lineTotal = item.price * item.qty
    total += lineTotal

    itemsHTML += `
<li style="border-bottom:1px dashed #ddd;padding-bottom:8px;margin-bottom:8px">
  <div><b>${item.name}</b></div>
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <button onclick="changeQty(${i},-1)">−</button>
    <span>${item.qty}</span>
    <button onclick="changeQty(${i},1)">+</button>
    <span>${item.price.toLocaleString()}đ x ${item.qty} =
    <b>${lineTotal.toLocaleString()}đ</b></span>
  </div>
</li>`
  })

  document.getElementById("order-id").innerText =
    "Mã đơn: #" + Math.floor(100000 + Math.random()*900000)

  document.getElementById("pay-items").innerHTML = itemsHTML
  document.getElementById("pay-amount").innerText = total.toLocaleString()+"đ"

  document.getElementById("pay-text").innerHTML = `
<b>Bước 1:</b> Kiểm tra đơn hàng và nhập email nhận file
`

  document.getElementById("confirm-modal").style.display="flex"
}

/* ================= CHUYỂN SANG POPUP 2 ================= */

function goToPayment(){

  const emailInput = document.getElementById("customer-email")
  const emailError = document.getElementById("email-error")
  const email = emailInput.value.trim()

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if(!emailPattern.test(email)){
    emailError.innerText = "Email không hợp lệ"
    emailInput.focus()
    return
  }

  emailError.innerText = ""

  let total = 0
  cart.forEach(item=>{
    total += item.price * item.qty
  })

  const orderId = "HD" + Math.floor(100000 + Math.random()*900000)

  currentOrder = {
    order_id: orderId,
    total: total,
    email: email,
    items: cart
  }

  const qrUrl =
    `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACC}-compact2.png` +
    `?amount=${total}` +
    `&addInfo=${orderId}` +
    `&accountName=${encodeURIComponent(BANK_NAME)}`

  document.getElementById("payment-total").innerText =
    total.toLocaleString()+"đ"

  document.getElementById("qr-img").src = qrUrl

  document.getElementById("confirm-modal").style.display="none"
  document.getElementById("payment-modal").style.display="flex"
}

/* ================= THANH TOÁN ================= */

async function confirmPayment(){

  if(!currentOrder) return

  await fetch("https://script.google.com/macros/s/AKfycby_RLqohuq-mtIX3lRbqkhLeMlV1cA79Cu9NUed0J-glAGewX5rFOgTZwg4HIyqbiqa/exec",{
    method:"POST",
    body:JSON.stringify(currentOrder),
    mode:"no-cors"
  })

  cart=[]
  saveCart()
  updateCartCount()
  renderCart()

  document.getElementById("payment-modal").innerHTML=`
  <div class="modal-box payment-box" style="text-align:center;padding:40px">
    <h2>✅ Đã thanh toán</h2>
    <p>Vui lòng đợi 1–3 phút, sản phẩm sẽ được gửi qua email.</p>
    <button class="btn-primary" onclick="backToShop()">Thêm sản phẩm</button>
  </div>
  `
}

/* ================= CLOSE ================= */

function closeConfirm(){
  document.getElementById("confirm-modal").style.display="none"
}

function closePayment(){
  document.getElementById("payment-modal").style.display="none"
}

function backToShop(){
  window.location.href="index.html"
}

/* ================= TOAST ================= */

function showToast(msg,type="success"){
  const toast=document.getElementById("toast")
  if(!toast) return

  toast.textContent=msg
  toast.className=""
  toast.classList.add("show")

  setTimeout(()=> toast.classList.remove("show"),3000)
}

/* INIT */
updateCartCount()
renderCart()