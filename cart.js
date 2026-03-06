let cart = JSON.parse(localStorage.getItem("cart")) || []
let confirmBtnTimer = null   // ===== thêm =====
let tempOrderData = null     // ===== thêm bước 2 =====

// ===== COUPON =====
let appliedCoupon = null
let couponDiscount = 0

let couponCache = []

async function loadCoupons(){

const res = await fetch(COUPON_API,{
method:"POST",
body:JSON.stringify({
action:"getCoupons"
})
})

couponCache = await res.json()

}



const COUPON_API =
"https://script.google.com/macros/s/AKfycby_RLqohuq-mtIX3lRbqkhLeMlV1cA79Cu9NUed0J-glAGewX5rFOgTZwg4HIyqbiqa/exec"

loadCoupons()

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

  // ===== AUTO RESET COUPON =====
const couponInput = document.getElementById("coupon-code")
const couponMsg = document.getElementById("coupon-msg")

if(couponInput){

  couponInput.oninput = function(){

    if(this.value.trim() !== "") return

    appliedCoupon = null
    couponDiscount = 0

    let newTotal = 0
    cart.forEach(item=>{
      newTotal += item.price * item.qty
    })

    document.getElementById("pay-amount").innerText =
  newTotal.toLocaleString() + "đ"

// ===== CẬP NHẬT LẠI QR =====
const orderId = window._currentOrderId

const qrUrl =
`https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACC}-compact2.png` +
`?amount=${newTotal}` +
`&addInfo=${orderId}` +
`&accountName=${encodeURIComponent(BANK_NAME)}`

window._currentQrUrl = qrUrl
window._currentTotal = newTotal

    if(couponMsg) couponMsg.innerHTML = ""

  }

}

// ===== SINH QR ĐỘNG =====
const finalTotal = total - couponDiscount

const qrUrl =
  `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACC}-compact2.png` +
  `?amount=${finalTotal}` +
  `&addInfo=${orderId}` +
  `&accountName=${encodeURIComponent(BANK_NAME)}`

// LƯU QR để dùng cho step 2
window._currentQrUrl = qrUrl
window._currentOrderId = orderId
window._currentTotal = total - couponDiscount

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

  const couponInput = document.getElementById("coupon-code")
  const code = couponInput?.value.trim()

  if(code && !appliedCoupon){
    showToast("Mã giảm giá không tồn tại", "error")
    couponInput.focus()
    return
  }

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

  original_total: total,
  discount: couponDiscount,
  coupon: appliedCoupon,

  total: window._currentTotal,

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
    showToast("Lỗi dữ liệu đơn hàng","error")
    return
  }

  // gửi dữ liệu nhưng KHÔNG chờ
  fetch("https://script.google.com/macros/s/AKfycby_RLqohuq-mtIX3lRbqkhLeMlV1cA79Cu9NUed0J-glAGewX5rFOgTZwg4HIyqbiqa/exec",{
    method:"POST",
    mode:"no-cors",
    body:JSON.stringify({
      action:"createOrder",
      ...tempOrderData
    })
  })

  // chuyển step ngay lập tức
  document.getElementById("pay-step2-modal").style.display="none"
  document.getElementById("pay-step3-modal").style.display="flex"

  cart=[]
  saveCart()
  updateCartCount()
  renderCart()

  tempOrderData=null
}


// ================= APPLY COUPON =================

