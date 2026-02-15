const reportesURL = "http://localhost:3001/reportes";

// GET
async function getReportes() {
    const res = await fetch(reportesURL);
    return await res.json();
}

// POST
async function postReporte(reporte) {
    const res = await fetch(reportesURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reporte)
    });
    return await res.json();
}

// PATCH (solo estado)
async function patchReporte(nuevoEstado, id) {
    const res = await fetch(`${reportesURL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
    });
    return await res.json();
}

// DELETE
async function deleteReporte(id) {
    await fetch(`${reportesURL}/${id}`, {
        method: "DELETE"
    });
}

export {
    getReportes,
    postReporte,
    patchReporte,
    deleteReporte
};
