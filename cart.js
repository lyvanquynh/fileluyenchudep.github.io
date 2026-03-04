let cart = JSON.parse(localStorage.getItem("cart")) || []
let confirmBtnTimer = null   // ===== thêm =====
let tempOrderData = null     // ===== thêm bước 2 =====

// ===== CẤU HÌNH QR NGÂN HÀNG =====
const BANK_CODE = "ICB"              // Vietinbank
const BANK_ACC  = "100867092003"
const BANK_NAME = "Dinh Thi Hong"

// Chuẩn hoá cart cũ (chưa có qty)
cart = cart.map(item=>{
  if(!item.qty){
    item.qty = 1
  }
  return item
})

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart))
}

function addToCart(name, price){

  const found = cart.find(item => item.name === name)

  if(found){
    found.qty += 1
  }else{
    cart.push({name, price, qty:1})
  }

  saveCart()
  updateCartCount()
  renderCart()

  showToast("Đã thêm " + name + " vào giỏ", "success")

  const cartIcon = document.querySelector("#cart-box")

  if(cartIcon){
    cartIcon.classList.add("cart-bounce")

    setTimeout(()=>{
      cartIcon.classList.remove("cart-bounce")
    },500)
  }

}


function removeItem(index){
  cart.splice(index,1)
  saveCart()
  updateCartCount()
  renderCart()
  unlockConfirmBtn()   // ===== thêm =====
}

function clearCart(){
  if(confirm("Xóa toàn bộ giỏ hàng?")){
    cart=[]
    saveCart()
    updateCartCount()
    renderCart()
    unlockConfirmBtn() // ===== thêm =====
  }
}

function updateCartCount(){
  let total = 0
  let count = 0

  cart.forEach(i=>{
    total += i.price * i.qty
    count += i.qty
  })

  document.getElementById("cart-count").textContent = count
  document.getElementById("cart-total-mini").textContent = total.toLocaleString()+"đ"
}

function openCart(){
  document.getElementById("cart-box").style.display="none"
  const box = document.getElementById("cart-box-full")
  box.style.display="block"
  setTimeout(()=>{
    box.classList.add("show")
  },10)
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


// ================= UNLOCK NÚT XÁC NHẬN =================

function unlockConfirmBtn(){
  const btn = document.getElementById("copy-order-btn")
  if(btn){
    btn.disabled = false
  }
  if(confirmBtnTimer){
    clearTimeout(confirmBtnTimer)
    confirmBtnTimer = null
  }
}


// ================= POPUP THANH TOÁN =================

function openPay(){
  if(cart.length==0){
  showToast("Giỏ hàng trống", "warn")
  return
}

  unlockConfirmBtn() // ===== thêm =====

  let total = 0
  let itemsHTML = ""
  let orderText = "Đơn hàng:\n"
  let orderItemsText = ""
  let orderItemsJson = []

  cart.forEach((item,i)=>{
    const lineTotal = item.price * item.qty
    total += lineTotal

    itemsHTML += `
<li style="border-bottom:1px dashed #ddd;padding-bottom:6px;margin-bottom:6px">
  <div><b>${item.name}</b></div>
  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
    <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
    <span class="qty-num">${item.qty}</span>
    <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
    <span>${item.price.toLocaleString()}đ x ${item.qty} = <b>${lineTotal.toLocaleString()}đ</b></span>
    <button class="remove-btn" onclick="removeItemInPay(${i})">✖</button>
  </div>
</li>
`

    const line =
`${item.name}: ${item.price.toLocaleString()}đ x ${item.qty} = ${lineTotal.toLocaleString()}đ`

    orderText += line + "\n"
    orderItemsText += (i < cart.length-1) ? line+"\n" : line

    orderItemsJson.push({
  name: item.name,
  price: item.price,
  qty: item.qty,
  total: lineTotal
  })
})
  const orderId = "HD" + Math.floor(100000 + Math.random()*900000)

  document.getElementById("order-id").innerText = "Mã đơn: #" + orderId
  document.getElementById("pay-items").innerHTML = itemsHTML
  document.getElementById("pay-amount").innerText = total.toLocaleString() + "đ"

// ===== SINH QR ĐỘNG =====
// ===== SINH QR ĐỘNG =====
const qrUrl =
  `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACC}-compact2.png` +
  `?amount=${total}` +
  `&addInfo=${orderId}` +
  `&accountName=${encodeURIComponent(BANK_NAME)}`

// LƯU QR để dùng cho step 2
window._currentQrUrl = qrUrl
window._currentOrderId = orderId
window._currentTotal = total

  document.getElementById("pay-text").innerHTML = `
<b>Hướng dẫn thanh toán:</b><br>
<b>Bước 1:</b> Kiểm tra đơn hàng và nhập email vào ô nhận file.
Sau đó bấm "Xác nhận Email & Copy nội dung đơn".
`

  orderText += "Tổng tiền: " + total.toLocaleString() + "đ\n"
  orderText += "Mã đơn: #" + orderId


  // ================= NÚT XÁC NHẬN =================

  const confirmBtn = document.getElementById("copy-order-btn")

  confirmBtn.onclick = async function(){

    const emailInput = document.getElementById("customer-email")
    const email = emailInput?.value.trim()

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

if(!emailPattern.test(email)){
  showToast("Email không hợp lệ", "error")
  emailInput?.focus()
  return
}




    await navigator.clipboard.writeText(orderText)

    function formatTimeVN(){
      const d = new Date()
      return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} - ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
    }

    // Lưu đơn tạm để bước 2 gửi
// Lưu đơn tạm để bước 2 gửi
tempOrderData = {
  order_id: orderId,
  time: formatTimeVN(),
  total: total,
  text: orderItemsText,
  items: orderItemsJson,
  email: email
}

showToast("Đã xác nhận email & copy đơn", "success")

// ===== ĐÓNG STEP 1 =====
const modal1 = document.getElementById("pay-modal")
if(modal1){
  modal1.style.display = "none"
}

// ===== MỞ STEP 2 =====
const modal2 = document.getElementById("pay-step2-modal")
if(modal2){
  modal2.style.display = "flex"
}

// ===== GÁN QR CHO STEP 2 =====
const qrImg2 = document.getElementById("qr-img-step2")
const qrLink2 = document.getElementById("qr-link-step2")
const orderIdEl = document.getElementById("order-id-step2")
const totalEl = document.getElementById("pay-amount-step2")

if(qrImg2) qrImg2.src = window._currentQrUrl
if(qrLink2) qrLink2.href = window._currentQrUrl
if(orderIdEl) orderIdEl.innerText = "Mã đơn: #" + window._currentOrderId
if(totalEl) totalEl.innerText = window._currentTotal.toLocaleString() + "đ"

  }

  // ===== mở khóa nếu sửa email =====
  const emailInput = document.getElementById("customer-email")
  if(emailInput){
    emailInput.oninput = unlockConfirmBtn
  }


  const payContent = document.getElementById("pay-content")
const modal = document.getElementById("pay-modal")

if(payContent && modal){

  payContent.classList.add("zoom-from-cart")

  modal.style.display="flex"

  payContent.getBoundingClientRect()

  requestAnimationFrame(()=>{
    payContent.classList.remove("zoom-from-cart")
  })
}  // ← đóng if
}  // ← đóng openPay

