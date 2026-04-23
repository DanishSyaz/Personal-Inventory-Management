package com.inventoria.service;

import com.inventoria.dto.InventoryItemDTO;
import com.inventoria.exception.ResourceNotFoundException;
import com.inventoria.model.InventoryItem;
import com.inventoria.repository.InventoryItemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class InventoryItemService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    public InventoryItemDTO createItem(String userId, InventoryItemDTO dto) {
        log.info("Creating inventory item for user: {}", userId);
        
        InventoryItem item = new InventoryItem();
        item.setUserId(userId);
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setCategory(dto.getCategory());
        item.setQuantity(dto.getQuantity());
        item.setUnit(dto.getUnit());
        item.setPrice(dto.getPrice());
        item.setLocation(dto.getLocation());
        item.setCondition(dto.getCondition());
        item.setImageUrls(dto.getImageUrls());
        item.setSku(dto.getSku());
        item.setPurchaseDate(dto.getPurchaseDate());
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        InventoryItem savedItem = inventoryItemRepository.save(item);
        log.info("Inventory item created: {}", savedItem.getId());
        return convertToDTO(savedItem);
    }

    public InventoryItemDTO updateItem(String userId, String itemId, InventoryItemDTO dto) {
        log.info("Updating inventory item: {} for user: {}", itemId, userId);
        
        InventoryItem item = inventoryItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));

        item.setName(dto.getName() != null ? dto.getName() : item.getName());
        item.setDescription(dto.getDescription() != null ? dto.getDescription() : item.getDescription());
        item.setCategory(dto.getCategory() != null ? dto.getCategory() : item.getCategory());
        item.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : item.getQuantity());
        item.setUnit(dto.getUnit() != null ? dto.getUnit() : item.getUnit());
        item.setPrice(dto.getPrice() != null ? dto.getPrice() : item.getPrice());
        item.setLocation(dto.getLocation() != null ? dto.getLocation() : item.getLocation());
        item.setCondition(dto.getCondition() != null ? dto.getCondition() : item.getCondition());
        item.setImageUrls(dto.getImageUrls() != null ? dto.getImageUrls() : item.getImageUrls());
        item.setSku(dto.getSku() != null ? dto.getSku() : item.getSku());
        item.setPurchaseDate(dto.getPurchaseDate() != null ? dto.getPurchaseDate() : item.getPurchaseDate());
        item.setUpdatedAt(LocalDateTime.now());

        InventoryItem updatedItem = inventoryItemRepository.save(item);
        log.info("Inventory item updated: {}", itemId);
        return convertToDTO(updatedItem);
    }

    public void deleteItem(String userId, String itemId) {
        log.info("Deleting inventory item: {} for user: {}", itemId, userId);
        
        Long deletedCount = inventoryItemRepository.deleteByIdAndUserId(itemId, userId);
        if (deletedCount == 0) {
            throw new ResourceNotFoundException("Inventory item not found");
        }
        log.info("Inventory item deleted: {}", itemId);
    }

    public InventoryItemDTO getItem(String userId, String itemId) {
        log.info("Fetching inventory item: {} for user: {}", itemId, userId);
        
        InventoryItem item = inventoryItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));
        return convertToDTO(item);
    }

    public List<InventoryItemDTO> getAllItems(String userId) {
        log.info("Fetching all inventory items for user: {}", userId);
        
        return inventoryItemRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDTO> getItemsByCategory(String userId, String category) {
        log.info("Fetching items by category: {} for user: {}", category, userId);
        
        return inventoryItemRepository.findByUserIdAndCategory(userId, category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDTO> searchItems(String userId, String keyword) {
        log.info("Searching items with keyword: {} for user: {}", keyword, userId);
        
        return inventoryItemRepository.searchByUserIdAndKeyword(userId, keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDTO> getItemsSorted(String userId, String sortBy, String sortOrder) {
        log.info("Fetching items sorted by: {} ({})", sortBy, sortOrder);
        
        List<InventoryItem> items = inventoryItemRepository.findByUserId(userId);

        Comparator<InventoryItem> comparator = switch (sortBy.toLowerCase()) {
            case "name" -> Comparator.comparing(InventoryItem::getName);
            case "price" -> Comparator.comparing(InventoryItem::getPrice, Comparator.nullsLast(Comparator.naturalOrder()));
            case "quantity" -> Comparator.comparing(InventoryItem::getQuantity, Comparator.nullsLast(Comparator.naturalOrder()));
            case "category" -> Comparator.comparing(InventoryItem::getCategory);
            case "created" -> Comparator.comparing(InventoryItem::getCreatedAt);
            default -> Comparator.comparing(InventoryItem::getCreatedAt);
        };

        if ("desc".equalsIgnoreCase(sortOrder)) {
            comparator = comparator.reversed();
        }

        return items.stream()
                .sorted(comparator)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private InventoryItemDTO convertToDTO(InventoryItem item) {
        return InventoryItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                .price(item.getPrice())
                .location(item.getLocation())
                .condition(item.getCondition())
                .imageUrls(item.getImageUrls())
                .sku(item.getSku())
                .purchaseDate(item.getPurchaseDate())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
