const cargarMedios = async () => {
    let importe = parseFloat(document.getElementById("importe").value)
    

    const mp = new MercadoPago('APP_USR-e302354a-a3d7-4fed-8665-fd0178bba4ac', {
        locale: 'es-AR' // The most common are: 'pt-BR', 'es-AR' and 'en-US'
    });


    let respuesta = await fetch(`/api/pagar`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ importe })
    })
    let datos = await respuesta.json()

    let id = datos.id

    const bricksBuilder = mp.bricks();

    bricksBuilder.create("wallet", "wallet_container", {
        initialization: {
            // preferenceId: "<PREFERENCE_ID>",
            preferenceId: id,
        },
        customization: {
            texts: {
                valueProp: 'smart_option',
            },
        },
        callbacks: {
            onError: (error) => console.error(error),
            onReady: () => { }
        }
    });


}