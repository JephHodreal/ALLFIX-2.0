package ph.allfix.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseAuthService {

    public FirebaseToken verifyToken(String idToken) throws Exception {
        return FirebaseAuth.getInstance().verifyIdToken(idToken);
    }

    public String getUidFromToken(String idToken) throws Exception {
        return verifyToken(idToken).getUid();
    }

    public UserRecord getUser(String uid) throws Exception {
        return FirebaseAuth.getInstance().getUser(uid);
    }

    public void setCustomClaims(String uid, Map<String, Object> claims) throws Exception {
        FirebaseAuth.getInstance().setCustomUserClaims(uid, claims);
    }

    public void setRole(String uid, String role) throws Exception {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        setCustomClaims(uid, claims);
    }
}
