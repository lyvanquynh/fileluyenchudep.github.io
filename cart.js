let cart = JSON.parse(localStorage.getItem("cart")) || []
let confirmBtnTimer = null   // ===== thêm =====
let tempOrderData = null     // ===== thêm bước 2 =====

// ===== COUPON =====
let appliedCoupon = null
let couponDiscount = 0

let couponTimerInterval = null
let couponRemainSeconds = 0

let couponCache = []
let couponTypingTimer = null

async function loadCoupons(){

const res = await fetch(COUPON_API,{
method:"POST",
body:JSON.stringify({
action:"getCoupons"
})
})

const data = await res.json()

couponCache = data.coupons || []

couponCache = couponCache.map(c=>{
c.code = c.code.toUpperCase()
return c
})

}


const COUPON_API =
"https://script.google.com/macros/s/AKfycby_RLqohuq-mtIX3lRbqkhLeMlV1cA79Cu9NUed0J-glAGewX5rFOgTZwg4HIyqbiqa/exec"

loadCoupons()

checkCouponVersion()
// ===== AUTO RELOAD COUPON =====
setInterval(()=>{
checkCouponVersion()
},15000)

// ===== MANUAL ID BYPASS =====
const VALID_IDS = ["HONGYEUQUYNH", "FREE999", "TEST001"]

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

