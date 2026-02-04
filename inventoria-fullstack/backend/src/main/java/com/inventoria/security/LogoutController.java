package com.inventoria.security;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LogoutController {

    @Autowired
    private TokenBlacklistService blacklistService;

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestHeader("Authorization") String headerAuth) {
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            String jwt = headerAuth.substring(7);
            blacklistService.blacklistToken(jwt);
            return ResponseEntity.ok("✅ Logged out successfully");
        }
        return ResponseEntity.badRequest().body("❌ Error: Invalid Token Header");
    }
}
