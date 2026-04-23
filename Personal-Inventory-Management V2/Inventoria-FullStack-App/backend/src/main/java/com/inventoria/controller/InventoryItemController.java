package com.inventoria.controller;

import com.inventoria.dto.ApiResponse;
import com.inventoria.dto.InventoryItemDTO;
import com.inventoria.service.InventoryItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<InventoryItemDTO> createItem(@RequestBody InventoryItemDTO dto) {
        InventoryItemDTO response = inventoryItemService.createItem(getCurrentUserEmail(), dto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<InventoryItemDTO> updateItem(@PathVariable String itemId, @RequestBody InventoryItemDTO dto) {
        InventoryItemDTO response = inventoryItemService.updateItem(getCurrentUserEmail(), itemId, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse> deleteItem(@PathVariable String itemId) {
        inventoryItemService.deleteItem(getCurrentUserEmail(), itemId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Item deleted successfully")
                .build());
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<InventoryItemDTO> getItem(@PathVariable String itemId) {
        InventoryItemDTO response = inventoryItemService.getItem(getCurrentUserEmail(), itemId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemDTO>> getItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "created") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder
    ) {
        List<InventoryItemDTO> items;
        if (search != null && !search.isBlank()) {
            items = inventoryItemService.searchItems(getCurrentUserEmail(), search);
        } else if (category != null && !category.isBlank()) {
            items = inventoryItemService.getItemsByCategory(getCurrentUserEmail(), category);
        } else {
            items = inventoryItemService.getItemsSorted(getCurrentUserEmail(), sortBy, sortOrder);
        }
        return ResponseEntity.ok(items);
    }
}
