package com.inventoria.controller;

import com.inventoria.dto.InventoryItemDTO;
import com.inventoria.service.InventoryItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryItemController {
    
    private static final Logger logger = LoggerFactory.getLogger(InventoryItemController.class);
    
    @Autowired
    private InventoryItemService inventoryItemService;
    
    @GetMapping
    public ResponseEntity<List<InventoryItemDTO>> getAllItems() {
        logger.info("GET /api/inventory - Fetching all items");
        List<InventoryItemDTO> items = inventoryItemService.getAllItems();
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> getItemById(@PathVariable String id) {
        logger.info("GET /api/inventory/{} - Fetching item", id);
        InventoryItemDTO item = inventoryItemService.getItemById(id);
        return ResponseEntity.ok(item);
    }
    
    @PostMapping
    public ResponseEntity<InventoryItemDTO> createItem(@Valid @RequestBody InventoryItemDTO dto) {
        logger.info("POST /api/inventory - Creating new item: {}", dto.getName());
        InventoryItemDTO createdItem = inventoryItemService.createItem(dto);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> updateItem(
            @PathVariable String id,
            @Valid @RequestBody InventoryItemDTO dto) {
        logger.info("PUT /api/inventory/{} - Updating item", id);
        InventoryItemDTO updatedItem = inventoryItemService.updateItem(id, dto);
        return ResponseEntity.ok(updatedItem);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable String id) {
        logger.info("DELETE /api/inventory/{} - Deleting item", id);
        inventoryItemService.deleteItem(id);
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<InventoryItemDTO>> searchItems(@RequestParam String query) {
        logger.info("GET /api/inventory/search?query={}", query);
        List<InventoryItemDTO> items = inventoryItemService.searchItems(query);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItemDTO>> getLowStockItems() {
        logger.info("GET /api/inventory/low-stock - Fetching low stock items");
        List<InventoryItemDTO> items = inventoryItemService.getLowStockItems();
        return ResponseEntity.ok(items);
    }
    
    @PatchMapping("/{id}/stock")
    public ResponseEntity<InventoryItemDTO> updateStock(
            @PathVariable String id,
            @RequestBody Map<String, Integer> payload) {
        logger.info("PATCH /api/inventory/{}/stock - Updating stock", id);
        Integer quantity = payload.get("quantity");
        InventoryItemDTO updatedItem = inventoryItemService.updateStock(id, quantity);
        return ResponseEntity.ok(updatedItem);
    }
}