async function applyCoupon(){

  const input = document.getElementById("coupon-code")
  const msg   = document.getElementById("coupon-msg")

  if(!input) return


  const code = input.value.trim().toUpperCase()

// ===== nếu xóa mã giảm giá → trả về giá gốc =====
if(!code){

  let total = 0
  cart.forEach(item=>{
    total += item.price * item.qty
  })

  appliedCoupon = null
  couponDiscount = 0

  const totalEl = document.getElementById("pay-amount")
  if(totalEl){
    totalEl.innerText = total.toLocaleString() + "đ"
  }

  msg.innerHTML = ""
  return
}

  let total = 0

cart.forEach(item=>{
  total += item.price * item.qty
})



  // ===== TEST COUPON LOCAL =====
const data =
couponCache.find(c =>
c.code.toUpperCase()===code.toUpperCase()
)

if(!data){
  showToast("Mã giảm giá không tồn tại","error")
  return
}

// kiểm tra trạng thái
if(data.active === false){
  showToast("Mã đã bị tắt","error")
  return
}

// kiểm tra hết lượt
if(data.used >= data.limit){
  showToast("Mã đã hết lượt","error")
  return
}

if(data.status==="expired"){
showToast("Mã đã hết hạn","error")
return
}

if(total < data.min){
showToast("Đơn chưa đạt giá trị tối thiểu","warn")
return
}

let discount = 0

if(data.type==="percent"){
discount = total * data.value/100
}

if(data.type==="money"){
discount = data.value
}

  appliedCoupon = code
  couponDiscount = Math.min(discount,total)

  const finalTotal = total - couponDiscount

  // hiển thị thông báo
  msg.innerHTML =
  `Đã áp dụng mã <b>${code}</b> - giảm <b>${couponDiscount.toLocaleString()}đ</b>`

  // cập nhật tổng tiền
  const totalEl = document.getElementById("pay-amount")
if(totalEl){
  totalEl.innerText = finalTotal.toLocaleString() + "đ"
}

// ===== CẬP NHẬT QR =====

const orderId = window._currentOrderId

const qrUrl =
`https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACC}-compact2.png` +
`?amount=${finalTotal}` +
`&addInfo=${orderId}` +
`&accountName=${encodeURIComponent(BANK_NAME)}`

window._currentQrUrl = qrUrl
window._currentTotal = finalTotal

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




function flyToCart(imgSrc, startEl){

const cart = document.getElementById("cart-box")
if(!cart || !startEl) return

const start = startEl.getBoundingClientRect()
const end = cart.getBoundingClientRect()

const img = document.createElement("img")
img.src = imgSrc
img.className = "fly-img"

img.style.left = start.left + "px"
img.style.top = start.top + "px"
img.style.width = start.width + "px"
img.style.height = start.height + "px"

document.body.appendChild(img)

// ===== tính đường bay cong =====

const midX = (start.left + end.left) / 2
const midY = start.top - 150

let startTime = null
const duration = 700

function animate(time){

if(!startTime) startTime = time

const progress = Math.min((time - startTime)/duration,1)

// cubic ease
const t = progress
const curve = 1 - Math.pow(1-t,3)

// Bezier
const x =
(1-t)*(1-t)*start.left +
2*(1-t)*t*midX +
t*t*end.left

const y =
(1-t)*(1-t)*start.top +
2*(1-t)*t*midY +
t*t*end.top

img.style.left = x + "px"
img.style.top = y + "px"

const scale = 1 - curve*0.85
img.style.transform = `scale(${scale}) rotate(${curve*25}deg)`
img.style.opacity = 1 - curve*0.7

if(progress < 1){
requestAnimationFrame(animate)
}else{

img.remove()

const rect = cart.getBoundingClientRect()

cartSparkle(
rect.left + rect.width/2,
rect.top + rect.height/2
)

cart.classList.add("cart-bounce")

setTimeout(()=>{
cart.classList.remove("cart-bounce")
},400)

}

}

requestAnimationFrame(animate)

}



function flyProduct(btn){

const card = btn.closest(".product")
if(!card) return

const img = card.querySelector("img")
if(!img) return

flyToCart(img.src, img)

}

function cartSparkle(x,y){

for(let i=0;i<8;i++){

const p = document.createElement("div")
p.className = "cart-sparkle"

p.style.left = x + "px"
p.style.top = y + "px"

const dx = (Math.random()*120-60)+"px"
const dy = (Math.random()*120-60)+"px"

p.style.setProperty("--x",dx)
p.style.setProperty("--y",dy)

document.body.appendChild(p)

setTimeout(()=>{
p.remove()
},600)

}

}

