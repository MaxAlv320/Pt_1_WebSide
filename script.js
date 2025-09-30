// Estado global de la aplicación
let state = {
  currentTable: null,
  currentOrder: [],
  tables: {
    1: { status: "available", order: null },
    2: {
      status: "occupied",
      order: {
        items: [
          { name: "Pasta Carbonara", price: 18.0, quantity: 1 },
          { name: "Ensalada César", price: 12.0, quantity: 1 },
          { name: "Agua Mineral", price: 3.0, quantity: 2 },
        ],
        startTime: new Date(),
      },
    },
    3: { status: "available", order: null },
    4: { status: "available", order: null },
  },
};

// Funciones del Modal
function openOrderModal(tableNumber) {
  state.currentTable = tableNumber;
  state.currentOrder = [];
  document.getElementById("modalTableNumber").textContent = tableNumber;
  document.getElementById("orderModal").style.display = "block";
  updateOrderDisplay();
}

function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none";
  state.currentOrder = [];
}

function addToOrder(itemName, price) {
  const existingItem = state.currentOrder.find(
    (item) => item.name === itemName
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.currentOrder.push({
      name: itemName,
      price: price,
      quantity: 1,
    });
  }

  updateOrderDisplay();
}

function updateOrderDisplay() {
  const orderItems = document.getElementById("currentOrderItems");
  const orderTotal = document.getElementById("orderTotal");

  orderItems.innerHTML = "";
  let total = 0;

  state.currentOrder.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemElement = document.createElement("div");
    itemElement.className = "order-item";
    itemElement.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>$${itemTotal.toFixed(2)}</span>
        `;
    orderItems.appendChild(itemElement);
  });

  orderTotal.textContent = total.toFixed(2);
}

function confirmOrder() {
  if (state.currentOrder.length === 0) {
    alert("Por favor, añade al menos un item al pedido.");
    return;
  }

  state.tables[state.currentTable].order = {
    items: [...state.currentOrder],
    startTime: new Date(),
  };
  state.tables[state.currentTable].status = "occupied";

  alert(`Pedido confirmado para la Mesa ${state.currentTable}`);
  closeOrderModal();
  updateUI();
}

// Funciones de Gestión de Mesas
function takeTable(tableNumber) {
  state.tables[tableNumber].status = "occupied";
  state.tables[tableNumber].order = { items: [], startTime: new Date() };
  updateUI();
  alert(`Mesa ${tableNumber} ocupada. Puedes añadir pedidos.`);
}

function closeOrder(tableNumber) {
  if (
    confirm(
      `¿Estás seguro de que quieres cerrar la cuenta de la Mesa ${tableNumber}?`
    )
  ) {
    const table = state.tables[tableNumber];
    let total = 0;

    if (table.order) {
      table.order.items.forEach((item) => {
        total += item.price * item.quantity;
      });
    }

    alert(
      `Cuenta cerrada para Mesa ${tableNumber}. Total: $${total.toFixed(2)}`
    );

    state.tables[tableNumber].status = "available";
    state.tables[tableNumber].order = null;
    updateUI();
  }
}

function updateUI() {
  // Actualizar estado de las mesas en la UI
  const tableCards = document.querySelectorAll(".table-card");

  tableCards.forEach((card) => {
    const tableNumber = parseInt(card.dataset.table);
    const table = state.tables[tableNumber];
    const statusElement = card.querySelector(".status");
    const button = card.querySelector(".btn");

    // Actualizar estado
    statusElement.textContent =
      table.status === "available" ? "Disponible" : "Ocupada";
    statusElement.className = `status ${table.status}`;

    // Actualizar botón
    if (table.status === "available") {
      button.textContent = "Tomar Mesa";
      button.className = "btn take-table";
      button.onclick = () => takeTable(tableNumber);
    } else {
      button.textContent = "Añadir Pedido";
      button.className = "btn add-order";
      button.onclick = () => openOrderModal(tableNumber);
    }
  });

  // Actualizar lista de pedidos activos
  updateActiveOrders();
}

function updateActiveOrders() {
  const ordersList = document.querySelector(".orders-list");
  ordersList.innerHTML = "";

  Object.entries(state.tables).forEach(([tableNumber, table]) => {
    if (
      table.status === "occupied" &&
      table.order &&
      table.order.items.length > 0
    ) {
      const orderCard = document.createElement("div");
      orderCard.className = "order-card";

      let total = 0;
      const itemsList = table.order.items
        .map((item) => {
          const itemTotal = item.price * item.quantity;
          total += itemTotal;
          return `<li>${item.name} × ${item.quantity}</li>`;
        })
        .join("");

      const orderTime = table.order.startTime.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

      orderCard.innerHTML = `
                <div class="order-header">
                    <h3>Mesa ${tableNumber}</h3>
                    <span class="order-time">${orderTime}</span>
                </div>
                <ul class="order-items">${itemsList}</ul>
                <div class="order-total">
                    Total: $${total.toFixed(2)}
                </div>
                <button class="btn close-order" onclick="closeOrder(${tableNumber})">Cerrar Cuenta</button>
            `;

      ordersList.appendChild(orderCard);
    }
  });
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function (event) {
  const modal = document.getElementById("orderModal");
  if (event.target === modal) {
    closeOrderModal();
  }
};

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", function () {
  updateUI();
});
