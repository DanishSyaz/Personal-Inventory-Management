package com.inventoria.repository;

import com.inventoria.model.InventoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends MongoRepository<InventoryItem, String> {
    List<InventoryItem> findByUserId(String userId);
    List<InventoryItem> findByUserIdAndCategory(String userId, String category);
    List<InventoryItem> findByUserIdAndNameContainingIgnoreCase(String userId, String name);
    Optional<InventoryItem> findByIdAndUserId(String id, String userId);
    Long deleteByIdAndUserId(String id, String userId);

    @Query("{ 'userId': ?0, $or: [ { 'name': { $regex: ?1, $options: 'i' } }, { 'description': { $regex: ?1, $options: 'i' } }, { 'sku': { $regex: ?1, $options: 'i' } } ] }")
    List<InventoryItem> searchByUserIdAndKeyword(String userId, String keyword);
}
