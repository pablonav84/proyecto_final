const obtenerCarrito = async (cid) => {
    const respuesta = await fetch(`/api/carritos/${cid}`);
    const datos = await respuesta.json();
    return datos;
  };

const comprar = async (cid) => {
    const carrito = await obtenerCarrito(cid);
    
    if (carrito.carrito.items.length === 0) {
      Swal.fire({
           position: "top-end",
           title: "❌ El carrito está vacío.",
           showConfirmButton: false,
           timer: 1500
         });
         return;
     }
      const respuesta=await fetch(`/api/carritos/${cid}/purchase`,{
          method:"put"
      })
      const datos=await respuesta.json()
  if (datos.success == false && respuesta.status == 200){
      Swal.fire({
    title: "¿Desea Continuar?",
    text: "Algunos productos no podrán ser procesados por falta de stock",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, Continuar"
  }).then((result) => {
    if (result.isConfirmed) {
     window.location.href = "/pago";
    } else {
            window.location.reload();
          }
  });
  }else if (respuesta.status !== 200){
          Swal.fire({
              position: "top-end",
              title: "❌ Error al finalizar la compra. No hay stock disponible",
              showConfirmButton: false,
              timer:  1500
          });
          return;
      } else {
      
      Swal.fire({
          position: "top-end",
          title: "✔ Será redirigido para finalizar su compra",
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => {
          window.location.href = "/pago";
        }, 2000);
    }
  };
  
  const eliminarProducto = async (pid) => {
  
    const id=document.getElementById("cart")
    const cid=cart.dataset.carrito
  
    const respuesta = await fetch(`/api/carritos/delete/${cid}/${pid}`, {
      method: "delete"
    });
    if (respuesta.status === 200) {
      
      Swal.fire({
        position: "top-end",
        title: "✔ Producto eliminado",
        showConfirmButton: false,
        timer: 1500
      });
      setTimeout(() => {
  window.location.reload();
      }, 1600)
    }
  };