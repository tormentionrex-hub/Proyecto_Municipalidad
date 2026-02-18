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


// ---------------------------------------------------------
// CRUD PROYECTOS VIALES
// ---------------------------------------------------------

// GET PROYECTOS
async function getProyectos() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/proyectosViales");
        const datosProyectos = await respuestaServidor.json();
        return datosProyectos;
    } catch (error) {
        console.error("Error al obtener los proyectos", error);
    }
}
export { getProyectos };

// POST PROYECTOS
async function postProyectos(proyecto) {
    try {
        const respuesta = await fetch("http://localhost:3001/proyectosViales", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(proyecto)
        });
        const datosProyectos = await respuesta.json();
        return datosProyectos;
    } catch (error) {
        console.error("Error al crear el proyecto", error);
    }
}
export { postProyectos };

// PATCH PROYECTOS
async function patchProyectos(proyecto, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/proyectosViales/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(proyecto)
        });
        const datosProyectos = await respuesta.json();
        return datosProyectos;
    } catch (error) {
        console.error("Error al actualizar el proyecto", error);
    }
}
export { patchProyectos };

// DELETE PROYECTOS
async function deleteProyectos(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/proyectosViales/" + id, {
            method: "DELETE",
        });
        const datosProyectos = await respuesta.json();
        return datosProyectos;
    } catch (error) {
        console.error("Error al eliminar el proyecto", error);
    }
}
export { deleteProyectos };


// ---------------------------------------------------------
// CRUD SERVICIOS PÚBLICOS
// ---------------------------------------------------------

// GET SERVICIOS
async function getServicios() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/serviciosPublicos");
        const datosServicios = await respuestaServidor.json();
        return datosServicios;
    } catch (error) {
        console.error("Error al obtener los servicios", error);
    }
}
export { getServicios };

// POST SERVICIOS
async function postServicios(servicio) {
    try {
        const respuesta = await fetch("http://localhost:3001/serviciosPublicos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(servicio)
        });
        const datosServicios = await respuesta.json();
        return datosServicios;
    } catch (error) {
        console.error("Error al crear el servicio", error);
    }
}
export { postServicios };

// PATCH SERVICIOS
async function patchServicios(servicio, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/serviciosPublicos/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(servicio)
        });
        const datosServicios = await respuesta.json();
        return datosServicios;
    } catch (error) {
        console.error("Error al actualizar el servicio", error);
    }
}
export { patchServicios };

// DELETE SERVICIOS
async function deleteServicios(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/serviciosPublicos/" + id, {
            method: "DELETE",
        });
        const datosServicios = await respuesta.json();
        return datosServicios;
    } catch (error) {
        console.error("Error al eliminar el servicio", error);
    }
}
export { deleteServicios };
