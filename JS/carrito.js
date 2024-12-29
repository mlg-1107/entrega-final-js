// Obtener el carrito desde localStorage o inicializarlo vacío
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para mostrar mensajes en un área de errores del DOM
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.textContent = message;
    }
}

// Asegurarse de que el carrito contiene solo productos válidos
function validateCart(cart) {
    return Array.isArray(cart) && cart.every(item => {
        return item && item.id && item.price && typeof item.quantity === 'number';
    });
}

if (!validateCart(cart)) {
    showError('Carrito inválido en localStorage, se reinicia.');
    cart = [];  // Reiniciar el carrito si los datos son inválidos
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalQuantity = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        cartCount.textContent = totalQuantity;
    }
}

// Función para crear un elemento de imagen
function createImageElement(product) {
    if (!product.img) {
        showError('Producto sin imagen: ' + JSON.stringify(product));
        return null;
    }
    const itemImg = document.createElement('img');
    itemImg.src = product.img;
    itemImg.alt = product.title || 'Producto sin título';
    itemImg.classList.add('cart-item-img');
    return itemImg;
}

// Función para crear el título de un producto
function createTitleElement(product) {
    const itemTitle = document.createElement('h3');
    itemTitle.textContent = product.title || 'Sin título';
    return itemTitle;
}

// Función para crear el precio de un producto
function createPriceElement(product) {
    const itemPrice = document.createElement('p');
    if (product.price && typeof product.price === 'number') {
        itemPrice.textContent = `$${product.price.toFixed(2)} c/u`;
    } else {
        showError('Producto sin precio válido: ' + JSON.stringify(product));
        itemPrice.textContent = 'Precio no disponible';
    }
    return itemPrice;
}

// Función para crear un botón de cantidad
function createQuantityButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('btn', 'btn-secondary');
    button.addEventListener('click', onClick);
    return button;
}

// Función para crear la visualización de la cantidad
function createQuantityDisplay(quantity) {
    const quantityDisplay = document.createElement('span');
    quantityDisplay.textContent = quantity;
    quantityDisplay.classList.add('quantity-display');
    return quantityDisplay;
}

// Función para crear el contenedor de la cantidad
function createQuantityContainer(product, index) {
    const quantityContainer = document.createElement('div');
    quantityContainer.classList.add('quantity-container');

    const decreaseButton = createQuantityButton('-', () => updateQuantity(index, -1));
    const quantityDisplay = createQuantityDisplay(product.quantity);
    const increaseButton = createQuantityButton('+', () => updateQuantity(index, 1));

    quantityContainer.appendChild(decreaseButton);
    quantityContainer.appendChild(quantityDisplay);
    quantityContainer.appendChild(increaseButton);

    return quantityContainer;
}

// Función para crear el botón de eliminar
function createRemoveButton(index) {
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Eliminar';
    removeButton.classList.add('btn', 'btn-danger');
    removeButton.addEventListener('click', () => removeFromCart(index));
    return removeButton;
}

// Función para crear el elemento completo de un artículo en el carrito
function createCartItemElement(product, index) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');

    // Validar que el producto tiene las propiedades necesarias
    if (!product || !product.id || !product.title || !product.price || !product.quantity) {
        showError('Producto incompleto: ' + JSON.stringify(product));
        return null;  // No se renderiza si el producto es inválido
    }

    cartItem.appendChild(createImageElement(product));
    cartItem.appendChild(createTitleElement(product));
    cartItem.appendChild(createPriceElement(product));
    cartItem.appendChild(createQuantityContainer(product, index));
    cartItem.appendChild(createRemoveButton(index));

    return cartItem;
}

// Función para actualizar el total del carrito
function updateTotalDisplay(total) {
    const totalContainer = document.getElementById('cart-total');
    if (totalContainer) {
        totalContainer.textContent = `Total: $${total.toFixed(2)}`;
    }
}

// Función para renderizar el carrito en el DOM
function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const errorContainer = document.getElementById('error-container');

    if (!cartContainer) {
        if (errorContainer) {
            errorContainer.textContent = 'Error: No se encontró el contenedor del carrito.';
        }
        return;
    }

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>No tenés productos seleccionados.</p>';
        return;
    }

    let total = 0;

    cart.forEach((product, index) => {
        const cartItem = createCartItemElement(product, index);
        if (cartItem) {
            cartContainer.appendChild(cartItem);
            total += product.price * product.quantity;
        }
    });

    updateTotalDisplay(total);
    addActionButtons();
}

// Función para agregar un producto al carrito
function addToCart(product) {
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }

    // Evitar actualizaciones innecesarias si el carrito no cambia
    if (validateCart(cart)) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    } else {
        showError('El carrito contiene productos inválidos.');
    }
}

// Función para actualizar la cantidad de un producto
function updateQuantity(index, change) {
    if (cart[index] && typeof cart[index].quantity === 'number') {
        cart[index].quantity = Math.max(1, cart[index].quantity + change);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    } else {
        showError('Producto no válido al actualizar la cantidad: ' + JSON.stringify(cart[index]));
    }
}

// Función para eliminar un producto del carrito
function removeFromCart(index) {
    if (cart[index]) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    } else {
        showError('Intento de eliminar un producto no válido: ' + index);
    }
}

// Función para limpiar todo el carrito
function clearCart() {
    cart.length = 0;
    localStorage.removeItem('cart');
    renderCart();
    updateCartCount();

    const totalContainer = document.getElementById('cart-total');
    if (totalContainer) {
        totalContainer.textContent = '';
    }
}

// Función para procesar el pago y mostrar el mensaje de agradecimiento en el carrito
function processPayment() {
    const cartContainer = document.getElementById('cart-container');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>El carrito está vacío. Agrega productos antes de proceder al pago.</p>';
    } else {
        cart.length = 0;
        localStorage.removeItem('cart');
        cartContainer.innerHTML = `
            <h2>¡Gracias por tu compra!</h2>
            <h2>En pocos días recibirás tu pedido.</h2>
            <iframe src="https://giphy.com/embed/5GoVLqeAOo6PK" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
        `;
        
        const totalContainer = document.getElementById('cart-total');
        if (totalContainer) {
            totalContainer.textContent = '';
        }
    }
}

// Función para agregar botones de acción (eliminar todo y pagar)
function addActionButtons() {
    const cartActions = document.getElementById('cart-actions');
    if (!cartActions) return;

    cartActions.innerHTML = '';

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Eliminar todos';
    clearButton.classList.add('btn', 'btn-warning');
    clearButton.addEventListener('click', clearCart);

    const payButton = document.createElement('button');
    payButton.textContent = 'Pagar';
    payButton.classList.add('btn', 'btn-success');
    payButton.addEventListener('click', processPayment);

    cartActions.appendChild(clearButton);
    cartActions.appendChild(payButton);
}

// Inicialización del carrito en la carga de la página
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartCount();
});
