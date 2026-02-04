package com.inventoria.repository;

import com.inventoria.model.InventoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends MongoRepository<InventoryItem, String> {
    
    List<InventoryItem> findByUserId(String userId);
    
    Optional<InventoryItem> findByIdAndUserId(String id, String userId);
    
    Optional<InventoryItem> findByItemKeyAndUserId(String itemKey, String userId);
    
    List<InventoryItem> findByUserIdAndBalanceLessThanEqual(String userId, Integer balance);
    
    List<InventoryItem> findByUserIdAndNameContainingIgnoreCase(String userId, String name);
    
    void deleteByIdAndUserId(String id, String userId);
}
