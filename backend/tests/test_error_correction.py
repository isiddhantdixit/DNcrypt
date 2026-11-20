import pytest
from app.services.error_correction.reed_solomon import ReedSolomonCodec

def test_reed_solomon_clean_chunk():
    data = b"Protected bioinformatics sequence data with Reed-Solomon"
    codec = ReedSolomonCodec(n_parity=16)
    
    encoded = codec.encode_chunk(data)
    assert len(encoded) == len(data) + 16
    
    decoded, err_count, ok = codec.decode_chunk(encoded)
    assert ok is True
    assert err_count == 0
    assert decoded == data

def test_reed_solomon_corrects_byte_errors():
    data = b"Reed Solomon error correction verification payload test."
    codec = ReedSolomonCodec(n_parity=16) # can correct up to 8 byte errors
    
    encoded = bytearray(codec.encode_chunk(data))
    
    # Corrupt 4 bytes
    encoded[2] ^= 0x55
    encoded[10] ^= 0xAA
    encoded[20] ^= 0x33
    encoded[30] ^= 0x77
    
    decoded, err_count, ok = codec.decode_chunk(bytes(encoded))
    assert ok is True
    assert err_count == 4
    assert decoded == data

def test_reed_solomon_excessive_errors_fail():
    data = b"Testing excessive corruptions beyond parity threshold."
    codec = ReedSolomonCodec(n_parity=8) # can correct max 4 errors
    
    encoded = bytearray(codec.encode_chunk(data))
    # Corrupt 7 bytes
    for i in range(7):
        encoded[i * 4] ^= 0xFF
        
    decoded, err_count, ok = codec.decode_chunk(bytes(encoded))
    assert ok is False
    assert decoded is None
