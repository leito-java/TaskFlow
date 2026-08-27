package com.leito.taskmanager.auth.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

/** JWT HMAC minimal : signé côté serveur, puis vérifié avant chaque appel privé. */
@Service
public class JwtService {
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private final String secret;
    private final long expirationSeconds;

    public JwtService(@Value("${app.security.jwt-secret}") String secret,
                      @Value("${app.security.jwt-expiration-minutes}") long expirationMinutes) {
        this.secret = secret;
        this.expirationSeconds = expirationMinutes * 60;
    }

    public String createToken(String email) {
        String header = encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        long expiresAt = Instant.now().getEpochSecond() + expirationSeconds;
        String payload = encode("{\"sub\":\"" + escape(email) + "\",\"exp\":" + expiresAt + "}");
        String unsigned = header + "." + payload;
        return unsigned + "." + sign(unsigned);
    }

    /** Retourne l'e-mail signé, ou null si le jeton est invalide / expiré. */
    public String getSubject(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3 || !constantTimeEquals(sign(parts[0] + "." + parts[1]), parts[2])) return null;
            String payload = new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8);
            String subject = readString(payload, "sub");
            long expiration = readLong(payload, "exp");
            return subject != null && expiration > Instant.now().getEpochSecond() ? subject : null;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) { throw new IllegalStateException("Impossible de signer le jeton", exception); }
    }
    private String encode(String value) { return ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8)); }
    private String readString(String json, String key) {
        String prefix = "\"" + key + "\":\"";
        int start = json.indexOf(prefix);
        if (start < 0) return null;
        int end = json.indexOf('"', start + prefix.length());
        return end < 0 ? null : json.substring(start + prefix.length(), end);
    }
    private long readLong(String json, String key) {
        String prefix = "\"" + key + "\":";
        int start = json.indexOf(prefix);
        if (start < 0) return 0;
        int end = json.indexOf('}', start + prefix.length());
        return Long.parseLong(json.substring(start + prefix.length(), end));
    }
    private boolean constantTimeEquals(String left, String right) {
        return java.security.MessageDigest.isEqual(left.getBytes(StandardCharsets.UTF_8), right.getBytes(StandardCharsets.UTF_8));
    }
    private String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
