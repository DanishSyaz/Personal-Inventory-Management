package com.inventoria.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "inventory_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InventoryItem {
    @Id
    private String id;

    private String userId;

    private String name;

    private String description;

    private String category;

    private Integer quantity;

    private String unit;

    private Double price;

    private String location;

    private String condition;

    private List<String> imageUrls;

    private String sku;

    private LocalDateTime purchaseDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void update(InventoryItem other) {
        if (other.name != null) this.name = other.name;
        if (other.description != null) this.description = other.description;
        if (other.category != null) this.category = other.category;
        if (other.quantity != null) this.quantity = other.quantity;
        if (other.unit != null) this.unit = other.unit;
        if (other.price != null) this.price = other.price;
        if (other.location != null) this.location = other.location;
        if (other.condition != null) this.condition = other.condition;
        if (other.imageUrls != null) this.imageUrls = other.imageUrls;
        if (other.sku != null) this.sku = other.sku;
        if (other.purchaseDate != null) this.purchaseDate = other.purchaseDate;
    }
}
