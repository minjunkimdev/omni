const std = @import("std");

// ── OMNI Design System V2 ──
// Clean, borderless dashboard aesthetic.

pub const RESET = "\x1b[0m";
pub const BOLD = "\x1b[1m";
pub const DIM = "\x1b[2m";
pub const PURPLE = "\x1b[38;5;135m";
pub const CYAN = "\x1b[38;5;87m";
pub const GREEN = "\x1b[38;5;114m";
pub const YELLOW = "\x1b[38;5;228m";
pub const RED = "\x1b[38;5;203m";
pub const WHITE = "\x1b[38;5;255m";
pub const GRAY = "\x1b[38;5;245m";
pub const MAGENTA = "\x1b[38;5;213m";

// Brand Icons
pub const HEX_FULL = "⬢";
pub const HEX_EMPTY = "⬡";
pub const ARROW = "▸";

// Layout Width
pub const DASH_W = 76; 

// Divider dots
pub fn divider(out: anytype) !void {
    try out.print("  " ++ DIM, .{});
    for (0..DASH_W / 2) |_| try out.print("· ", .{});
    try out.print(RESET ++ "\n", .{});
}

pub fn dividerSolid(out: anytype) !void {
    try out.print("  " ++ DIM, .{});
    for (0..DASH_W) |_| try out.print("─", .{});
    try out.print(RESET ++ "\n", .{});
}

// Counts visible characters (ignores ANSI sequences and follows UTF-8)
pub fn visibleLen(str: []const u8) usize {
    var count: usize = 0;
    var i: usize = 0;
    while (i < str.len) {
        if (str[i] == '\x1b') {
            while (i < str.len and str[i] != 'm') i += 1;
            if (i < str.len) i += 1;
        } else {
            const c = str[i];
            if ((c & 0x80) == 0) {
                i += 1;
            } else if ((c & 0xE0) == 0xC0) {
                i += 2;
            } else if ((c & 0xF0) == 0xE0) {
                i += 3;
            } else if ((c & 0xF8) == 0xF0) {
                i += 4;
            } else {
                i += 1;
            }
            count += 1;
        }
    }
    return count;
}

// Simple left-padded row (no borders)
pub fn row(out: anytype, content: []const u8) !void {
    try out.print("  {s}\n", .{content});
}

pub fn colorForPct(pct: f64) []const u8 {
    if (pct >= 70.0) return GREEN;
    if (pct >= 30.0) return YELLOW;
    return RED;
}

pub fn printHeader(out: anytype, title: []const u8) !void {
    try out.print("\n  " ++ PURPLE ++ BOLD ++ "{s} " ++ WHITE ++ "{s}" ++ RESET ++ "\n", .{ ARROW, title });
    try divider(out);
}

// For compatibility with old code, we provide dummy implementations
pub fn printFooter(out: anytype) !void {
    try out.print("\n", .{});
}

pub fn hline(out: anytype, comptime kind: enum { top, mid, bot }) !void {
    _ = out;
    _ = kind;
    // No-op for old bordered style, or we can map it
    // But better to just remove hline calls in caller.
}

// Braille progress bar
pub fn progressBar(allocator: std.mem.Allocator, label: []const u8, pct: f64, width: usize) ![]u8 {
    const filled = @min(@as(usize, @intFromFloat((pct / 100.0) * @as(f64, @floatFromInt(width)))), width);
    const color = colorForPct(pct);
    
    var mb = std.ArrayListUnmanaged(u8){};
    defer mb.deinit(allocator);
    const mbw = mb.writer(allocator);
    try mbw.print(GRAY ++ "{s:<12}" ++ RESET, .{label});
    for (0..filled) |_| try mbw.print("{s}⣿" ++ RESET, .{color});
    for (0..width - filled) |_| try mbw.print(DIM ++ "⣀" ++ RESET, .{});
    try mbw.print("  " ++ BOLD ++ "{s}{d:.1}%" ++ RESET, .{ color, pct });
    return mb.toOwnedSlice(allocator);
}
