import { loginUser, registerUser, fetchItems, createItem, updateItem, deleteItem, uploadFile } from './api.js';

const app = document.getElementById('app');

const state = {
    token: localStorage.getItem('inventoria_token'),
    userEmail: localStorage.getItem('inventoria_email'),
    items: [],
    editItemId: null,
    lastSearch: '',
    lastSortBy: 'created',
    lastSortOrder: 'asc',
};

function saveAuth(token, email) {
    localStorage.setItem('inventoria_token', token);
    localStorage.setItem('inventoria_email', email);
    state.token = token;
    state.userEmail = email;
}

function clearAuth() {
    localStorage.removeItem('inventoria_token');
    localStorage.removeItem('inventoria_email');
    state.token = null;
    state.userEmail = null;
}

function setTitle(text) {
    document.title = `${text} | Inventoria`;
}

function renderHeader() {
    return `
        <div class="header">
            <div class="brand">Inventoria</div>
            <div class="profile-row">
                ${state.userEmail ? `<span class="small-badge">${state.userEmail}</span>` : ''}
                ${state.userEmail ? '<button class="secondary" id="logoutBtn">Logout</button>' : ''}
            </div>
        </div>
    `;
}

function showAlert(message, type = 'info') {
    return `<div class="alert ${type === 'error' ? 'error' : ''}">${message}</div>`;
}

function renderLoginForm() {
    setTitle('Login');
    app.innerHTML = `
        ${renderHeader()}
        <div class="card">
            <h2>Login</h2>
            <div id="loginAlert"></div>
            <div class="form-grid">
                <input id="email" type="email" placeholder="Email" autocomplete="username" />
                <input id="password" type="password" placeholder="Password" autocomplete="current-password" />
                <button id="loginBtn">Sign In</button>
                <button id="showRegisterBtn" class="secondary">Create account</button>
            </div>
        </div>
    `;

    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('showRegisterBtn').addEventListener('click', () => {
        window.location.hash = '#register';
        renderRegisterForm();
    });
}

function renderRegisterForm() {
    setTitle('Register');
    app.innerHTML = `
        ${renderHeader()}
        <div class="card">
            <h2>Create your account</h2>
            <div id="registerAlert"></div>
            <div class="form-grid">
                <input id="username" type="text" placeholder="Username" autocomplete="username" />
                <input id="email" type="email" placeholder="Email" autocomplete="email" />
                <input id="fullName" type="text" placeholder="Full name" autocomplete="name" />
                <input id="password" type="password" placeholder="Password" autocomplete="new-password" />
                <button id="registerBtn">Register</button>
                <button id="showLoginBtn" class="secondary">Back to Login</button>
            </div>
        </div>
    `;

    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('showLoginBtn').addEventListener('click', () => {
        window.location.hash = '#login';
        renderLoginForm();
    });
}

