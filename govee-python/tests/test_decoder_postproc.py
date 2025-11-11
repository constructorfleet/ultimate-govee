from govee.data.ble import decoder_lib


def test_post_processing_arithmetic_and_bitwise():
    # bitwise and
    assert decoder_lib.post_processing(0b1100, ['&', 0b1010]) == (0b1100 & 0b1010)
    # bitwise or
    assert decoder_lib.post_processing(0b0101, ['|', 0b0011]) == (0b0101 | 0b0011)
    # multiply
    assert decoder_lib.post_processing(3, ['*', 5]) == 15
    # divide
    assert decoder_lib.post_processing(10, ['/', 2]) == 5.0
    # add
    assert decoder_lib.post_processing(7, ['+', 8]) == 15
    # subtract
    assert decoder_lib.post_processing(10, ['-', 3]) == 7
    # modulo
    assert decoder_lib.post_processing(10, ['%', 3]) == 1


def test_post_processing_comparisons():
    # greater than
    assert decoder_lib.post_processing(5, ['>', 3, '*', 2]) == 10
    # greater than equal
    assert decoder_lib.post_processing(3, ['>=', 3, '+', 2]) == 5
    # less than
    assert decoder_lib.post_processing(2, ['<', 5, '+', 1]) == 3
    # equals
    assert decoder_lib.post_processing(4, ['=', 4, '+', 1]) == 5

