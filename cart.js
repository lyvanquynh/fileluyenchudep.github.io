let cart = JSON.parse(localStorage.getItem("cart")) || []

function saveCart(){
localStorage.setItem("cart", JSON.stringify(cart))
}

function addToCart(name, price){
  cart.push({name, price})
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
  cart.forEach(i=>{
    total += i.price
  })
  document.getElementById("cart-count").textContent = cart.length
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
    total += item.price

    const li=document.createElement("li")
    li.innerHTML=`
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-price">${item.price.toLocaleString()}đ</span>
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

  cart.forEach(item=>{
    total += item.price
    itemsHTML += `<li>- ${item.name}</li>`
    orderText += "- " + item.name + "\n"
  })

  const orderId = "HD" + Date.now()

  document.getElementById("order-id").innerText = "Mã đơn: #" + orderId
  document.getElementById("pay-items").innerHTML = itemsHTML
  document.getElementById("pay-amount").innerText = total.toLocaleString() + "đ"

  const text =
    "Hãy chuyển khoản đúng số tiền.\n" +
    "Sau đó chụp lại bill và gửi Zalo: 0977 727 089"

  document.getElementById("pay-text").innerText = text

  orderText += "Tổng tiền: " + total.toLocaleString() + "đ\n"
  orderText += "Mã đơn: #" + orderId

  document.getElementById("copy-order-btn").onclick = function(){
    navigator.clipboard.writeText(orderText)
    showToast("Đã copy nội dung đơn")
  }

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
      backToTop.classList.add("show");
    }else{
      backToTop.classList.remove("show");
    }
  });

  backToTop.addEventListener("click", function(){
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

