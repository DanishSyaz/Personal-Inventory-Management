package com.inventoria.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDTO {
    
    private String id;
    
    @NotBlank(message = "Item name is required")
    private String name;
    
    private String itemKey;
    
    @NotNull(message = "Balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    private Integer balance;
    
    @NotNull(message = "Minimum stock is required")
    @Min(value = 1, message = "Minimum stock must be at least 1")
    private Integer minStock;
    
    private Map<String, Map<String, Integer>> trendData;
    
    private String imageUrl;
}
