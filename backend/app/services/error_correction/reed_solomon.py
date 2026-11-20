from typing import Tuple, List, Optional
import reedsolo

class ReedSolomonCodec:
    def __init__(self, n_parity: int = 16):
        """
        Initializes Reed-Solomon Codec over GF(2^8).
        Can correct up to n_parity // 2 byte errors per chunk.
        """
        self.n_parity = n_parity
        self.codec = reedsolo.RSCodec(n_parity)

    def encode_chunk(self, data: bytes) -> bytes:
        """
        Appends RS parity symbols to chunk data.
        """
        return bytes(self.codec.encode(bytearray(data)))

    def decode_chunk(self, encoded_data: bytes) -> Tuple[Optional[bytes], int, bool]:
        """
        Attempts error correction on chunk.
        Returns: (decoded_data, corrected_err_count, is_successful)
        """
        try:
            # reedsolo returns (decoded_message, decoded_message_with_ecc, errata_pos)
            res = self.codec.decode(bytearray(encoded_data))
            if isinstance(res, tuple):
                decoded_msg = bytes(res[0])
                errata_count = len(res[2]) if len(res) > 2 else 0
            else:
                decoded_msg = bytes(res)
                errata_count = 0
            return decoded_msg, errata_count, True
        except reedsolo.ReedSolomonError:
            # Uncorrectable errors
            return None, 0, False
        except Exception:
            return None, 0, False
