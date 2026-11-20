import os
import base64
import hashlib
from typing import Tuple, Dict, Any
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
try:
    import argon2.low_level as argon2_ll
    HAS_ARGON2 = True
except ImportError:
    HAS_ARGON2 = False

class BioCryptEngine:
    SALT_SIZE = 16
    NONCE_SIZE = 12
    KEY_SIZE = 32 # 256 bits

    @classmethod
    def derive_key(cls, password: str, salt: bytes, kdf_type: str = "argon2id") -> Tuple[bytes, Dict[str, Any]]:
        """
        Derive a 256-bit encryption key securely using Argon2id or scrypt.
        """
        pw_bytes = password.encode('utf-8')
        
        if kdf_type == "argon2id" and HAS_ARGON2:
            time_cost = 2
            memory_cost = 64 * 1024 # 64 MB
            parallelism = 2
            raw_key = argon2_ll.hash_secret_raw(
                secret=pw_bytes,
                salt=salt,
                time_cost=time_cost,
                memory_cost=memory_cost,
                parallelism=parallelism,
                hash_len=cls.KEY_SIZE,
                type=argon2_ll.Type.ID
            )
            kdf_params = {
                "kdf": "argon2id",
                "time_cost": time_cost,
                "memory_cost": memory_cost,
                "parallelism": parallelism
            }
        else:
            # High-strength scrypt fallback
            n_param = 16384
            r_param = 8
            p_param = 1
            raw_key = hashlib.scrypt(
                password=pw_bytes,
                salt=salt,
                n=n_param,
                r=r_param,
                p=p_param,
                maxmem=32 * 1024 * 1024,
                dklen=cls.KEY_SIZE
            )
            kdf_params = {
                "kdf": "scrypt",
                "n": n_param,
                "r": r_param,
                "p": p_param
            }
            
        return raw_key, kdf_params

    @classmethod
    def encrypt(cls, plaintext: bytes, password: str, kdf_type: str = "argon2id") -> Dict[str, Any]:
        """
        Encrypt payload using AES-256-GCM.
        Generates fresh salt and nonce. Returns ciphertext with GCM tag appended.
        """
        salt = os.urandom(cls.SALT_SIZE)
        nonce = os.urandom(cls.NONCE_SIZE)
        
        key, kdf_params = cls.derive_key(password, salt, kdf_type)
        aesgcm = AESGCM(key)
        
        # In cryptography library, encrypt appends the 16-byte authentication tag
        ciphertext_and_tag = aesgcm.encrypt(nonce, plaintext, associated_data=None)
        
        return {
            "ciphertext": ciphertext_and_tag,
            "salt_b64": base64.b64encode(salt).decode('utf-8'),
            "nonce_b64": base64.b64encode(nonce).decode('utf-8'),
            "kdf_params": kdf_params,
            "algorithm": "AES-256-GCM"
        }

    @classmethod
    def decrypt(cls, ciphertext_and_tag: bytes, password: str, salt_b64: str, nonce_b64: str, kdf_params: Dict[str, Any]) -> bytes:
        """
        Decrypt payload using AES-256-GCM with authentication tag check.
        Raises ValueError if authentication fails or password is incorrect.
        """
        salt = base64.b64decode(salt_b64)
        nonce = base64.b64decode(nonce_b64)
        kdf_type = kdf_params.get("kdf", "argon2id")
        
        key, _ = cls.derive_key(password, salt, kdf_type)
        aesgcm = AESGCM(key)
        
        try:
            plaintext = aesgcm.decrypt(nonce, ciphertext_and_tag, associated_data=None)
            return plaintext
        except Exception as e:
            raise ValueError("Decryption authentication failed. The key is incorrect or data was tampered.") from e
