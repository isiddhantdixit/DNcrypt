import zlib
from typing import Tuple

class CompressionEngine:
    @staticmethod
    def compress(data: bytes, level: int = 6) -> Tuple[bytes, float]:
        """
        Compress data using zlib deflate before encryption.
        Returns (compressed_bytes, compression_ratio).
        """
        if not data:
            return data, 1.0
        compressed = zlib.compress(data, level=level)
        ratio = len(compressed) / len(data)
        return compressed, round(ratio, 4)

    @staticmethod
    def decompress(data: bytes) -> bytes:
        """
        Decompress data after decryption.
        """
        if not data:
            return data
        return zlib.decompress(data)
