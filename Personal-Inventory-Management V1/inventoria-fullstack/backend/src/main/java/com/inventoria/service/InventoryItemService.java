package com.inventoria.service;

import com.inventoria.dto.InventoryItemDTO;
import com.inventoria.exception.ResourceNotFoundException;
import com.inventoria.model.InventoryItem;
import com.inventoria.model.User;
import com.inventoria.repository.InventoryItemRepository;
import com.inventoria.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryItemService {
    
    private static final Logger logger = LoggerFactory.getLogger(InventoryItemService.class);
    
    @Autowired
    private InventoryItemRepository itemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
    
    public List<InventoryItemDTO> getAllItems() {
        String userId = getCurrentUserId();
        logger.info("Fetching all items for user: {}", userId);
        
        return itemRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public InventoryItemDTO getItemById(String id) {
        String userId = getCurrentUserId();
        InventoryItem item = itemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return convertToDTO(item);
    }
    
    public InventoryItemDTO createItem(InventoryItemDTO dto) {
        String userId = getCurrentUserId();
        logger.info("Creating new item for user: {}", userId);
        
        // Generate itemKey from name
        String itemKey = dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "");
        
        // Check if item with same key already exists for this user
        if (itemRepository.findByItemKeyAndUserId(itemKey, userId).isPresent()) {
            throw new RuntimeException("Item with name '" + dto.getName() + "' already exists");
        }
        
        InventoryItem item = new InventoryItem();
        item.setName(dto.getName());
        item.setItemKey(itemKey);
        item.setBalance(dto.getBalance() != null ? dto.getBalance() : 0);
        item.setMinStock(dto.getMinStock());
        item.setUserId(userId);
        item.setImageUrl(dto.getImageUrl());
        
        // Initialize trend data if not provided
        if (dto.getTrendData() != null) {
            item.setTrendData(dto.getTrendData());
        } else {
            item.setTrendData(initializeTrendData());
        }
        
        InventoryItem savedItem = itemRepository.save(item);
        logger.info("Item created successfully: {}", savedItem.getId());
        
        return convertToDTO(savedItem);
    }
    
    public InventoryItemDTO updateItem(String id, InventoryItemDTO dto) {
        String userId = getCurrentUserId();
        InventoryItem item = itemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        
        logger.info("Updating item: {}", id);
        
        if (dto.getName() != null) {
            item.setName(dto.getName());
            item.setItemKey(dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", ""));
        }
        if (dto.getBalance() != null) {
            item.setBalance(dto.getBalance());
        }
        if (dto.getMinStock() != null) {
            item.setMinStock(dto.getMinStock());
        }
        if (dto.getTrendData() != null) {
            item.setTrendData(dto.getTrendData());
        }
        if (dto.getImageUrl() != null) {
            item.setImageUrl(dto.getImageUrl());
        }
        
        InventoryItem updatedItem = itemRepository.save(item);
        return convertToDTO(updatedItem);
    }
    
    public void deleteItem(String id) {
        String userId = getCurrentUserId();
        InventoryItem item = itemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        
        logger.info("Deleting item: {}", id);
        itemRepository.delete(item);
    }
    
    public List<InventoryItemDTO> searchItems(String query) {
        String userId = getCurrentUserId();
        logger.info("Searching items with query: {}", query);
        
        return itemRepository.findByUserIdAndNameContainingIgnoreCase(userId, query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<InventoryItemDTO> getLowStockItems() {
        String userId = getCurrentUserId();
        logger.info("Fetching low stock items for user: {}", userId);
        
        return itemRepository.findByUserId(userId).stream()
                .filter(item -> item.getBalance() <= item.getMinStock())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public InventoryItemDTO updateStock(String id, Integer quantity) {
        String userId = getCurrentUserId();
        InventoryItem item = itemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        
        logger.info("Updating stock for item {}: adding {}", id, quantity);
        item.setBalance(item.getBalance() + quantity);
        
        InventoryItem updatedItem = itemRepository.save(item);
        return convertToDTO(updatedItem);
    }
    
    private InventoryItemDTO convertToDTO(InventoryItem item) {
        InventoryItemDTO dto = new InventoryItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setItemKey(item.getItemKey());
        dto.setBalance(item.getBalance());
        dto.setMinStock(item.getMinStock());
        dto.setTrendData(item.getTrendData());
        dto.setImageUrl(item.getImageUrl());
        return dto;
    }
    
    private Map<String, Map<String, Integer>> initializeTrendData() {
        Map<String, Map<String, Integer>> trendData = new HashMap<>();
        trendData.put("2024", new HashMap<>());
        trendData.put("2025", new HashMap<>());
        return trendData;
    }
}
