function eliminar(id) {
    Swal.fire({
      title: "¿Desea eliminar este producto?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/productos/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        })
          .then(function(response) {
            if (response.ok) {
              return response.json();
            } else {
              return response.json().then(function(data) {
                throw new Error(data.error);
              });
            }
          })
          .then(function(data) {
            Swal.fire("✔", "Producto Eliminado").then(() => {
              location.reload();
            });
          })
          .catch(function(error) {
            console.error(error);
            Swal.fire("❌", error.message);
          });
      }
    });
  }