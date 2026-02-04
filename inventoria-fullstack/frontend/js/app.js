// Main inventory management logic
let inventory = [];
let currentFilter = 'default';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth()) return;
    
    // Display username
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('usernameDisplay').textContent = username;
    }
    
    // Load inventory
    await loadInventory();
    
    // Setup event listeners
    setupEventListeners();
});

// Load inventory from API
async function loadInventory() {
    try {
        inventory = await api.inventory.getAll();
        renderItems(currentFilter);
    } catch (error) {
        showMessageBox('Error', 'Failed to load inventory: ' + error.message, 'error');
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('opacity-100'));
            e.target.classList.add('opacity-100');
            currentFilter = e.target.dataset.filter;
            renderItems(currentFilter);
        });
    });
    
    // Set default filter as active
    document.querySelector('[data-filter="default"]').classList.add('opacity-100');
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = e.target.value.trim();
                if (query) {
                    try {
                        inventory = await api.inventory.search(query);
                        renderItems('default');
                    } catch (error) {
                        showMessageBox('Error', 'Search failed: ' + error.message, 'error');
                    }
                } else {
                    await loadInventory();
                }
            }, 300);
        });
    }
}

// Determine stock status
function getItemStatus(item) {
    if (item.balance <= 0) return 'out';
    if (item.balance <= item.minStock) return 'low';
    return 'ok';
}

// Render inventory items
function renderItems(filter = 'default') {
    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = '';

    let filteredItems = inventory;
    
    if (filter === 'out') {
        filteredItems = inventory.filter(item => getItemStatus(item) === 'out');
    } else if (filter === 'low') {
        filteredItems = inventory.filter(item => getItemStatus(item) === 'low');
    }

    if (filteredItems.length === 0) {
        inventoryList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 text-lg">No items found</p>
            </div>
        `;
        return;
    }

    filteredItems.forEach(item => {
        const status = getItemStatus(item);
        let cardClasses = 'card text-center cursor-pointer';
        let textColor = 'text-indigo-700';

        if (status === 'out') {
            cardClasses += ' bg-red-100 border-red-500';
            textColor = 'text-red-700';
        } else if (status === 'low') {
            cardClasses += ' bg-yellow-100 border-yellow-500';
            textColor = 'text-yellow-700';
        } else {
            cardClasses += ' bg-white border-gray-200';
        }

        const cardHtml = `
            <div class="${cardClasses}" onclick="showItemDetails('${item.id}')">
                ${item.imageUrl ? `<img src="http://localhost:8080${item.imageUrl}" alt="${item.name}" class="w-24 h-24 object-cover rounded-lg mx-auto mb-3" />` : ''}
                <h2 class="text-xl font-semibold">${item.name}</h2>
                <p class="text-5xl font-extrabold mt-2 ${textColor}">${item.balance}</p>
                <p class="text-sm text-gray-500 mt-2">Min Alert: ${item.minStock}</p>
                <div class="mt-4 flex gap-2 justify-center">
                    <button onclick="event.stopPropagation(); editItem('${item.id}')" class="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                    <button onclick="event.stopPropagation(); deleteItem('${item.id}')" class="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </div>
            </div>
        `;
        inventoryList.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Show item details
function showItemDetails(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
        showMessageBox(
            item.name, 
            `Current Balance: ${item.balance}\nMinimum Stock: ${item.minStock}\n\nClick Edit to modify this item.`,
            'info'
        );
    }
}

// Edit item
async function editItem(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    
    // Store item ID for update
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemBalance').value = item.balance;
    document.getElementById('editItemMinStock').value = item.minStock;
    
    showEditItemPage();
}

// Delete item
async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        await api.inventory.delete(itemId);
        showMessageBox('Success', 'Item deleted successfully', 'info');
        await loadInventory();
    } catch (error) {
        showMessageBox('Error', 'Failed to delete item: ' + error.message, 'error');
    }
}

// Add new item
async function addNewItem() {
    const name = document.getElementById('newItemName').value.trim();
    const minStock = parseInt(document.getElementById('newItemMinStock').value);
    const balance = parseInt(document.getElementById('newItemBalance').value) || 0;
    const imageFile = document.getElementById('newItemImage').files[0];

    if (!name) {
        showMessageBox('Validation Error', 'Please enter a valid item name.', 'error');
        return;
    }
    
    if (isNaN(minStock) || minStock < 1) {
        showMessageBox('Validation Error', 'Minimum stock must be at least 1.', 'error');
        return;
    }

    try {
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            const uploadResult = await api.uploadImage(imageFile);
            imageUrl = uploadResult.url;
        }
        
        const itemData = {
            name,
            balance,
            minStock,
            imageUrl
        };

        await api.inventory.create(itemData);
        showMessageBox('Success', `Item "${name}" added successfully!`, 'info');
        goBack();
        await loadInventory();
    } catch (error) {
        showMessageBox('Error', error.message || 'Failed to add item', 'error');
    }
}

// Update existing item
async function updateExistingItem() {
    const id = document.getElementById('editItemId').value;
    const name = document.getElementById('editItemName').value.trim();
    const balance = parseInt(document.getElementById('editItemBalance').value);
    const minStock = parseInt(document.getElementById('editItemMinStock').value);

    if (!name) {
        showMessageBox('Validation Error', 'Please enter a valid item name.', 'error');
        return;
    }

    try {
        const itemData = { name, balance, minStock };
        await api.inventory.update(id, itemData);
        showMessageBox('Success', 'Item updated successfully!', 'info');
        goBack();
        await loadInventory();
    } catch (error) {
        showMessageBox('Error', 'Failed to update item: ' + error.message, 'error');
    }
}

// Page navigation
function hideAllPages() {
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('addItemPage').classList.add('hidden');
    document.getElementById('editItemPage').classList.add('hidden');
}

function showAddItemPage() {
    hideAllPages();
    document.getElementById('addItemPage').classList.remove('hidden');
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemMinStock').value = 10;
    document.getElementById('newItemBalance').value = 0;
    document.getElementById('newItemImage').value = '';
}

function showEditItemPage() {
    hideAllPages();
    document.getElementById('editItemPage').classList.remove('hidden');
}

function goBack() {
    hideAllPages();
    document.getElementById('mainPage').classList.remove('hidden');
}

function logout() {
    api.auth.logout();
}

// Message box functions
function showMessageBox(title, content, type = 'info') {
    const box = document.getElementById('messageBox');
    const titleElement = document.getElementById('messageTitle');
    
    document.getElementById('messageContent').textContent = content;
    titleElement.textContent = title;
    titleElement.className = 'text-xl font-bold mb-3';
    
    if (type === 'error') {
        titleElement.classList.add('text-red-700');
    } else if (type === 'warning') {
        titleElement.classList.add('text-yellow-700');
    } else {
        titleElement.classList.add('text-indigo-700');
    }

    box.classList.remove('hidden');
}

function closeMessageBox() {
    document.getElementById('messageBox').classList.add('hidden');
}
