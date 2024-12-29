// Función para mostrar mensajes de error en un área del DOM
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.textContent = message;
    }
}

// Función para cargar los productos desde el archivo JSON
function fetchProducts() {
    return fetch('/JSON/productos.json')
        .then(response => {
            // Verificar si la respuesta es correcta (código 2xx)
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
            }
            return response.json();
        })
        .catch(error => {
            showError("Error de red al obtener los productos: " + error.message);
            return [];  // Retornar un array vacío en caso de error para evitar que el flujo de ejecución falle
        });
}

// Función para crear la tarjeta de un producto
function createProductCard(product) {
    if (!product || typeof product !== 'object') {
        showError('Producto inválido: ' + JSON.stringify(product));
        return null;
    }

    // Validar las propiedades necesarias del producto
    const { img, title, price } = product;
    if (!img || !title || !price || typeof price !== 'number') {
        showError('Producto incompleto o con datos inválidos: ' + JSON.stringify(product));
        return null;
    }

    const card = document.createElement('div');
    card.classList.add('product-card');

    const imageElement = document.createElement('img');
    imageElement.src = img;
    imageElement.alt = title;

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;

    const priceElement = document.createElement('p');
    priceElement.classList.add('price');
    priceElement.textContent = `$${price.toFixed(2)}`;

    const button = document.createElement('button');
    button.textContent = "Comprar";
    button.classList.add('btn', 'btn-primary');
    button.addEventListener('click', () => addToCart(product));

    card.appendChild(imageElement);
    card.appendChild(titleElement);
    card.appendChild(priceElement);
    card.appendChild(button);

    return card;
}

// Función para mostrar los productos en el contenedor
function displayProducts(products) {
    const container = document.getElementById('product-container');
    
    // Verificar que products sea un array válido
    if (!Array.isArray(products) || products.length === 0) {
        showError('No hay productos para mostrar o la respuesta no es un array: ' + JSON.stringify(products));
        return;
    }

    products.forEach(product => {
        const card = createProductCard(product);
        if (card) {
            container.appendChild(card);
        }
    });
}

// Función principal que carga los productos y los muestra en pantalla
function loadProducts() {
    fetchProducts()
        .then(products => {
            // Asegurarse de que los productos recibidos son válidos antes de mostrarlos
            if (Array.isArray(products) && products.length > 0) {
                displayProducts(products);
            } else {
                showError("No se cargaron productos válidos.");
            }
        })
        .catch(error => showError("Error al cargar productos: " + error.message));
}

// Llamada inicial para cargar los productos
loadProducts();
