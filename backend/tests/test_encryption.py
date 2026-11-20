import pytest
from app.services.encryption.biocrypt import BioCryptEngine

def test_encryption_decryption_success():
    plaintext = b"DNcrypt secure molecular computing test payload 1234567890!@#$%^"
    password = "CorrectHorseBatteryStaple2026!"
    
    enc_res = BioCryptEngine.encrypt(plaintext, password=password, kdf_type="argon2id")
    assert "ciphertext" in enc_res
    assert "salt_b64" in enc_res
    assert "nonce_b64" in enc_res
    
    decrypted = BioCryptEngine.decrypt(
        ciphertext_and_tag=enc_res["ciphertext"],
        password=password,
        salt_b64=enc_res["salt_b64"],
        nonce_b64=enc_res["nonce_b64"],
        kdf_params=enc_res["kdf_params"]
    )
    assert decrypted == plaintext

def test_encryption_incorrect_password_fails():
    plaintext = b"Sensitive bioinformatics data"
    password = "MasterPassword"
    wrong_password = "WrongPassword"
    
    enc_res = BioCryptEngine.encrypt(plaintext, password=password)
    
    with pytest.raises(ValueError, match="Decryption authentication failed"):
        BioCryptEngine.decrypt(
            ciphertext_and_tag=enc_res["ciphertext"],
            password=wrong_password,
            salt_b64=enc_res["salt_b64"],
            nonce_b64=enc_res["nonce_b64"],
            kdf_params=enc_res["kdf_params"]
        )

def test_tampered_ciphertext_fails_authentication():
    plaintext = b"Tamper detection verification"
    password = "SecurityVerification"
    
    enc_res = BioCryptEngine.encrypt(plaintext, password=password)
    tampered_bytes = bytearray(enc_res["ciphertext"])
    tampered_bytes[5] ^= 0xFF # Flip bits in ciphertext
    
    with pytest.raises(ValueError, match="Decryption authentication failed"):
        BioCryptEngine.decrypt(
            ciphertext_and_tag=bytes(tampered_bytes),
            password=password,
            salt_b64=enc_res["salt_b64"],
            nonce_b64=enc_res["nonce_b64"],
            kdf_params=enc_res["kdf_params"]
        )
