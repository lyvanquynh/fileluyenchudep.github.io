function loadComponent(url, elementId){
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById(elementId).innerHTML = html
    })
}

document.addEventListener("DOMContentLoaded",function(){

  if(document.getElementById("header")){
    loadComponent("/components/header.html","header")
  }

})