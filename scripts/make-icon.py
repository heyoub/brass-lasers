"""Bake a 128x128 marketplace icon — void purple, brass disc, pink laser slash."""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path


W = H = 128
BG = (14, 10, 23, 255)
BRASS = (255, 182, 39, 255)
PINK = (255, 61, 154, 255)
CYAN = (61, 242, 224, 255)
LIME = (182, 255, 92, 255)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def blend(dst: tuple[int, int, int, int], src: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    sa = src[3] / 255.0
    if sa <= 0:
        return dst
    out_a = sa + dst[3] / 255.0 * (1 - sa)
    if out_a <= 0:
        return (0, 0, 0, 0)
    out = []
    for i in range(3):
        c = (src[i] * sa + dst[i] * (dst[3] / 255.0) * (1 - sa)) / out_a
        out.append(int(c))
    return (out[0], out[1], out[2], int(out_a * 255))


def set_px(buf: list[list[tuple[int, int, int, int]]], x: int, y: int, color: tuple[int, int, int, int]) -> None:
    if 0 <= x < W and 0 <= y < H:
        buf[y][x] = blend(buf[y][x], color)


def disc(buf: list[list[tuple[int, int, int, int]]], cx: float, cy: float, r: float, color: tuple[int, int, int, int]) -> None:
    r2 = r * r
    for y in range(max(0, int(cy - r - 1)), min(H, int(cy + r + 2))):
        for x in range(max(0, int(cx - r - 1)), min(W, int(cx + r + 2))):
            d2 = (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2
            if d2 <= r2:
                edge = max(0.0, min(1.0, (r - math.sqrt(d2)) * 1.5))
                a = int(color[3] * edge)
                set_px(buf, x, y, (color[0], color[1], color[2], a))


def ring(buf: list[list[tuple[int, int, int, int]]], cx: float, cy: float, r_out: float, r_in: float, color: tuple[int, int, int, int]) -> None:
    for y in range(max(0, int(cy - r_out - 1)), min(H, int(cy + r_out + 2))):
        for x in range(max(0, int(cx - r_out - 1)), min(W, int(cx + r_out + 2))):
            d = math.sqrt((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2)
            if r_in <= d <= r_out:
                edge = min(d - r_in, r_out - d, 1.0)
                a = int(color[3] * max(0.0, edge))
                set_px(buf, x, y, (color[0], color[1], color[2], a))


def beam(buf: list[list[tuple[int, int, int, int]]], x0: float, y0: float, x1: float, y1: float, width: float, color: tuple[int, int, int, int]) -> None:
    length = math.hypot(x1 - x0, y1 - y0) or 1.0
    ux, uy = (x1 - x0) / length, (y1 - y0) / length
    px, py = -uy, ux
    steps = int(length * 3)
    for i in range(steps + 1):
        t = i / steps
        cx = x0 + (x1 - x0) * t
        cy = y0 + (y1 - y0) * t
        fade = 0.35 + 0.65 * math.sin(t * math.pi)
        for s in range(-int(width * 2), int(width * 2) + 1):
            dist = abs(s) / (width * 2)
            if dist > 1:
                continue
            a = int(color[3] * fade * (1 - dist) ** 1.4)
            set_px(buf, int(cx + px * s * 0.5), int(cy + py * s * 0.5), (color[0], color[1], color[2], a))


def write_png(path: Path, buf: list[list[tuple[int, int, int, int]]]) -> None:
    raw = bytearray()
    for row in buf:
        raw.append(0)
        for r, g, b, a in row:
            raw.extend((r, g, b, a))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def main() -> None:
    buf = [[BG for _ in range(W)] for _ in range(H)]

    # soft cyan/lime corner glow
    for y in range(H):
        for x in range(W):
            d1 = math.hypot(x - 18, y - 110) / 70
            d2 = math.hypot(x - 110, y - 20) / 80
            if d1 < 1:
                c = (lerp(BG[0], LIME[0], 0.25 * (1 - d1)), lerp(BG[1], LIME[1], 0.25 * (1 - d1)), lerp(BG[2], LIME[2], 0.25 * (1 - d1)), 255)
                buf[y][x] = c
            if d2 < 1:
                base = buf[y][x]
                c = (lerp(base[0], CYAN[0], 0.22 * (1 - d2)), lerp(base[1], CYAN[1], 0.22 * (1 - d2)), lerp(base[2], CYAN[2], 0.22 * (1 - d2)), 255)
                buf[y][x] = c

    disc(buf, 64, 64, 38, (27, 20, 46, 255))
    ring(buf, 64, 64, 42, 34, BRASS)
    disc(buf, 64, 64, 18, BRASS)
    disc(buf, 58, 58, 6, (255, 210, 122, 220))
    beam(buf, 18, 96, 110, 32, 7, PINK)
    beam(buf, 22, 100, 106, 36, 2, (255, 180, 220, 180))

    out = Path(__file__).resolve().parents[1] / "media" / "icon.png"
    write_png(out, buf)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
