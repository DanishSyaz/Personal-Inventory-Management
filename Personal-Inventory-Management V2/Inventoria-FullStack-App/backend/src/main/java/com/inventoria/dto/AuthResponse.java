package com.inventoria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String type;
    private String userId;
    private String username;
    private String email;
    private String message;

    @Builder.Default
    private Boolean success = true;
}
