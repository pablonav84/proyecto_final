const premium = async (id) => {

    let respuesta=await fetch(`/api/usuarios/premium/${id}`,{
        method:"put"
    })
    let data = await respuesta.json();
   
      if (respuesta.status === 200) {
        document.getElementById("mensaje").innerHTML = `<span style="color: green;">${data}</span>`;
        setTimeout(() => {
            window.location.href = "/home"; 
          }, 2000); 
      } else if (respuesta.status === 400) {
        document.getElementById("mensaje").innerHTML = `<span style="color: red;">${data.message}</span>`;
      }
  };