package com.inventoria.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "inventory_items")
public class InventoryItem {
    
    @Id
    private String id;
    
    private String name;
    private String itemKey; // URL-safe key (e.g., "milk", "coffee")
    private Integer balance;
    private Integer minStock;
    
    // Store monthly trend data as nested maps: {year: {month: value}}
    // Example: {"2024": {"1": 42, "2": 38, ...}, "2025": {...}}
    private Map<String, Map<String, Integer>> trendData = new HashMap<>();
    
    private String userId; // Owner of this inventory item
    
    private String imageUrl; // For image upload feature
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
