// ---------------------------------------------------------
// CRUD USUARIOS
// ---------------------------------------------------------

async function getUsuarios() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/usuarios")
        return await respuestaServidor.json();
    } catch (error) {
        console.error("Error al obtener los usuarios", error);
    }
}

async function postUsuarios(usuario) {
    try {
        const respuesta = await fetch("http://localhost:3001/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        })
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear el usuario", error);
    }
}

async function patchUsuarios(usuario, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/usuarios/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        })
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar el usuario", error);
    }
}

async function deleteUsuarios(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/usuarios/" + id, {
            method: "DELETE",
        })
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar el usuario", error);
    }
}

// ---------------------------------------------------------
// CRUD REPORTES
// ---------------------------------------------------------

async function getReportes() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/publicaciones")
        return await respuestaServidor.json();
    } catch (error) {
        console.error("Error al obtener los reportes", error);
    }
}

async function postReportes(reporte) {
    try {
        const respuesta = await fetch("http://localhost:3001/publicaciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reporte)
        })
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear el reporte", error);
    }
}

async function patchReportes(reporte, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/publicaciones/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reporte)
        })
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar el reporte", error);
    }
}

async function deleteReportes(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/publicaciones/" + id, {
            method: "DELETE",
        })
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar el reporte", error);
    }
}

// ---------------------------------------------------------
// CRUD PLANILLAS
// ---------------------------------------------------------

async function getPlanillas() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/planillas")
        return await respuestaServidor.json();
    } catch (error) {
        console.error("Error al obtener las planillas", error);
    }
}

async function postPlanillas(planilla) {
    try {
        const respuesta = await fetch("http://localhost:3001/planillas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(planilla)
        })
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear la planilla", error);
    }
}

async function patchPlanillas(planilla, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/planillas/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(planilla)
        })
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar la planilla", error);
    }
}

async function deletePlanillas(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/planillas/" + id, {
            method: "DELETE",
        })
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar la planilla", error);
    }
}

// ---------------------------------------------------------
// CRUD USUARIOS_PLANILLAS (Tabla Intermedia)
// ---------------------------------------------------------

async function getUsuariosPlanillas() {
    try {
        const respuesta = await fetch("http://localhost:3001/usuarios_planillas");
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener usuarios_planillas", error);
    }
}

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

// ---------------------------------------------------------
// CRUD HISTORIAL DE PAGOS
// ---------------------------------------------------------

async function getHistorialPagos() {
    try {
        const respuesta = await fetch("http://localhost:3001/historial_pago_Planillas");
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener historial_pago_Planillas", error);
    }
}

async function postHistorialPago(pago) {
    try {
        const respuesta = await fetch("http://localhost:3001/historial_pago_Planillas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

// ---------------------------------------------------------
// CRUD PROYECTOS VIALES
// ---------------------------------------------------------

async function getProyectos() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/proyectosViales");
        return await respuestaServidor.json();
    } catch (error) {
        console.error("Error al obtener los proyectos", error);
    }
}

async function postProyectos(proyecto) {
    try {
        const respuesta = await fetch("http://localhost:3001/proyectosViales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(proyecto)
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear el proyecto", error);
    }
}

async function patchProyectos(proyecto, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/proyectosViales/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(proyecto)
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar el proyecto", error);
    }
}

async function deleteProyectos(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/proyectosViales/" + id, {
            method: "DELETE",
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar el proyecto", error);
    }
}

// ---------------------------------------------------------
// CRUD SERVICIOS PÚBLICOS
// ---------------------------------------------------------

async function getServicios() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/serviciosPublicos");
        return await respuestaServidor.json();
    } catch (error) {
        console.error("Error al obtener los servicios", error);
    }
}

async function postServicios(servicio) {
    try {
        const respuesta = await fetch("http://localhost:3001/serviciosPublicos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(servicio)
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear el servicio", error);
    }
}

async function patchServicios(servicio, id) {
    try {
        const respuesta = await fetch("http://localhost:3001/serviciosPublicos/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(servicio)
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar el servicio", error);
    }
}

async function deleteServicios(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/serviciosPublicos/" + id, {
            method: "DELETE",
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar el servicio", error);
    }
}

// ---------------------------------------------------------
// CRUD SOLICITUDES FINANCIAMIENTO
// ---------------------------------------------------------

async function getSolicitudesFinanciamiento() {
    try {
        const respuestaServidor = await fetch("http://localhost:3001/solicitud_financiamiento");
        return await respuestaServidor.json();
    } catch (error) {
        console.error("Error al obtener las solicitudes de financiamiento", error);
    }
}

async function postSolicitudesFinanciamiento(solicitud) {
    try {
        const respuesta = await fetch("http://localhost:3001/solicitud_financiamiento", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(solicitud)
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear la solicitud de financiamiento", error);
    }
}

async function patchSolicitudesFinanciamiento(solicitud, id) {
    try {
        const url = `http://localhost:3001/solicitud_financiamiento/${id}`;
        const respuesta = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(solicitud)
        });

        if (!respuesta.ok) {
            throw new Error(`Error en PATCH: ${respuesta.status} ${respuesta.statusText}`);
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar la solicitud de financiamiento", error);
        throw error; // Re-throw to handle in the UI
    }
}

async function deleteSolicitudesFinanciamiento(id) {
    try {
        const respuesta = await fetch("http://localhost:3001/solicitud_financiamiento/" + id, {
            method: "DELETE",
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar la solicitud de financiamiento", error);
    }
}

// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------

export {
    getUsuarios,
    postUsuarios,
    patchUsuarios,
    deleteUsuarios,
    getReportes,
    postReportes,
    patchReportes,
    deleteReportes,
    getPlanillas,
    postPlanillas,
    patchPlanillas,
    deletePlanillas,
    getUsuariosPlanillas,
    postUsuariosPlanillas,
    patchUsuariosPlanillas,
    deleteUsuariosPlanillas,
    getHistorialPagos,
    postHistorialPago,
    deleteHistorialPago,
    getProyectos,
    postProyectos,
    patchProyectos,
    deleteProyectos,
    getServicios,
    postServicios,
    patchServicios,
    deleteServicios,
    getSolicitudesFinanciamiento,
    postSolicitudesFinanciamiento,
    patchSolicitudesFinanciamiento,
    deleteSolicitudesFinanciamiento
};
