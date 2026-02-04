let cart = JSON.parse(localStorage.getItem("cart")) || []

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
  showToast("Đã thêm " + name + " vào giỏ")
}

function removeItem(index){
  cart.splice(index,1)
  saveCart()
  updateCartCount()
  renderCart()
}

function clearCart(){
  if(confirm("Xóa toàn bộ giỏ hàng?")){
    cart=[]
    saveCart()
    updateCartCount()
    renderCart()
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

function openPay(){
  if(cart.length==0){
    alert("Giỏ hàng trống")
    return
  }

  let total = 0
  let itemsHTML = ""
  let orderText = "Đơn hàng:\n"

  cart.forEach((item,i)=>{
    const lineTotal = item.price * item.qty
    total += lineTotal

    itemsHTML += `
      <li style="border-bottom:1px dashed #ddd;padding-bottom:6px;margin-bottom:6px">
        <div><b>${item.name}</b></div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <button onclick="changeQty(${i},-1)">➖</button>
          <b>${item.qty}</b>
          <button onclick="changeQty(${i},1)">➕</button>
          <span>${item.price.toLocaleString()}đ x ${item.qty} = <b>${lineTotal.toLocaleString()}đ</b></span>
          <button onclick="removeItemInPay(${i})" style="color:red">❌</button>
        </div>
      </li>
    `

    orderText += `${item.name}: ${item.price.toLocaleString()}đ x ${item.qty} = ${lineTotal.toLocaleString()}đ\n`
  })

  const orderId = "HD" + Date.now()

  document.getElementById("order-id").innerText = "Mã đơn: #" + orderId
  document.getElementById("pay-items").innerHTML = itemsHTML
  document.getElementById("pay-amount").innerText = total.toLocaleString() + "đ"

  const text =
    "Hãy chuyển khoản đúng số tiền.\n" +
    "Nhấn Copy nội dung đơn hàng\n" +
    "Sau đó chụp bill và gửi Zalo: 0977 727 089"

  document.getElementById("pay-text").innerText = text

  orderText += "Tổng tiền: " + total.toLocaleString() + "đ\n"
  orderText += "Mã đơn: #" + orderId

  document.getElementById("copy-order-btn").onclick = function(){
    navigator.clipboard.writeText(orderText)
    showToast("Đã copy nội dung đơn")
  }

const payContent = document.getElementById("pay-content")

// trạng thái ban đầu: nhỏ
payContent.classList.add("zoom-from-cart")

document.getElementById("pay-modal").style.display="flex"

// ép browser render trạng thái ban đầu
payContent.getBoundingClientRect()

// animate ra
requestAnimationFrame(()=>{
  payContent.classList.remove("zoom-from-cart")
})
}   // ← ĐÓNG openPay Ở ĐÂY

function closePay(){
  const payContent = document.getElementById("pay-content")

  // thêm class để zoom nhỏ
  payContent.classList.add("zoom-from-cart")

  // sau 300ms mới ẩn popup
  setTimeout(()=>{
    document.getElementById("pay-modal").style.display="none"
    payContent.classList.remove("zoom-from-cart")
  },300)
}


updateCartCount()
renderCart()

const searchInput = document.getElementById("searchInput")

if(searchInput){
  searchInput.addEventListener("input", function(){
    const keyword = this.value.toLowerCase()
    const products = document.querySelectorAll(".product")

    products.forEach(product=>{
      const text = product.innerText.toLowerCase()
      if(text.includes(keyword)){
        product.style.display = "flex"
      }else{
        product.style.display = "none"
      }
    })
  })
}

function changeQty(index, delta){
  cart[index].qty += delta

  if(cart[index].qty <= 0){
    cart.splice(index,1)
  }

  saveCart()
  updateCartCount()
  renderCart()

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

  if(cart.length === 0){
    closePay()
  }else{
    openPay()
  }
}

function showToast(text){
  const toast = document.getElementById("toast")
  toast.innerText = text
  toast.classList.add("show")
  setTimeout(()=>{
    toast.classList.remove("show")
  },2000)
}
