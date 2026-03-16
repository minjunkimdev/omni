const std = @import("std");
const Filter = @import("interface.zig").Filter;

pub const Action = enum {
    remove,
    mask,
};

pub const Rule = struct {
    name: []const u8,
    match: []const u8,
    action: Action,
};

pub const Config = struct {
    rules: []Rule,
};

pub const CustomFilter = struct {
    allocator: std.mem.Allocator,
    config: std.json.Parsed(Config),
    content: []u8,

    pub fn init(allocator: std.mem.Allocator, config_path: []const u8) !*CustomFilter {
        const file = try std.fs.cwd().openFile(config_path, .{});
        defer file.close();

        const content = try file.readToEndAlloc(allocator, 1024 * 64);
        errdefer allocator.free(content);
        
        return try initFromContent(allocator, content);
    }

    pub fn initFromContent(allocator: std.mem.Allocator, content: []const u8) !*CustomFilter {
        const config = try std.json.parseFromSlice(Config, allocator, content, .{ .ignore_unknown_fields = true });
        errdefer config.deinit();
        
        const self = try allocator.create(CustomFilter);
        self.* = .{
            .allocator = allocator,
            .config = config,
            .content = try allocator.dupe(u8, content),
        };
        return self;
    }

    pub fn deinit(self: *CustomFilter) void {
        self.config.deinit();
        self.allocator.free(self.content);
        self.allocator.destroy(self);
    }

    pub fn filter(self: *CustomFilter) Filter {
        return .{
            .name = "custom",
            .ptr = self,
            .matchFn = match,
            .processFn = process,
        };
    }

    fn match(ptr: *anyopaque, input: []const u8) bool {
        const self: *CustomFilter = @ptrCast(@alignCast(ptr));
        for (self.config.value.rules) |rule| {
            if (std.mem.indexOf(u8, input, rule.match) != null) return true;
        }
        return false;
    }

    fn process(ptr: *anyopaque, allocator: std.mem.Allocator, input: []const u8) ![]u8 {
        const self: *CustomFilter = @ptrCast(@alignCast(ptr));
        var current_output = try allocator.dupe(u8, input);
        errdefer allocator.free(current_output);

        for (self.config.value.rules) |rule| {
            if (std.mem.indexOf(u8, current_output, rule.match)) |_| {
                const next_output = switch (rule.action) {
                    .remove => try removeAll(allocator, current_output, rule.match),
                    .mask => try maskAll(allocator, current_output, rule.match),
                };
                allocator.free(current_output);
                current_output = next_output;
            }
        }
        return current_output;
    }

    fn removeAll(allocator: std.mem.Allocator, input: []const u8, match_str: []const u8) ![]u8 {
        var result = std.ArrayList(u8).empty;
        errdefer result.deinit(allocator);

        var last_index: usize = 0;
        while (std.mem.indexOf(u8, input[last_index..], match_str)) |index| {
            const actual_index = last_index + index;
            try result.appendSlice(allocator, input[last_index..actual_index]);
            last_index = actual_index + match_str.len;
        }
        try result.appendSlice(allocator, input[last_index..]);
        return try result.toOwnedSlice(allocator);
    }

    fn maskAll(allocator: std.mem.Allocator, input: []const u8, match_str: []const u8) ![]u8 {
        var result = std.ArrayList(u8).empty;
        errdefer result.deinit(allocator);

        var last_index: usize = 0;
        while (std.mem.indexOf(u8, input[last_index..], match_str)) |index| {
            const actual_index = last_index + index;
            try result.appendSlice(allocator, input[last_index..actual_index]);
            try result.appendSlice(allocator, "[MASKED]");
            last_index = actual_index + match_str.len;
        }
        try result.appendSlice(allocator, input[last_index..]);
        return try result.toOwnedSlice(allocator);
    }
};