function renderDashboard() {
    setTitle('Inventory Dashboard');
    const itemsHtml = state.items.length
        ? state.items.map(renderItemCard).join('')
        : '<p>No inventory items yet. Add one to get started.</p>';

    app.innerHTML = `
        ${renderHeader()}
        <div class="card">
            <div class="inline-row" style="justify-content:space-between; gap:12px;">
                <div>
                    <h2>Inventory</h2>
                    <p class="small-badge">${state.items.length} items</p>
                </div>
                <div class="inline-row">
                    <input id="globalSearch" type="search" placeholder="Search items" value="${state.lastSearch}" />
                    <select id="sortBy">
                        <option value="created" ${state.lastSortBy === 'created' ? 'selected' : ''}>Newest</option>
                        <option value="name" ${state.lastSortBy === 'name' ? 'selected' : ''}>Name</option>
                        <option value="price" ${state.lastSortBy === 'price' ? 'selected' : ''}>Price</option>
                        <option value="quantity" ${state.lastSortBy === 'quantity' ? 'selected' : ''}>Quantity</option>
                    </select>
                    <select id="sortOrder">
                        <option value="asc" ${state.lastSortOrder === 'asc' ? 'selected' : ''}>Asc</option>
                        <option value="desc" ${state.lastSortOrder === 'desc' ? 'selected' : ''}>Desc</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="card">
            <h2>${state.editItemId ? 'Edit inventory item' : 'Add new item'}</h2>
            <div id="formAlert"></div>
            <div class="form-grid">
                <input id="itemName" placeholder="Item name" />
                <input id="itemCategory" placeholder="Category" />
                <input id="itemQuantity" type="number" placeholder="Quantity" />
                <input id="itemUnit" placeholder="Unit (pcs, kg, set)" />
                <input id="itemPrice" type="number" step="0.01" placeholder="Price" />
                <input id="itemLocation" placeholder="Location" />
                <input id="itemCondition" placeholder="Condition" />
                <input id="itemSku" placeholder="SKU" />
                <input id="itemPurchaseDate" type="date" placeholder="Purchase date" />
                <textarea id="itemDescription" placeholder="Description"></textarea>
                <input id="itemImage" type="file" accept="image/*" />
                <button id="saveItemBtn">${state.editItemId ? 'Save changes' : 'Add item'}</button>
            </div>
        </div>
        <div class="card">
            <h2>Your inventory</h2>
            <div id="inventoryList">${itemsHtml}</div>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearAuth();
        renderLoginForm();
    });
    document.getElementById('globalSearch').addEventListener('change', handleSearch);
    document.getElementById('sortBy').addEventListener('change', handleSort);
    document.getElementById('sortOrder').addEventListener('change', handleSort);
    document.getElementById('saveItemBtn').addEventListener('click', handleSaveItem);
    document.querySelectorAll('.edit-item-btn').forEach((btn) => btn.addEventListener('click', handleEditItem));
    document.querySelectorAll('.delete-item-btn').forEach((btn) => btn.addEventListener('click', handleDeleteItem));
}

function renderItemCard(item) {
    const rawImageUrl = Array.isArray(item.imageUrls) && item.imageUrls.length ? item.imageUrls[0] : null;
    const imageUrl = rawImageUrl
        ? rawImageUrl.startsWith('/')
            ? `http://localhost:8080${rawImageUrl}`
            : rawImageUrl
        : null;

    const imageHtml = imageUrl
        ? `<img src="${imageUrl}" alt="${item.name}" style="max-width:100%; border-radius:16px; margin-top:12px;" />`
        : '';

    return `
        <article class="item-card">
            <div class="item-meta"><strong>${item.name}</strong></div>
            <div class="item-meta">
                <span>${item.category || 'Uncategorized'}</span>
                <span>${item.quantity ?? 0} ${item.unit || ''}</span>
                <span>${item.price != null ? '$' + item.price.toFixed(2) : 'No price'}</span>
            </div>
            <p>${item.description || 'No description'}</p>
            ${imageHtml}
            <div class="item-meta">
                <span>${item.location || 'Location unknown'}</span>
                <span>${item.condition || 'Condition unknown'}</span>
                <span>${item.sku ? 'SKU: ' + item.sku : ''}</span>
            </div>
            <div class="item-actions">
                <button class="secondary edit-item-btn" data-id="${item.id}">Edit</button>
                <button class="danger delete-item-btn" data-id="${item.id}">Delete</button>
            </div>
        </article>
    `;
}

function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const alertEl = document.getElementById('loginAlert');
    alertEl.innerHTML = '';

    loginUser({ email, password })
        .then((data) => {
            saveAuth(data.token, data.email);
            state.editItemId = null;
            return loadDashboard();
        })
        .catch((err) => {
            alertEl.innerHTML = showAlert(err.message, 'error');
        });
}

