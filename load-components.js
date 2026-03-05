document.addEventListener("DOMContentLoaded", function(){

  const header = document.getElementById("header")
  const footer = document.getElementById("footer")

  if(header){
    fetch("header.html")
      .then(res => res.text())
      .then(html => header.innerHTML = html)
  }

  if(footer){
    fetch("footer.html")
      .then(res => res.text())
      .then(html => footer.innerHTML = html)
  }

})