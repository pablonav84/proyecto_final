const agregar=async(pid)=>{
    console.log(pid)
    let h3Usuario=document.getElementById("h3Usuario")
    let cid=h3Usuario.dataset.carrito
    
    let respuesta=await fetch(`/api/carritos/${cid}/producto/${pid}`,{
        method:"put"
    })
    let datos=await respuesta.json()
    Swal.fire({
        position: "top-end",
        title: "✔ Producto Agregado Al Carrito Exitosamente",
        showConfirmButton: false,
        timer: 1500
      });
}