// ================= HÀM PHỤ =================

function closePay(){

  const payContent = document.getElementById("pay-content")
  const modal = document.getElementById("pay-modal")

  if(payContent && modal){

    payContent.classList.add("zoom-from-cart")

    setTimeout(()=>{
      modal.style.display="none"
      payContent.classList.remove("zoom-from-cart")
    },300)
  }
}

function changeQty(index, delta){
  cart[index].qty += delta
  if(cart[index].qty <= 0) cart.splice(index,1)

  saveCart()
  updateCartCount()
  renderCart()
  unlockConfirmBtn()

  if(cart.length === 0) closePay()
  else openPay()
}

function removeItemInPay(index){
  cart.splice(index,1)
  saveCart()
  updateCartCount()
  renderCart()
  unlockConfirmBtn()

  if(cart.length === 0) closePay()
  else openPay()
}

// ===== TOAST PRO SYSTEM =====

const toastQueue = []
let toastBusy = false

function showToast(msg, type="success"){
  toastQueue.push({msg,type})
  if(!toastBusy) runNextToast()
}

function runNextToast(){
  if(!toastQueue.length){
    toastBusy = false
    return
  }

  toastBusy = true

  const {msg,type} = toastQueue.shift()
  const el = document.getElementById("toast")
  if(!el) return

  // reset class
  el.className = ""
  el.id = "toast"
  el.classList.add(type)

  const icon =
    type==="success" ? "✅" :
    type==="error"   ? "❌" :
                       "⚠️"

  el.innerHTML = `<span class="toast-icon">${icon}</span>${msg}`
  el.classList.add("show")

  // rung nhẹ mobile
  if(navigator.vibrate) navigator.vibrate(25)

  setTimeout(()=>{
    el.classList.remove("show")
    setTimeout(runNextToast, 250)
  }, 1800)
}

// ================= XÁC NHẬN ĐÃ THANH TOÁN =================

function confirmPaid(){

  if(!tempOrderData){
    showToast("Lỗi dữ liệu đơn hàng", "error")
    return
  }

  // Gửi Google Sheet
  fetch("https://script.google.com/macros/s/AKfycby_RLqohuq-mtIX3lRbqkhLeMlV1cA79Cu9NUed0J-glAGewX5rFOgTZwg4HIyqbiqa/exec", {
    method: "POST",
    body: JSON.stringify(tempOrderData),
    mode: "no-cors"
  })

  // Đóng step 2
  const modal2 = document.getElementById("pay-step2-modal")
  if(modal2){
    modal2.style.display = "none"
  }

  // Mở step 3
  const modal3 = document.getElementById("pay-step3-modal")
  if(modal3){
    modal3.style.display = "flex"
  }

  // Xóa giỏ hàng
  cart = []
  saveCart()
  updateCartCount()
  renderCart()

  tempOrderData = null
}

// ================= INIT =================

updateCartCount()
renderCart()

const searchInput = document.getElementById("searchInput")
if(searchInput){
  searchInput.addEventListener("input", function(){
    const keyword = this.value.toLowerCase()
    document.querySelectorAll(".product").forEach(p=>{
      p.style.display = p.innerText.toLowerCase().includes(keyword) ? "flex":"none"
    })
  })
}
// ===== NÚT LÊN ĐẦU TRANG =====
const backBtn = document.getElementById("backToTop")

if(backBtn){

  window.addEventListener("scroll", ()=>{
    if(window.scrollY > 300){
      backBtn.classList.add("show")
    }else{
      backBtn.classList.remove("show")
    }
  })

  backBtn.addEventListener("click", ()=>{
    window.scrollTo({
      top:0,
      behavior:"smooth"
    })
  })

}


function closeStep3(){
  document.getElementById("pay-step3-modal").style.display = "none"
}