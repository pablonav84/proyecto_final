let divMensaje = document.getElementById("mensaje")
let divError = document.getElementById("error")

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const mensaje = urlParams.get('mensaje');
const error = urlParams.get('error');

if(mensaje!==null){
    divMensaje.innerHTML=mensaje+"<br><br>"
    divMensaje.style.color="green"
    divMensaje.style.fontFamily="Arial"
    divMensaje.style.fontWeight="bold"
}

if(error!==null){
    divError.innerHTML=error+"<br><br>"
    divError.style.color="red"
    divError.style.fontFamily="Arial"
    divError.style.fontWeight="bold"
}