from __future__ import annotations

def quote_ident(name: str) -> str:
    return '"' + str(name).replace('"', '""') + '"'