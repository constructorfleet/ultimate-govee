"""LAN data helpers.

The TypeScript package exposes a running `service` from the receiver; the
Python tests only require the parsing utility. Importing `service` here
caused an import-time error when the module wasn't implemented. Export a
minimal public surface instead.
"""

from .receiver import parse_lan_packet

__all__ = ["parse_lan_packet"]
