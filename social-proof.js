document.addEventListener("DOMContentLoaded",function(){

const popup=document.getElementById("purchase-popup")
if(!popup) return

// ===== DANH SÁCH TÊN =====
const names=[
"Lan Anh","Thu Trang","Minh Anh","Thảo Vy","Hải Yến","Ngọc Anh","Thanh Hà","Phương Linh",
"Quỳnh Anh","Hồng Nhung","Khánh Linh","Thu Hương","Mai Phương","Bích Ngọc","Tú Anh","Lan Hương",
"Hà Phương","Thùy Linh","Ngọc Mai","Thu Thảo","Kim Anh","Hồng Phúc","Thúy Hằng","Lan Chi",
"Minh Châu","Hoàng Anh","Thu Huyền","Ngọc Trâm","Bảo Ngọc","Hà My","Phương Thảo","Lan Ngọc",
"Trúc Linh","Diệu Linh","Như Quỳnh","Tú Linh","Thanh Vy","Thu Uyên","Ngọc Diệp","Lan Phương",
"Hải Anh","Phương Anh","Thu Ngân","Lan Vy","Thùy Trang","Hải Linh","Bích Hạnh","Mai Linh",
"Khánh Vy","Thảo Nguyên","Thanh Trúc","Ngọc Hân","Thu Hà","Hồng Anh","Tú Uyên","Hà Anh",
"Ngọc Lan","Thanh Mai","Lan Hạ","Thùy Anh","Diễm Quỳnh","Thanh Nhàn","Hồng Phương","Minh Trang"
]

// ===== DANH SÁCH TỈNH =====
const cities=[
"Hà Nội","TP.HCM","Đà Nẵng","Hải Phòng","Nghệ An","Thanh Hóa",
"Quảng Ninh","Bắc Ninh","Hải Dương","Nam Định","Huế","Quảng Nam",
"Quảng Ngãi","Bình Định","Khánh Hòa","Lâm Đồng","Đắk Lắk","Gia Lai",
"Đồng Nai","Bình Dương","Cần Thơ","An Giang","Kiên Giang","Long An",
"Tiền Giang","Bến Tre","Trà Vinh","Vĩnh Long","Sóc Trăng","Bạc Liêu",
"Cà Mau","Phú Yên","Ninh Thuận","Bình Thuận","Tây Ninh","Bình Phước",
"Kon Tum","Quảng Bình","Quảng Trị","Thái Bình","Thái Nguyên"
]

// ===== DANH SÁCH SẢN PHẨM =====
const products=[
"Combo Trọn bộ",
"Combo Giáo viên",
"Combo Luyện chữ cơ bản",
"Combo Chữ sáng tạo",
"A1 - Giáo trình kỹ thuật LCĐ",
"A2 - Giáo án chữ nhỡ",
"A3 - Giáo án chữ nhỏ",
"A4 - Hạ cỡ chữ tròn li",
"A5 - Hạ cỡ chữ nhỏ chuẩn BGD",
"E1 - Chữ sáng tạo",
"E2 - Copperplate",
"E3 - Modern Calligraphy",
"E4 - Uncial Calligraphy",
"G1 - Luyện viết nhanh",
"Combo Calligraphy"
]

let lastMessage=""

// ===== RANDOM =====
function randomItem(arr){
return arr[Math.floor(Math.random()*arr.length)]
}

function randomTime(){
return Math.floor(Math.random()*8)+1
}

// ===== HIỂN THỊ POPUP =====
function showPopup(){

// nếu popup thanh toán đang mở thì tắt
const payModal=document.getElementById("pay-modal")
if(payModal && payModal.style.display==="flex") return

let message=""

do{

const name=randomItem(names)
const city=randomItem(cities)
const product=randomItem(products)
const time=randomTime()

message=`
<div class="social-box">
<div class="social-icon">🛒</div>
<div class="social-text">
<b>${name}</b> (${city})<br>
vừa mua <b>${product}</b><br>
<span class="social-time">${time} phút trước</span>
</div>
</div>
`

}while(message===lastMessage)

lastMessage=message

popup.innerHTML=message

popup.classList.add("show")

setTimeout(()=>{
popup.classList.remove("show")
},5000)

}

// ===== CHU KỲ POPUP =====
setTimeout(()=>{

showPopup()

setInterval(()=>{
showPopup()
},30000)

},25000)

})