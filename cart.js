let cart = JSON.parse(localStorage.getItem("cart")) || []

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart))
}

function addToCart(name, price){
  let item = cart.find(i=>i.name===name)
  if(item){
    item.qty++
  }else{
    cart.push({name, price, qty:1, img:"images/no-image.png"})
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

function changeQty(index, delta){
  cart[index].qty += delta
  if(cart[index].qty<=0){
    cart.splice(index,1)
  }
  saveCart()
  updateCartCount()
  renderCart()
}

function updateCartCount(){
  let totalQty = cart.reduce((s,i)=>s+i.qty,0)
  document.getElementById("cart-count").textContent = totalQty
  const txt = document.getElementById("cart-count-text")
  if(txt) txt.textContent = totalQty
}

function openCart(){
  document.getElementById("cart-box").style.display="none"
  document.getElementById("cart-box-full").style.display="block"
}

function toggleCart(){
  document.getElementById("cart-box").style.display="flex"
  document.getElementById("cart-box-full").style.display="none"
}

function renderCart(){
  const box = document.getElementById("cart-items")
  const totalEl = document.getElementById("cart-total")
  box.innerHTML=""
  let total=0

  cart.forEach((item,i)=>{
    total += item.price * item.qty
    box.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-qty">
            <button onclick="changeQty(${i},-1)">-</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${i},1)">+</button>
            <span class="cart-remove" onclick="removeItem(${i})">🗑</span>
          </div>
        </div>
        <div class="cart-price">${(item.price*item.qty).toLocaleString()} đ</div>
      </div>
    `
  })

  totalEl.textContent = total.toLocaleString()
}

function openPay(){
  if(cart.length==0){alert("Giỏ hàng trống");return}
  let total=cart.reduce((s,i)=>s+i.price*i.qty,0)
  document.getElementById("pay-amount").innerText="Số tiền cần thanh toán: "+total.toLocaleString()+"đ"
  document.getElementById("pay-text").innerText="Hãy chuyển khoản đúng số tiền ở trên.\nSau đó chụp lại bill thanh toán và gửi đến Zalo: 0977 727 089 để xác nhận đơn hàng."
  document.getElementById("pay-modal").style.display="flex"
}

function closePay(){
  document.getElementById("pay-modal").style.display="none"
}

function showToast(text){
  const toast = document.getElementById("toast")
  toast.innerText = text
  toast.classList.add("show")
  setTimeout(()=>{
    toast.classList.remove("show")
  },2000)
}

updateCartCount()
renderCart()
