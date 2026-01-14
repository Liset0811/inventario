const tableBody = document.getElementById("tableBody");
const cardView = document.getElementById("cardView");
const toggleView = document.getElementById("toggleView");

const modal = document.getElementById("modal");
const modalNombre = document.getElementById("modalNombre");
const modalCategoria = document.getElementById("modalCategoria");
const modalNecesarios = document.getElementById("modalNecesarios");
const modalDisponibles = document.getElementById("modalDisponibles");
const modalImagen = document.getElementById("modalImagen");

const saveModal = document.getElementById("saveModal");
const cancelModal = document.getElementById("cancelModal");
const closeModalBtn = document.getElementById("closeModal");
const addItem = document.getElementById("addItem");
const searchInput = document.getElementById("searchInput");

const modalTitle = document.getElementById("modalTitle");

let inventory = [];
let editIndex = null;
let isTable = true;

/* ================= RENDER TABLA ================= */
function renderTable(data) {
  tableBody.innerHTML = "";

  data.forEach((item, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>
          ${item.imagen ? `<img src="${item.imagen}" class="table-img">` : '-'}
        </td>
        <td>${item.nombre}</td>
        <td>${item.categoria}</td>
        <td>${item.necesarios}</td>
        <td>${item.disponibles}</td>
        <td>${item.fecha}</td>
        <td class="actions-cell">
          <span class="edit-text" onclick="editItem(${index})">Editar</span>
          <span class="delete-text" onclick="deleteItem(${index})">Eliminar</span>
        </td>
      </tr>
    `;
  });
}

/* ================= RENDER TARJETAS ================= */
function renderCards(data) {
  cardView.innerHTML = "";

  data.forEach((item, index) => {
    cardView.innerHTML += `
      <div class="card">
        ${item.imagen
          ? `<img src="${item.imagen}" class="img-card">`
          : `<div class="no-img-card">Sin imagen</div>`
        }

        <h3>${item.nombre}</h3>
        <p><strong>Categoría:</strong> ${item.categoria}</p>
        <p><strong>Necesarios:</strong> ${item.necesarios}</p>
        <p><strong>Disponibles:</strong> ${item.disponibles}</p>
        <p><strong>Fecha:</strong> ${item.fecha}</p>

        <div class="card-actions">
          <button class="btn orange" onclick="editItem(${index})">Editar</button>
          <button class="btn red" onclick="deleteItem(${index})">Eliminar</button>
        </div>
      </div>
    `;
  });
}

/* ================= AGREGAR ================= */
addItem.onclick = () => {
  editIndex = null;
  modalNombre.value = "";
  modalCategoria.value = ""; // ✅ limpiar categoría
  modalNecesarios.value = 0;
  modalDisponibles.value = 0;
  modalImagen.value = "";
  modalTitle.textContent = "Nuevo Artículo";
  modal.classList.remove("hidden");
};

/* ================= GUARDAR ================= */
saveModal.onclick = () => {
  const nombre = modalNombre.value.trim();
  const categoria = modalCategoria.value.trim(); // ✅ categoría

  if (!nombre) {
    alert("Nombre obligatorio");
    return;
  }

  const item = {
    nombre,
    categoria,
    necesarios: modalNecesarios.value,
    disponibles: modalDisponibles.value,
    fecha: new Date().toLocaleDateString(),
    imagen: modalImagen.files[0]
      ? URL.createObjectURL(modalImagen.files[0])
      : null
  };

  if (editIndex !== null) {
    inventory[editIndex] = item;
    editIndex = null;
  } else {
    inventory.push(item);
  }

  renderTable(inventory);
  renderCards(inventory);
  closeModal();
};

/* ================= EDITAR ================= */
function editItem(index) {
  editIndex = index;
  const item = inventory[index];
  modalNombre.value = item.nombre;
  modalCategoria.value = item.categoria || ""; // ✅ mostrar categoría
  modalNecesarios.value = item.necesarios;
  modalDisponibles.value = item.disponibles;
  modalTitle.textContent = "Editar Artículo";
  modal.classList.remove("hidden");
}

/* ================= ELIMINAR ================= */
function deleteItem(index) {
  if (confirm("¿Eliminar este artículo?")) {
    inventory.splice(index, 1);
    renderTable(inventory);
    renderCards(inventory);
  }
}

/* ================= BUSCAR ================= */
searchInput.oninput = () => {
  const value = searchInput.value.toLowerCase();
  const filtered = inventory.filter(i =>
    i.nombre.toLowerCase().includes(value)
  );
  renderTable(filtered);
  renderCards(filtered);
};

/* ================= CAMBIAR VISTA ================= */
toggleView.onclick = () => {
  isTable = !isTable;
  document.getElementById("tableView").style.display = isTable ? "block" : "none";
  cardView.classList.toggle("hidden");
  toggleView.textContent = isTable ? "☷ Vista Tarjetas" : "☷ Vista Tabla";
};

/* ================= CERRAR MODAL ================= */
function closeModal() {
  modal.classList.add("hidden");
}

cancelModal.onclick = closeModal;

/* ================= import ================= */
const importCSV = document.getElementById("importCSV");

importCSV.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    parseCSV(text);
  };
  reader.readAsText(file);
});

function parseCSV(csvText) {
  // Separar filas
  const rows = csvText.split("\n").filter(r => r.trim() !== "");
  
  rows.forEach(row => {
    // Separar columnas por coma
    const [nombre, categoria, necesarios, disponibles, fecha, imagen] = row.split(",");

    const item = {
      nombre: nombre || "",
      categoria: categoria || "",
      necesarios: Number(necesarios) || 0,
      disponibles: Number(disponibles) || 0,
      fecha: fecha || new Date().toLocaleDateString(),
      imagen: imagen || null
    };

    inventory.push(item);
  });

  renderTable(inventory);
  renderCards(inventory);
}


exportCSV.addEventListener("click", () => {
  if (inventory.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  const headers = ["Nombre","Categoría","Necesarios","Disponibles","Fecha","Imagen"];

  const rows = inventory.map(item => [
    item.nombre,
    item.categoria,
    item.necesarios,
    item.disponibles,
    item.fecha,
    item.imagen || ""  // Base64
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.map(v => `"${v}"`).join(",")) // encierra cada valor en comillas
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `inventario_${new Date().toLocaleDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
