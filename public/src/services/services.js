//GET USUARIOS funcion que consulta al endpoint a traves de un fetch,conuslta al API al Endpoint


async function getUsuarios() {

    try {

        const respuestaServidor = await fetch("http://localhost:3001/usuarios")


        const datosUsuarios = await respuestaServidor.json();


        return datosUsuarios;

    } catch (error) {

        console.error("Error al obtener los usuarios", error);
    }


}

export { getUsuarios }



//POST USUARIOS AQUI S EVA A CREAR LA FUNCION PARA GUARDAR UN NUEVO USUARIO


async function postUsuarios(usuario) {

    try {

        const respuesta = await fetch("http://localhost:3001/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)

        })

        const datosUsuarios = await respuesta.json();

        return datosUsuarios;

    } catch (error) {

        console.error("Error al obtener los usuarios", error);
    }



}

export { postUsuarios }


//PATCH


async function patchUsuarios(usuario, id) {

    try {

        const respuesta = await fetch("http://localhost:3001/usuarios/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)

        })

        const datosUsuarios = await respuesta.json();

        return datosUsuarios;

    } catch (error) {

        console.error("Error al actualizar los cambios", error);
    }
}

export { patchUsuarios }








//DELETE



async function deleteUsuarios(id) {

    try {

        const respuesta = await fetch("http://localhost:3001/usuarios/" + id, {
            method: "DELETE",
        })

        const datosUsuarios = await respuesta.json();

        return datosUsuarios;

    } catch (error) {

        console.error("Error al Eliminar el registro", error);
    }
}

export { deleteUsuarios }


// ---------------------------------------------------------
// CRUD REPORTES (Basado en el CRUD de Usuarios)
// ---------------------------------------------------------

//GET REPORTES

async function getReportes() {

    try {

        const respuestaServidor = await fetch("http://localhost:3001/publicaciones")


        const datosReportes = await respuestaServidor.json();


        return datosReportes;

    } catch (error) {

        console.error("Error al obtener los reportes", error);
    }


}

export { getReportes }



//POST REPORTES


async function postReportes(reporte) {

    try {

        const respuesta = await fetch("http://localhost:3001/publicaciones", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reporte)

        })

        const datosReportes = await respuesta.json();

        return datosReportes;

    } catch (error) {

        console.error("Error al crear el reporte", error);
    }



}

export { postReportes }


//PATCH REPORTES


async function patchReportes(reporte, id) {

    try {

        const respuesta = await fetch("http://localhost:3001/publicaciones/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reporte)

        })

        const datosReportes = await respuesta.json();

        return datosReportes;

    } catch (error) {

        console.error("Error al actualizar el reporte", error);
    }
}

export { patchReportes }








//DELETE REPORTES



async function deleteReportes(id) {

    try {

        const respuesta = await fetch("http://localhost:3001/publicaciones/" + id, {
            method: "DELETE",
        })

        const datosReportes = await respuesta.json();

        return datosReportes;

    } catch (error) {

        console.error("Error al Eliminar el reporte", error);
    }
}

export { deleteReportes }

////////////////////////////////////////Para la función de planillas/////////////////////////////////////////////////////
//GET planillas
async function getPlanillas() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/planillas")
        const datosPlanillas = await respuestaServidor.json();
        return datosPlanillas;
    } catch (error) {
        console.error("Error al obtener las planillas", error);
    }
}

export { getPlanillas }

//POST planillas
async function postPlanillas(planilla) {
    try {
        const respuesta = await fetch("http://localhost:3001/planillas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(planilla)
        })

        const datosPlanillas = await respuesta.json();
        return datosPlanillas;
    } catch (error) {

        console.error("Error al crear la planilla", error);
    }

}

export { postPlanillas }


async function patchPlanillas(planilla, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/planillas/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(planilla)
        })
        const datosPlanillas = await respuesta.json();
        return datosPlanillas;
    } catch (error) {

        console.error("Error al actualizar la planilla", error);
    }
}

export { patchPlanillas }


async function deletePlanillas(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/planillas/" + id, {
            method: "DELETE",
        })
        const datosPlanillas = await respuesta.json();
        return datosPlanillas;
    } catch (error) {

        console.error("Error al Eliminar la planilla", error);
    }
}
export { deletePlanillas }

// GET usuarios_planillas
async function getUsuariosPlanillas() {
    try {
        const respuesta = await fetch("http://localhost:3001/usuarios_planillas");
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener usuarios_planillas", error);
    }
}

// POST usuarios_planillas
async function postUsuariosPlanillas(data) {
    try {
        const respuesta = await fetch("http://localhost:3001/usuarios_planillas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear usuario_planilla", error);
    }
}

// PATCH usuarios_planillas
async function patchUsuariosPlanillas(data, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/usuarios_planillas/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar usuario_planilla", error);
    }
}

// DELETE usuarios_planillas
async function deleteUsuariosPlanillas(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/usuarios_planillas/" + id, {
            method: "DELETE"
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar usuario_planilla", error);
    }
}

// GET historial_pago_Planillas
async function getHistorialPagos() {
    try {
        const respuesta = await fetch("http://localhost:3001/historial_pago_Planillas");
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener historial_pago_Planillas", error);
    }
}

// POST historial_pago_Planillas
async function postHistorialPago(pago) {
    try {
        const respuesta = await fetch("http://localhost:3001/historial_pago_Planillas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pago)
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear historial_pago_Planillas", error);
    }
}

async function deleteHistorialPago(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/historial_pago_Planillas/" + id, {
            method: "DELETE"
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar historial_pago_Planillas", error);
    }
}

export {
    getUsuariosPlanillas,
    postUsuariosPlanillas,
    patchUsuariosPlanillas,
    deleteUsuariosPlanillas,
    getHistorialPagos,
    postHistorialPago,
    deleteHistorialPago
}