function handleRegister() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const password = document.getElementById('password').value;
    const alertEl = document.getElementById('registerAlert');
    alertEl.innerHTML = '';

    registerUser({ username, email, fullName, password })
        .then(() => {
            alertEl.innerHTML = showAlert('Registration successful! Please sign in.');
        })
        .catch((err) => {
            alertEl.innerHTML = showAlert(err.message, 'error');
        });
}

function handleSaveItem() {
    const payload = gatherItemForm();
    const alertEl = document.getElementById('formAlert');
    alertEl.innerHTML = '';

    const imageInput = document.getElementById('itemImage');
    const file = imageInput.files?.[0];

    const save = (itemPayload) => {
        const action = state.editItemId ? updateItem(state.editItemId, itemPayload) : createItem(itemPayload);
        action.then(() => {
            state.editItemId = null;
            loadDashboard();
        }).catch((err) => {
            alertEl.innerHTML = showAlert(err.message, 'error');
        });
    };

    if (file) {
        uploadFile(file)
            .then((data) => {
                payload.imageUrls = [data.url];
                save(payload);
            })
            .catch((err) => {
                alertEl.innerHTML = showAlert(err.message, 'error');
            });
    } else {
        save(payload);
    }
}

function gatherItemForm() {
    return {
        name: document.getElementById('itemName').value.trim(),
        category: document.getElementById('itemCategory').value.trim(),
        quantity: Number(document.getElementById('itemQuantity').value) || 0,
        unit: document.getElementById('itemUnit').value.trim(),
        price: Number(document.getElementById('itemPrice').value) || 0,
        location: document.getElementById('itemLocation').value.trim(),
        condition: document.getElementById('itemCondition').value.trim(),
        sku: document.getElementById('itemSku').value.trim(),
        purchaseDate: document.getElementById('itemPurchaseDate').value || null,
        description: document.getElementById('itemDescription').value.trim(),
    };
}

function handleEditItem(event) {
    const itemId = event.target.dataset.id;
    const item = state.items.find((item) => item.id === itemId);
    if (!item) return;

    state.editItemId = itemId;
    renderDashboard();

    document.getElementById('itemName').value = item.name || '';
    document.getElementById('itemCategory').value = item.category || '';
    document.getElementById('itemQuantity').value = item.quantity || 0;
    document.getElementById('itemUnit').value = item.unit || '';
    document.getElementById('itemPrice').value = item.price || 0;
    document.getElementById('itemLocation').value = item.location || '';
    document.getElementById('itemCondition').value = item.condition || '';
    document.getElementById('itemSku').value = item.sku || '';
    document.getElementById('itemPurchaseDate').value = item.purchaseDate ? item.purchaseDate.split('T')[0] : '';
    document.getElementById('itemDescription').value = item.description || '';
}

function handleDeleteItem(event) {
    const itemId = event.target.dataset.id;
    deleteItem(itemId)
        .then(() => loadDashboard())
        .catch((err) => {
            const alertEl = document.getElementById('formAlert');
            if (alertEl) alertEl.innerHTML = showAlert(err.message, 'error');
        });
}

function handleSearch(event) {
    state.lastSearch = event.target.value.trim();
    loadDashboard();
}

function handleSort() {
    state.lastSortBy = document.getElementById('sortBy').value;
    state.lastSortOrder = document.getElementById('sortOrder').value;
    loadDashboard();
}

function loadDashboard() {
    if (!state.token) {
        renderLoginForm();
        return;
    }
    fetchItems(state.lastSearch, null, state.lastSortBy, state.lastSortOrder)
        .then((items) => {
            state.items = items;
            renderDashboard();
        })
        .catch((err) => {
            clearAuth();
            renderLoginForm();
        });
}

function bootstrap() {
    if (state.token) {
        loadDashboard();
    } else {
        renderLoginForm();
    }
}

window.addEventListener('hashchange', () => {
    if (window.location.hash === '#register') {
        renderRegisterForm();
    } else if (state.token) {
        loadDashboard();
    } else {
        renderLoginForm();
    }
});

bootstrap();
