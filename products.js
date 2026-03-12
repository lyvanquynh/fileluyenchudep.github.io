// ===== DANH SÁCH SẢN PHẨM =====

const PRODUCTS = {

    COMBO_ALL:{
id:"COMBO_ALL",
name:"Combo Trọn bộ (All in One)",
description:"Gồm: A1+A2+A3+A4+A5 + E1+E2+E3+E4 + G1",
category:"combo",
badge:"TRỌN BỘ",
price:899000,
oldPrice:1464000,
image:"images/combo-all.jpg"
},

COMBO_GV:{
id:"COMBO_GV",
name:"Combo Giáo viên Tiểu học",
description:"Gồm: A1 + A2 + A3",
category:"combo",
badge:"Tiết kiệm",
price:699000,
oldPrice:900000,
image:"images/combo-gv.jpg"
},

COMBO_HS:{
id:"COMBO_HS",
name:"Combo Luyện chữ cơ bản",
description:"Gồm: A4 + A5",
category:"combo",
badge:"Hot",
price:129000,
oldPrice:158000,
image:"images/combo-hs.jpg"
},

COMBO_CALLI:{
id:"COMBO_CALLI",
name:"Combo Chữ sáng tạo",
description:"Gồm: E1 + E2 + E3 + E4",
category:"combo",
badge:"Best",
price:199000,
oldPrice:306000,
image:"images/combo-calligraphy.jpg"
},

A1:{
id:"A1",
name:"A1 - Giáo trình kỹ thuật LCĐ",
description:"Hướng dẫn kỹ thuật viết chữ đẹp",
category:"bo1",
price:600000,
oldPrice:1500000,
image:"A1-Giaotrinhkythuat/thumb.jpg",
galleryPath:"A1-Giaotrinhkythuat/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/1lKQu6_N5T9At9ged_ViPdcIFhoO_f-kB?usp=drive_link"
},

A2:{
id:"A2",
name:"A2 - Giáo án dạy chữ nhỡ - TTH",
description:"Thực hành chữ chuẩn cỡ nhỡ",
category:"bo1",
price:150000,
oldPrice:450000,
image:"A2-Thuc hanhTTH5mm/thumb.jpg",
galleryPath:"A2-Thuc hanhTTH5mm/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/1q7VB_6tK98Jc-5S2pDSgp_NCsa_UibFa?usp=drive_link"
},

A3:{
id:"A3",
name:"A3 - Giáo án dạy chữ nhỏ - TH",
description:"Thực hành chữ chuẩn hạ cỡ nhỏ",
category:"bo1",
price:150000,
oldPrice:450000,
image:"A3-ThuchanhTH2.5mm/thumb.jpg",
galleryPath:"A3-ThuchanhTH2.5mm/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/18pBjXUXYc2NjZgYHFa2MdOWB8HeVDzRB?usp=drive_link"
},

A4:{
id:"A4",
name:"A4 – Hạ cỡ chữ tròn li",
description:"Thực hành hạ cỡ chữ nhỏ tròn li",
category:"bo1",
price:69000,
oldPrice:250000,
image:"A4-Hacotronli/thumb.jpg",
galleryPath:"A4-Hacotronli/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/1Eu8F2BDkuIkNiKjApNyJ0aOsbq_h9JLW?usp=drive_link"
},

A5:{
id:"A5",
name:"A5 – Hạ cỡ nhỏ chữ chuẩn BGD",
description:"Thực hành cỡ chữ nhỏ mẫu chữ chuẩn",
category:"bo1",
price:89000,
oldPrice:250000,
image:"A5-HaCoChuNho-ChuChuan-TieuHoc/thumb.jpg",
galleryPath:"A5-HaCoChuNho-ChuChuan-TieuHoc/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/1O-or_c5nsJwFBraS-Tg3N32JvWA7Eowr?usp=drive_link"
},

E1:{
id:"E1",
name:"E1 – Chữ sáng tạo (Cơ bản)",
description:"Tài liệu luyện chữ sáng tạo cơ bản",
category:"bo2",
price:69000,
oldPrice:150000,
image:"E1-SangtaoQuyen1Coban/thumb.jpg",
galleryPath:"E1-SangtaoQuyen1Coban/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/15Od0N-wiZ0NvsuFruDKuorg_hhjsxRZ3?usp=drive_link"
},

E2:{
id:"E2",
name:"E2 - Copperplate Calligraphy",
description:"Tài liệu luyện chữ sáng tạo nâng cao",
category:"bo2",
price:89000,
oldPrice:220000,
image:"E2-SangtaoQuyen2Nangcao/thumb.jpg",
galleryPath:"E2-SangtaoQuyen2Nangcao/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/1fovH0KT3kR-0Z1dazYALmZ-GWPyfl8Jd?usp=drive_link"
},

E3:{
id:"E3",
name:"E3 - Modern Calligraphy",
description:"Tài liệu luyện chữ sáng tạo nâng cao",
category:"bo2",
price:89000,
oldPrice:220000,
image:"E3-SangtaoModernCalligraphy/thumb.jpg",
galleryPath:"E3-SangtaoModernCalligraphy/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/1jvOR29l-oGoAhT_tuxLOlED0CsQDDRal?usp=drive_link"
},

E4:{
id:"E4",
name:"E4 - Unical Calligraphy",
description:"Tài liệu luyện chữ nghệ thuật nâng cao",
category:"bo2",
price:59000,
oldPrice:160000,
image:"E4-Chuvietnghethuat/thumb.jpg",
galleryPath:"E4-Chuvietnghethuat/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/1D5NqYlkJKiBpuSdlU5VryUwwph6j6cM3?usp=drive_link"
},

G1:{
id:"G1",
name:"G1 - Luyện viết nhanh/Tốc ký",
description:"Tài liệu luyện chữ viết nhanh",
category:"bo3",
price:99000,
oldPrice:250000,
image:"G1-Luyenviettocky/thumb.jpg",
galleryPath:"G1-Luyenviettocky/images",
galleryCount:20,
drive:"https://drive.google.com/drive/folders/1E7hXI4eMbr2lYH8749WaWJjV-aTprgOW?usp=drive_link"
}

}