# Quick Start Guide - Personal Inventory Management

## Prerequisites Check

```bash
# Check Java (need 11+)
java -version

# Check Maven (need 3.6+)
mvn -version

# Check MongoDB (need 4.0+)
mongod --version
```

**Don't have them?**
- Java: https://adoptopenjdk.net/
- Maven: https://maven.apache.org/download.cgi
- MongoDB: https://www.mongodb.com/try/download/community

### Step 1: Start Backend
```bash
cd inventoria-fullstack/backend
mvn clean install
mvn spring-boot:run
```
Wait for: `Started InventoriaApplication`

### Step 2: Start Frontend (New Terminal)
```bash
cd inventoria-fullstack/frontend

python3 -m http.server 3000
```

### Step 3: Open Browser
Navigate to: `http://localhost:3000`

## First Time Usage
### 1. Create Account
- Click "Register here"
- Enter username, email, password
- Click "Register"
- Auto-login to dashboard

### 2. Add First Item
- Click "Add New Item"
- Enter:
  - Name: "Coffee Beans"
  - Initial Balance: 50
  - Min Stock: 20
- Click "Add Item"

### 3. Try Features
- **Search**: Type in search bar
- **Filter**: Click "Low Stock" or "Out of Stock"
- **Edit**: Click "Edit" on any card
- **Delete**: Click "Delete" on any card

## Testing the API Using cURL:
# ========================================
# Inventoria API Test Script
# Pro Tips: Just change everything here and copy paste to the terminal if you want to do changes
# ========================================

