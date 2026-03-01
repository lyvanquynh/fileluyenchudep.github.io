/* ===============================
   CART SYSTEM – 2 STEP CHECKOUT
   BaoLongEdu
================================= */

let cart = JSON.parse(localStorage.getItem("cart")) || []
let currentOrder = null

const BANK_CODE = "ICB"
const BANK_ACC  = "100867092003"
const BANK_NAME = "Dinh Thi Hong"

/* ===============================
   CART CORE
================================= */

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
  showToast("Đã thêm vào giỏ hàng", "success")
}

function removeItem(index){
  cart.splice(index,1)
  saveCart()
  updateCartCount()
  renderCart()
}

function clearCart(){
  cart = []
  saveCart()
  updateCartCount()
  renderCart()
}

function renderCart(){
  const list = document.getElementById("cart-items")
  const totalEl = document.getElementById("cart-total")
  if(!list || !totalEl) return

  list.innerHTML = ""
  let total = 0

  cart.forEach((item,i)=>{
    const lineTotal = item.price * item.qty
    total += lineTotal

    const li = document.createElement("li")
    li.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <span>${lineTotal.toLocaleString()}đ</span>
      <button onclick="removeItem(${i})">✖</button>
    `
    list.appendChild(li)
  })

  totalEl.textContent = total.toLocaleString()
}

/* ===============================
   CART PANEL
================================= */

function openCart(){
  document.getElementById("cart-box").style.display = "none"
  const full = document.getElementById("cart-box-full")
  full.style.display = "block"
  full.classList.add("show")
}

function toggleCart(){
  const full = document.getElementById("cart-box-full")
  full.classList.remove("show")

  setTimeout(()=>{
    full.style.display = "none"
    document.getElementById("cart-box").style.display = "flex"
  },300)
}

/* ===============================
   STEP 1 – EMAIL CONFIRM
================================= */

function openPay(){

  if(cart.length===0){
    showToast("Giỏ hàng trống", "warn")
    return
  }

  const modal = document.getElementById("pay-modal")
  modal.style.display = "flex"

  let total = 0
  let itemsHTML = ""

  cart.forEach(item=>{
    const lineTotal = item.price * item.qty
    total += lineTotal

    itemsHTML += `
      <li>${item.name} x${item.qty} – ${lineTotal.toLocaleString()}đ</li>
    `
  })

  modal.innerHTML = `
  <div id="pay-content">
    <h3>🧾 XÁC NHẬN ĐƠN HÀNG</h3>

    <ul>${itemsHTML}</ul>
    <h4>Tổng tiền: ${total.toLocaleString()}đ</h4>

    <p><b>Bước 1:</b> Kiểm tra đơn hàng và nhập email nhận file</p>

    <input type="email" id="customer-email" placeholder="Nhập email nhận file" style="width:100%;padding:8px;margin:10px 0">

    <button onclick="confirmEmail()" style="width:100%;padding:10px;background:#2b7cff;color:white;border:none;border-radius:6px">
      Xác nhận Email & Tiếp tục thanh toán
    </button>
  </div>
  `
}

/* ===============================
   STEP 2 – SHOW QR
================================= */

function confirmEmail(){

  const email = document.getElementById("customer-email").value.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if(!emailPattern.test(email)){
    showToast("Email không hợp lệ", "error")
    return
  }

  let total = 0
  let itemsJson = []
  let orderText = ""

  cart.forEach(item=>{
    const lineTotal = item.price * item.qty
    total += lineTotal

    itemsJson.push({
      name:item.name,
      price:item.price,
      qty:item.qty,
      total:lineTotal
    })

    orderText += `${item.name} x${item.qty} = ${lineTotal}\n`
  })

  const orderId = "HD" + Math.floor(100000 + Math.random()*900000)

  currentOrder = {
    order_id: orderId,
    total: total,
    email: email,
    items: itemsJson,
    text: orderText
  }

  const qrUrl =
    `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACC}-compact2.png` +
    `?amount=${total}` +
    `&addInfo=${orderId}` +
    `&accountName=${encodeURIComponent(BANK_NAME)}`

  const modal = document.getElementById("pay-modal")

  modal.innerHTML = `
  <div id="pay-content" style="text-align:center">

    <h3>💳 THANH TOÁN</h3>
    <h4>${total.toLocaleString()}đ</h4>

    <img src="${qrUrl}" style="max-width:280px;margin:10px auto">

    <p>
      <b>Bước 2:</b> Chuyển khoản đúng số tiền và bấm nút bên dưới<br>
      <i>(Tài liệu sẽ gửi trong 1–3 phút)</i>
    </p>

    <button onclick="confirmPayment()" style="width:100%;padding:10px;background:#ff3b3b;color:white;border:none;border-radius:6px;margin-top:10px">
      Xác nhận đã thanh toán
    </button>

  </div>
  `
}

/* ===============================
   FINAL CONFIRM
================================= */

async function confirmPayment(){

  if(!currentOrder) return

  await fetch("https://script.google.com/macros/s/AKfycby_RLqohuq-mtIX3lRbqkhLeMlV1cA79Cu9NUed0J-glAGewX5rFOgTZwg4HIyqbiqa/exec", {
    method:"POST",
    body:JSON.stringify(currentOrder),
    mode:"no-cors"
  })

  clearCart()

  const modal = document.getElementById("pay-modal")

  modal.innerHTML = `
  <div id="pay-content" style="text-align:center">

    <h3>✅ Đã thanh toán</h3>

    <p>
      Vui lòng đợi 1–3 phút, sản phẩm sẽ được gửi qua email.<br>
      Nếu cần hỗ trợ: Zalo 0977 727 089
    </p>

    <button onclick="backToShop()" style="padding:10px 20px;background:#2b7cff;color:white;border:none;border-radius:6px">
      Thêm sản phẩm
    </button>

  </div>
  `
}

/* ===============================
   BACK TO SHOP
================================= */

function backToShop(){
  window.location.href = "index.html"
}

/* ===============================
   TOAST
================================= */

function showToast(msg,type="success"){
  const toast = document.getElementById("toast")
  if(!toast) return

  toast.textContent = msg
  toast.className = ""
  toast.classList.add(type)
  toast.classList.add("show")

  setTimeout(()=>toast.classList.remove("show"),3000)
}

/* INIT */
updateCartCount()
renderCart()