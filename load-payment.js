document.addEventListener("DOMContentLoaded", function(){

  const container = document.getElementById("payment-container")
  if(!container) return

  fetch("payment-popup.html")
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html
    })
})