# ========================================
# LOGIN OR REGISTER
# ========================================
```bash
$baseUrl = "http://localhost:8080/api"

try {
    $registerBody = @{
        username = "testuser"
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json

    $auth = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    
    Write-Host "Registered new user: $($auth.username)" -ForegroundColor Green
}
catch {
    Write-Host "Registration failed or user exists, attempting login..." -ForegroundColor Yellow
    
    $loginBody = @{
        username = "testuser"
        password = "password123"
    } | ConvertTo-Json

    $auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "Logged in as: $($auth.username)" -ForegroundColor Green
}

# 2. Extract the token
$token = $auth.token
$headers = @{ Authorization = "Bearer $token" }

Write-Host "🔑 Token acquired: $($token.Substring(0,10))..." -ForegroundColor Cyan

# ========================================
# CREATE ITEM
# ========================================

try{
    $newItem = @{
        name = "Coffee Beans"
        balance = 10
        minStock = 5
    } | ConvertTo-Json

    $created = Invoke-RestMethod -Uri "$baseUrl/inventory" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $newItem

    Write-Host "Created: $($created.name)" -ForegroundColor Green
    Write-Host "ID: $($created.id)" -ForegroundColor Gray
    Write-Host "Balance: $($created.balance)" -ForegroundColor Gray
    Write-Host ""
} 
catch {
    Write-Host "Fail to create item!" -ForegroundColor Red
    Write-Host "Error Detail: $($_.Exception.Message)" -ForegroundColor Gray
}

# ========================================
# READ ALL ITEMS
# ========================================

try {
    # 1. Attempt to fetch the items
    $items = Invoke-RestMethod -Uri "$baseUrl/inventory" `
        -Method Get `
        -Headers $headers

    # 2. Check if we actually got items back
    if ($null -ne $items) {
        Write-Host "Found $($items.Count) item(s)" -ForegroundColor Green
        # Display the items in a clean table
        $items | Format-Table name, balance, minStock -AutoSize
    } else {
        Write-Host "Inventory is currently empty." -ForegroundColor Yellow
    }
}
catch {
    # 3. Handle errors (Unauthorized, 404, or Connection issues)
    Write-Host "Failed to fetch inventory!" -ForegroundColor Red
    Write-Host "Error Detail: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host "" # Adds a clean line break at the end

# ========================================
# FULL UPDATE ITEM
# ========================================

# 1. The name of the item you want to find
$searchName = "Coffee Beans" 

# 2. Lookup the item to get its ID
$inventory = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Get -Headers $headers
$targetItem = $inventory | Where-Object { $_.name -eq $searchName } | Select-Object -First 1

if ($null -ne $targetItem) {
    $itemId = $targetItem.id  # Extract the ID for the URL

    # 3. Prepare the new data body
    # Since this is a PUT, ensure you include ALL fields required by your API
    $updateBody = @{
        name     = "Premium Coffee Beans"
        balance  = 75
        minStock = 25
    } | ConvertTo-Json

    try {
        # 4. Execute the PUT request using the ID we found
        $updated = Invoke-RestMethod -Uri "$baseUrl/inventory/$itemId" `
            -Method Put `
            -Headers $headers `
            -ContentType "application/json" `
            -Body $updateBody

        Write-Host "Success: '$searchName' (ID: $itemId) has been updated." -ForegroundColor Green
        Write-Host "New Name: $($updated.name) | Balance: $($updated.balance)" -ForegroundColor Cyan
    }
    catch {
        Write-Host "PUT Update failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Error: No item found with the name '$searchName'." -ForegroundColor Red
}

# ========================================
# UPDATE STOCK VIA PATCH
# ========================================

# 1. Configuration
$targetName = "Premium Coffee Beans"

try {
    # 2. Get all items to find the ID
    $inventory = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Get -Headers $headers
    
    # Use -First 1 to ensure we don't get an array if names are duplicated
    $item = $inventory | Where-Object { $_.name -eq $targetName } | Select-Object -First 1

    if ($null -ne $item) {
        $itemId = $item.id
        
        $stockUpdate = @{
            quantity = 10 
        } | ConvertTo-Json

        # 3. Perform the Patch using the ID found
        $stockResult = Invoke-RestMethod -Uri "$baseUrl/inventory/$itemId/stock" `
            -Method Patch `
            -Headers $headers `
            -ContentType "application/json" `
            -Body $stockUpdate

        Write-Host "Success! '$targetName' (ID: $itemId) updated." -ForegroundColor Cyan
        Write-Host "New Balance: $($stockResult.balance)" -ForegroundColor Green
    } 
    else {
        Write-Host "Logic Error: Could not find an item named '$targetName' in the database." -ForegroundColor Yellow
    }
}
catch {
    # 4. Handle API/Network errors (401 Unauthorized, 404 Not Found, 500 Server Error)
    Write-Host "Failed to complete the operation." -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# SEARCH
# ========================================

# 1. Configuration
$searchTerm = "coffee"

try {
    # 2. Execute the Search
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/inventory/search?query=$searchTerm" `
        -Method Get `
        -Headers $headers

    # 3. Handle the Results
    if ($null -ne $searchResults -and $searchResults.Count -gt 0) {
        Write-Host "Found $($searchResults.Count) item(s) matching '$searchTerm'" -ForegroundColor Green
        
        # Display the results clearly
        $searchResults | Format-Table name, balance, minStock -AutoSize
    } 
    else {
        Write-Host "Search completed: No items found matching '$searchTerm'." -ForegroundColor Yellow
    }
}
catch {
    # 4. Handle connection or authorization errors
    Write-Host "Search failed!" -ForegroundColor Red
    Write-Host "Reason: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# GET LOW STOCK ITEMS
# ========================================
try {
    $lowStock = Invoke-RestMethod -Uri "$baseUrl/inventory/low-stock" `
        -Method Get `
        -Headers $headers

    if ($null -ne $lowStock) {
        Write-Host "Low stock items found: $($lowStock.Count)" -ForegroundColor Green
        $lowStock | Format-Table name, balance, minStock
    } else {
        Write-Host "No low stock items detected." -ForegroundColor Cyan
    }
}
catch {
    Write-Host "Failed to fetch low stock report: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ========================================
# DELETE ITEM (BY NAME)
# ========================================
try {
    $targetName = "Premium Coffee Beans"
    
    # Step A: Find the item to get its ID
    $items = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Get -Headers $headers
    $targetItem = $items | Where-Object { $_.name -eq $targetName } | Select-Object -First 1

    if ($targetItem) {
        # Step B: Delete using the ID found
        $itemId = $targetItem.id
        $deleteResult = Invoke-RestMethod -Uri "$baseUrl/inventory/$itemId" -Method Delete -Headers $headers
        
        Write-Host "Success: $($deleteResult.message)" -ForegroundColor Green
    } 
    else {
        Write-Host "Delete failed: Item '$targetName' not found!" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error during delete operation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ========================================
# LOGOUT
# ========================================

try {
    #Check if the token is already empty
    if ([string]::IsNullOrWhiteSpace($token)) {
        # This "throws" an error manually so the 'catch' block can handle it
        throw "No active session found. You are already logged out."
    }

    #If token exists, proceed with logout logic
    # (e.g., calling an API to invalidate the session)
    Write-Host "Logging out..." -ForegroundColor Yellow
    $token = $null
    $headers.Authorization = ""
    Write-Host "Logged out successfully." -ForegroundColor Cyan
}
catch {
    #Handle the error (whether it was the 'throw' above or a system error)
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

```
## Problem: Image Not Loaded (Still Repairing) 

## Development Tips
### Backend Hot Reload
Use Spring Boot DevTools (already included):
- Changes auto-reload on save
- Server restart may be needed if the changes is not happened

### Frontend Changes
- Just refresh browser
- No build step required

### View Logs
```bash
# Backend logs in terminal
# OR check: backend/logs/

# Frontend logs in browser console (F12)
```

### Database GUI
Install MongoDB Compass to view data:
https://www.mongodb.com/try/download/compass

Connection string: `mongodb://localhost:27017/inventoria_db`