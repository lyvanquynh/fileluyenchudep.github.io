let cart = JSON.parse(localStorage.getItem("cart")) || []

function saveCart(){
localStorage.setItem("cart", JSON.stringify(cart))
}

function addToCart(name, price){
  const found = cart.find(i => i.name === name)
  if(found){
    found.qty++
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
  let count = 0
  let total = 0
  cart.forEach(i=>{
    count += i.qty
    total += i.price * i.qty
  })
  document.getElementById("cart-count").textContent = count
  document.getElementById("cart-total-mini").textContent = total.toLocaleString()+"đ"
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
  const list=document.getElementById("cart-items")
  const totalEl=document.getElementById("cart-total")
  list.innerHTML=""
  let total=0

  cart.forEach((item,i)=>{
    total += item.price * item.qty

    const li=document.createElement("li")
    li.innerHTML=`
  <span class="cart-item-name">${item.name}</span>

  <div class="cart-qty-box">
    <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
    <span class="qty-num">${item.qty}</span>
    <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
  </div>

  <span class="cart-price">${(item.price*item.qty).toLocaleString()}đ</span>

  <button class="cart-remove" onclick="removeItem(${i})">🗑</button>
`

    list.appendChild(li)
  })

  totalEl.textContent=total.toLocaleString()
}


function openPay(){
if(cart.length==0){alert("Giỏ hàng trống");return}
let total=cart.reduce((s,i)=>s+i.price,0)
document.getElementById("pay-amount").innerText="Số tiền cần thanh toán: "+total.toLocaleString()+"đ"
document.getElementById("pay-text").innerText="Hãy chuyển khoản đúng số tiền ở trên.\nSau đó chụp lại bill thanh toán và gửi đến Zalo: 0977 727 089 để xác nhận đơn hàng."
document.getElementById("pay-modal").style.display="flex"
}

function closePay(){
document.getElementById("pay-modal").style.display="none"
}

updateCartCount()
renderCart()

const searchInput = document.getElementById("searchInput");

if(searchInput){
  searchInput.addEventListener("input", function(){
    const keyword = this.value.toLowerCase();
    const products = document.querySelectorAll(".product");

    products.forEach(product=>{
      const text = product.innerText.toLowerCase();
      if(text.includes(keyword)){
        product.style.display = "flex";
      }else{
        product.style.display = "none";
      }
    });
  });
}

function showToast(text){
  const toast = document.getElementById("toast");
  toast.innerText = text;
  toast.classList.add("show");
  setTimeout(()=>{
    toast.classList.remove("show");
  },2000);
}

const backToTop = document.getElementById("backToTop");

if(backToTop){
  window.addEventListener("scroll", function(){
    if(window.scrollY > 300){
      backToTop.style.display = "flex";
    }else{
      backToTop.style.display = "none";
    }
  });

  backToTop.addEventListener("click", function(){
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

function changeQty(index,delta){
  cart[index].qty += delta
  if(cart[index].qty <= 0){
    cart.splice(index,1)
  }
  saveCart()
  updateCartCount()
  renderCart()
}