function addToCart(productId){

  const product = PRODUCTS[productId]

  if(!product) return

  const id = product.id
  const name = product.name
  const price = product.price

  const found = cart.find(item => item.id === id)

  if(found){
    found.qty += 1
  }else{
    cart.push({
      id:id,
      name:name,
      price:price,
      qty:1
    })
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

// reset coupon mỗi lần mở popup
appliedCoupon = null
couponDiscount = 0

if(couponTimerInterval){
clearInterval(couponTimerInterval)
couponTimerInterval = null
}

const timerEl = document.getElementById("coupon-timer")
if(timerEl){
timerEl.style.display = "none"
timerEl.innerHTML = ""
}

  const couponInput = document.getElementById("coupon-code")
if(couponInput) couponInput.value = ""

const couponMsg = document.getElementById("coupon-msg")
if(couponMsg) couponMsg.innerHTML = ""


if(cart.length==0){
  showToast("Giỏ hàng trống", "warn")
  return
}

unlockConfirmBtn() // ===== thêm =====

// ===== RESET NÚT THANH TOÁN =====
const paidBtn = document.querySelector(".confirm-paid-btn")
if(paidBtn){
  paidBtn.disabled = false
}

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

const product = PRODUCTS[item.id]

orderItemsJson.push({
  id: item.id,
  name: item.name,
  drive: product?.drive || "",
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
if(couponInput){

couponInput.oninput = function(){

const val = this.value.trim()

// nếu xóa mã hoặc thay mã mới
if(val === "" || val !== appliedCoupon){

appliedCoupon = null
couponDiscount = 0

updatePaymentTotal()

if(couponMsg){

if(val !== ""){
couponMsg.innerHTML =
"<span style='color:#ff9800;font-style:italic'>" +
"⚠ Nhấn 'Áp dụng giảm giá' để kích hoạt mã" +
"</span>"
}else{
couponMsg.innerHTML = ""
}

}

const timerEl = document.getElementById("coupon-timer")

if(timerEl){
timerEl.style.display = "none"
timerEl.innerHTML = ""
}

if(couponTimerInterval){
clearInterval(couponTimerInterval)
couponTimerInterval = null
}

}

// ===== AUTO APPLY COUPON SAU 1 GIÂY =====

if(couponTypingTimer){
clearTimeout(couponTypingTimer)
}

if(val !== ""){

couponTypingTimer = setTimeout(()=>{

applyCoupon()

},1000)

}

}

}

// ===== SINH QR ĐỘNG =====
const finalTotal = total - couponDiscount

const qrUrl =
  `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACC}-compact2.png` +
  `?amount=${finalTotal}` +
  `&addInfo=SEVQR ${orderId}` +
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

  orderText += "Tổng tiền: " + window._currentTotal.toLocaleString() + "đ\n"
  orderText += "Mã đơn: #" + orderId


  // ================= NÚT XÁC NHẬN =================

  const confirmBtn = document.getElementById("copy-order-btn")

  confirmBtn.onclick = async function(){

  const couponInput = document.getElementById("coupon-code")
  const code = couponInput?.value.trim()

  if(code && !appliedCoupon){

showToast(
"Bạn đã nhập mã giảm giá nhưng chưa nhấn 'Áp dụng giảm giá'",
"warn"
)

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
  document.body.style.overflow = ""
}

// ===== MỞ STEP 2 =====
const modal2 = document.getElementById("pay-step2-modal")
if(modal2){

  modal2.style.display = "flex"
  document.body.style.overflow = "hidden"
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



// reset trạng thái thanh toán mỗi đơn mới
window._paidDone = false

startCheckPaid(window._currentOrderId)

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

  document.body.style.overflow = "hidden"

  payContent.getBoundingClientRect()

  requestAnimationFrame(()=>{
    payContent.classList.remove("zoom-from-cart")
  })
}
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
      document.body.style.overflow = ""
    },300)
  }
}

function changeQty(index, delta){
  cart[index].qty += delta

  if(cart[index].qty <= 0){
    cart.splice(index,1)
  }

  saveCart()
  updateCartCount()
  renderCart()
  unlockConfirmBtn()

  if(cart.length === 0){
  closePay()
}else{
  openPay()
}

}

function removeItemInPay(index){
  cart.splice(index,1)

  saveCart()
  updateCartCount()
  renderCart()
  unlockConfirmBtn()

  if(cart.length === 0){
  closePay()
}else{
  openPay()
}

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

function confirmPaid(){
  // đã loại bỏ — dùng Sepay auto
}


function updatePaymentTotal(){

let total = 0

cart.forEach(i=>{
total += i.price * i.qty
})

const finalTotal = total - couponDiscount

const totalEl = document.getElementById("pay-amount")

if(totalEl){
totalEl.innerText = finalTotal.toLocaleString() + "đ"
}

// cập nhật QR

const orderId = window._currentOrderId || ""

const qrUrl =
`https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACC}-compact2.png`
+ `?amount=${finalTotal}`
+ `&addInfo=SEVQR ${orderId}`
+ `&accountName=${encodeURIComponent(BANK_NAME)}`

window._currentQrUrl = qrUrl
window._currentTotal = finalTotal

}


// ================= APPLY COUPON =================

async function applyCoupon(){

const couponInput = document.getElementById("coupon-code")
const emailInput = document.getElementById("customer-email")
const couponMsg = document.getElementById("coupon-msg")

if(!couponInput) return

const code = couponInput.value.trim().toUpperCase()

if(!code){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Vui lòng nhập mã giảm giá" +
"</span>"
return
}

const email = emailInput?.value.trim() || ""

if(!email){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Vui lòng nhập email trước khi áp dụng mã giảm giá" +
"</span>"
return
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

if(!emailPattern.test(email)){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Email không hợp lệ" +
"</span>"
emailInput?.focus()
return
}

let total = 0

cart.forEach(i=>{
total += i.price * i.qty
})

couponMsg.innerHTML =
"<span style='color:#e53935;font-weight:700'>" +
"⏳ Đang kiểm tra mã giảm giá..." +
"</span>"

try{

const res = await fetch(COUPON_API,{
method:"POST",
body:JSON.stringify({
action:"checkCoupon",
code:code,
email:email,
total:total
})
})

const data = await res.json()

if(data.status === "invalid"){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Mã giảm giá không tồn tại" +
"</span>"
return
}

if(data.status === "disabled"){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Mã giảm giá chưa kích hoạt" +
"</span>"
return
}

if(data.status === "limit"){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Mã giảm giá đã hết lượt" +
"</span>"
return
}

if(data.status === "expired"){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Mã giảm giá đã hết hạn" +
"</span>"
return
}

if(data.status === "min"){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Đơn hàng chưa đạt giá trị tối thiểu" +
"</span>"
return
}

if(data.status === "used"){
couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Email đã sử dụng mã này" +
"</span>"
return
}

if(data.status === "ok"){

appliedCoupon = code
couponDiscount = Number(data.discount || 0)

const originalTotal = total
const finalTotal = total - couponDiscount

couponMsg.innerHTML =
"<div style='background:#e8f5e9;padding:10px;border-radius:10px;margin-top:6px'>" +
"<div style='color:#2e7d32;font-weight:700;font-size:16px'>" +
"🎉 Bạn được giảm <b>" + couponDiscount.toLocaleString() + "đ</b>" +
"</div>" +

"<div style='font-size:13px;margin-top:2px'>" +
"Giá gốc: <s>" + originalTotal.toLocaleString() + "đ</s>" +
"</div>" +

"<div style='color:#e60000;font-weight:700'>" +
"Chỉ còn: " + finalTotal.toLocaleString() + "đ" +
"</div>" +

"</div>"

startCouponCountdown(data.time)

updatePaymentTotal()

}

}catch(err){

couponMsg.innerHTML =
"<span style='color:#d32f2f;font-style:italic;font-weight:600'>" +
"⚠ Lỗi kết nối máy chủ" +
"</span>"

}

}

function startCouponCountdown(minutes){

const timerEl = document.getElementById("coupon-timer")

if(!timerEl) return

if(couponTimerInterval){
clearInterval(couponTimerInterval)
}

minutes = Number(minutes || 0)

couponRemainSeconds = minutes * 60

timerEl.style.display = "inline-block"

updateCouponTimer()

couponTimerInterval = setInterval(()=>{

couponRemainSeconds--

updateCouponTimer()

if(couponRemainSeconds <= 0){

clearInterval(couponTimerInterval)

timerEl.innerHTML = "⚠ Mã khuyến mại đã hết thời gian"

const couponMsg = document.getElementById("coupon-msg")
if(couponMsg){
couponMsg.innerHTML = "Mã giảm giá đã hết thời gian"
}

appliedCoupon = null
couponDiscount = 0

updatePaymentTotal()

}

},1000)

}

function updateCouponTimer(){

const timerEl = document.getElementById("coupon-timer")

if(!timerEl) return

const min = Math.floor(couponRemainSeconds / 60)
const sec = couponRemainSeconds % 60

const m = min.toString().padStart(2,"0")
const s = sec.toString().padStart(2,"0")

timerEl.innerHTML =
"⏳ Mã khuyến mại còn " + m + ":" + s

}

// ================= INIT =================

updateCartCount()
renderCart()

// ===== GẮN NÚT ÁP DỤNG COUPON =====
document.addEventListener("click", function(e){

const btn = e.target.closest("#apply-coupon-btn")

if(!btn) return

e.preventDefault()

applyCoupon()

})

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

const cart = document.querySelector("#cart-box")

if(!cart || !startEl) return

const startRect = startEl.getBoundingClientRect()
const cartRect = cart.getBoundingClientRect()

const img = document.createElement("img")
img.src = imgSrc
img.className = "fly-img"

img.style.position = "fixed"
img.style.left = startRect.left + "px"
img.style.top = startRect.top + "px"
img.style.width = startRect.width + "px"
img.style.height = startRect.height + "px"

document.body.appendChild(img)

const dx =
(cartRect.left + window.scrollX + cartRect.width/2) -
(startRect.left + window.scrollX)

const dy =
(cartRect.top + window.scrollY + cartRect.height/2) -
(startRect.top + window.scrollY)

requestAnimationFrame(()=>{

img.style.transition = "transform 0.7s cubic-bezier(.2,.8,.2,1), opacity 0.7s"

img.style.transform = `translate(${dx}px, ${dy}px) scale(.2) rotate(25deg)`
img.style.opacity = "0.2"

})

setTimeout(()=>{

const rect = cart.getBoundingClientRect()

cartSparkle(
rect.left + window.scrollX + rect.width/2,
rect.top + window.scrollY + rect.height/2
)

cart.classList.add("cart-bounce")

setTimeout(()=>{
cart.classList.remove("cart-bounce")
},400)

img.remove()

},620)

}

function flyProduct(btn){

if(!btn) return

const card = btn.closest(".product")

if(!card){
console.warn("Không tìm thấy .product")
return
}

const img = card.querySelector("img")

if(!img){
console.warn("Không tìm thấy ảnh sản phẩm")
return
}

flyToCart(img.src, img)

}

function cartSparkle(x,y){

for(let i=0;i<12;i++){

const p = document.createElement("div")
p.className = "cart-sparkle"

const size = 6 + Math.random()*6
p.style.width = size + "px"
p.style.height = size + "px"

p.style.left = x + "px"
p.style.top = y + "px"

const dx = (Math.random()*240-120)+"px"
const dy = (Math.random()*240-120)+"px"

p.style.setProperty("--x",dx)
p.style.setProperty("--y",dy)

document.body.appendChild(p)

const life = 500 + Math.random()*400

setTimeout(()=>{
p.remove()
},life)

}

}

async function checkCouponVersion(){

try{

const res = await fetch(COUPON_API,{
method:"POST",
body:JSON.stringify({
action:"getCoupons"
})
})
const data = await res.json()

const oldVersion = localStorage.getItem("couponVersion")

if(oldVersion !== data.version){

localStorage.setItem("couponVersion",data.version)

couponCache = data.coupons || []

couponCache = couponCache.map(c=>{
c.code = c.code.toUpperCase()
return c
})

console.log("Coupon updated realtime")

}

}catch(err){

console.log("coupon check error",err)

}

}

function startCheckPaid(orderId){

  const interval = setInterval(async ()=>{

    try{

      const res = await fetch(COUPON_API,{
        method:"POST",
        body:JSON.stringify({
          action:"checkPaid",
          orderId:orderId
        })
      })

      const text = await res.text()

if(text.trim() === "PAID" && !window._paidDone){

  window._paidDone = true

  clearInterval(interval)

  document.getElementById("pay-step2-modal").style.display="none"
  const modal3 = document.getElementById("pay-step3-modal")
const box = document.querySelector(".step3-box")

if(modal3 && box){

  // hiển thị popup
  modal3.style.display = "flex"

  // ===== RESET SVG ANIMATION =====
  const circle = box.querySelector(".check-circle")
  const tick = box.querySelector(".check-mark")

  if(circle && tick){

  // reset stroke
  circle.style.strokeDasharray = "283"
  circle.style.strokeDashoffset = "283"

  tick.style.strokeDasharray = "50"
  tick.style.strokeDashoffset = "50"

  // reset animation
  circle.style.animation = "none"
  tick.style.animation = "none"

  // force reflow mạnh hơn
  circle.getBoundingClientRect()
  tick.getBoundingClientRect()

  // delay nhỏ để đảm bảo reset xong
  setTimeout(()=>{
    circle.style.animation = ""
    tick.style.animation = ""
  },20)
}

  // reset class
  box.classList.remove("show")
  void box.offsetWidth

  // trigger animation
  setTimeout(()=>{
    box.classList.add("show")
  },50)

}

// ===== TẠO ĐƠN + GỬI MAIL (SAU KHI THANH TOÁN) =====
if(tempOrderData){

// 1. TẠO ĐƠN
fetch(COUPON_API,{
  method:"POST",
  body:JSON.stringify({
    action:"createOrder",
    ...tempOrderData
  })
})

// 2. GỬI MAIL ADMIN
fetch(COUPON_API,{
  method:"POST",
  body:JSON.stringify({
    action:"sendAdminMail",
    ...tempOrderData
  })
})

}

  // ===== XOÁ GIỎ HÀNG =====
  cart = []
  saveCart()
  updateCartCount()
  renderCart()

  // ===== RESET BIẾN =====
  appliedCoupon = null
  couponDiscount = 0

  window._currentTotal = 0
  tempOrderData = null

  const emailInput = document.getElementById("customer-email")
  if(emailInput) emailInput.value = ""

  const couponInput = document.getElementById("coupon-code")
  if(couponInput) couponInput.value = ""

  const couponMsg = document.getElementById("coupon-msg")
  if(couponMsg) couponMsg.innerHTML = ""

}

    }catch(err){}

  },3000)

}

function confirmById(){

  const input = document.getElementById("manual-id-input")
  if(!input) return

  const val = input.value.trim().toUpperCase()

  if(!val){
    showToast("Vui lòng nhập ID", "warn")
    return
  }

  // ===== CHECK ID =====
  if(!VALID_IDS.includes(val)){
    showToast("ID không hợp lệ", "error")
    return
  }

  // ===== TRÁNH CHẠY 2 LẦN =====
  if(window._paidDone){
    return
  }

  window._paidDone = true

  showToast("Xác nhận ID thành công", "success")

  // ===== GỬI ĐƠN =====
  if(tempOrderData){

    fetch(COUPON_API,{
      method:"POST",
      body:JSON.stringify({
        action:"createOrder",
        ...tempOrderData
      })
    })

    fetch(COUPON_API,{
      method:"POST",
      body:JSON.stringify({
        action:"sendAdminMail",
        ...tempOrderData
      })
    })

  }

  // ===== ẨN STEP 2 =====
  const step2 = document.getElementById("pay-step2-modal")
  if(step2){
    step2.style.display = "none"
  }

  // ===== HIỆN STEP 3 =====
  const modal3 = document.getElementById("pay-step3-modal")
  if(modal3){
    modal3.style.display = "flex"
  }

  // ===== XOÁ GIỎ HÀNG (QUAN TRỌNG) =====
  cart = []
  saveCart()
  updateCartCount()
  renderCart()

  // ===== RESET BIẾN =====
  appliedCoupon = null
  couponDiscount = 0

  window._currentTotal = 0
  tempOrderData = null

  // ===== RESET INPUT =====
  const emailInput = document.getElementById("customer-email")
  if(emailInput) emailInput.value = ""

  const couponInput = document.getElementById("coupon-code")
  if(couponInput) couponInput.value = ""

  const couponMsg = document.getElementById("coupon-msg")
  if(couponMsg) couponMsg.innerHTML = ""

  // ===== RESET ID INPUT =====
  input.value = ""

}

function sendOrderToServer(){

  if(!tempOrderData) return

  fetch(COUPON_API,{
    method:"POST",
    body:JSON.stringify({
      action:"createOrder",
      ...tempOrderData
    })
  })

}

function sendAdminNotify(){

  if(!tempOrderData) return

  fetch(COUPON_API,{
    method:"POST",
    body:JSON.stringify({
      action:"sendAdminMail",
      ...tempOrderData
    })
  })

}

function openSuccessStep(){

  const step2 = document.getElementById("pay-step2-modal")
  if(step2){
    step2.style.display = "none"
  }

  const step3 = document.getElementById("pay-step3-modal")
  if(step3){
    step3.style.display = "flex"
    document.body.style.overflow = "hidden"
  }

}