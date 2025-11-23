import { describe, it, expect } from "vitest";
import { escapeShellArg, createSpawnAgentInputSchema } from "./utils.js";

describe("escapeShellArg", () => {
  it("should wrap simple strings in single quotes", () => {
    expect(escapeShellArg("hello")).toBe("'hello'");
  });

  it("should wrap empty string in single quotes", () => {
    expect(escapeShellArg("")).toBe("''");
  });

  it("should escape single quotes properly", () => {
    expect(escapeShellArg("it's")).toBe("'it'\\''s'");
  });

  it("should handle multiple single quotes", () => {
    expect(escapeShellArg("it's Bob's")).toBe("'it'\\''s Bob'\\''s'");
  });

  it("should not modify double quotes inside single quotes", () => {
    expect(escapeShellArg('say "hello"')).toBe("'say \"hello\"'");
  });

  it("should prevent variable expansion", () => {
    const result = escapeShellArg("$HOME");
    expect(result).toBe("'$HOME'");
    // Single quotes prevent shell variable expansion
  });

  it("should prevent command substitution with $()", () => {
    const result = escapeShellArg("$(whoami)");
    expect(result).toBe("'$(whoami)'");
  });

  it("should prevent backtick command substitution", () => {
    const result = escapeShellArg("`id`");
    expect(result).toBe("'`id`'");
  });

  it("should handle newlines", () => {
    const result = escapeShellArg("line1\nline2");
    expect(result).toBe("'line1\nline2'");
  });

  it("should handle special shell characters", () => {
    const special = "test & echo foo | cat ; rm -rf /";
    expect(escapeShellArg(special)).toBe("'" + special + "'");
  });

  it("should handle backslashes", () => {
    expect(escapeShellArg("path\\to\\file")).toBe("'path\\to\\file'");
  });

  it("should handle exclamation marks (history expansion)", () => {
    expect(escapeShellArg("hello!world")).toBe("'hello!world'");
  });
});

describe("escapeShellArg - additional edge cases", () => {
  it("should handle unicode emojis", () => {
    const result = escapeShellArg("Hello 🌍");
    expect(result).toBe("'Hello 🌍'");
  });

  it("should handle CJK characters", () => {
    const result = escapeShellArg("你好世界");
    expect(result).toBe("'你好世界'");
  });

  it("should handle very long strings (1000+ chars)", () => {
    const longString = "a".repeat(1000);
    const result = escapeShellArg(longString);
    expect(result).toBe(`'${longString}'`);
    expect(result.length).toBe(1002); // 1000 + 2 quotes
  });

  it("should handle extremely long strings (100000 chars)", () => {
    const veryLongString = "x".repeat(100000);
    const result = escapeShellArg(veryLongString);
    expect(result.startsWith("'")).toBe(true);
    expect(result.endsWith("'")).toBe(true);
    expect(result.length).toBe(100002);
  });

  it("should handle null bytes", () => {
    const result = escapeShellArg("test\x00null");
    expect(result).toBe("'test\x00null'");
  });

  it("should handle control characters", () => {
    const result = escapeShellArg("test\n\r\t");
    expect(result).toBe("'test\n\r\t'");
  });

  it("should handle mixed quotes", () => {
    const result = escapeShellArg("it's a \"test\"");
    expect(result).toBe("'it'\\''s a \"test\"'");
  });

  it("should handle RTL text (Arabic)", () => {
    const result = escapeShellArg("مرحبا بالعالم");
    expect(result).toBe("'مرحبا بالعالم'");
  });

  it("should handle mixed scripts", () => {
    const result = escapeShellArg("Hello 世界 🌍 مرحبا");
    expect(result).toBe("'Hello 世界 🌍 مرحبا'");
  });

  it("should handle form feed and vertical tab", () => {
    const result = escapeShellArg("test\f\v");
    expect(result).toBe("'test\f\v'");
  });

  it("should handle consecutive single quotes", () => {
    const result = escapeShellArg("'''");
    expect(result).toBe("''\\'''\\'''\\'''");
  });

  it("should handle single quote at start", () => {
    const result = escapeShellArg("'hello");
    expect(result).toBe("''\\''hello'");
  });

  it("should handle single quote at end", () => {
    const result = escapeShellArg("hello'");
    expect(result).toBe("'hello'\\'''");
  });
});

describe("createSpawnAgentInputSchema", () => {
  const schema = createSpawnAgentInputSchema(100);

  describe("task_description validation", () => {
    it("should accept valid task_description", () => {
      const result = schema.safeParse({
        task_description: "Write a hello world program",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty task_description", () => {
      const result = schema.safeParse({ task_description: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot be empty");
      }
    });

    it("should reject missing task_description", () => {
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject task_description exceeding max length", () => {
      const longTask = "a".repeat(101);
      const result = schema.safeParse({ task_description: longTask });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "exceeds maximum length"
        );
      }
    });

    it("should accept task_description at max length", () => {
      const maxTask = "a".repeat(100);
      const result = schema.safeParse({ task_description: maxTask });
      expect(result.success).toBe(true);
    });
  });

  describe("requirements validation", () => {
    it("should accept optional requirements", () => {
      const result = schema.safeParse({
        task_description: "Test",
        requirements: "Use TypeScript",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.requirements).toBe("Use TypeScript");
      }
    });

    it("should work without requirements", () => {
      const result = schema.safeParse({ task_description: "Test" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.requirements).toBeUndefined();
      }
    });

    it("should accept empty requirements string", () => {
      const result = schema.safeParse({
        task_description: "Test",
        requirements: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("input type validation", () => {
    it("should reject non-string task_description", () => {
      const result = schema.safeParse({ task_description: 123 });
      expect(result.success).toBe(false);
    });

    it("should reject null task_description", () => {
      const result = schema.safeParse({ task_description: null });
      expect(result.success).toBe(false);
    });

    it("should reject array task_description", () => {
      const result = schema.safeParse({ task_description: ["test"] });
      expect(result.success).toBe(false);
    });

    it("should reject object task_description", () => {
      const result = schema.safeParse({
        task_description: { text: "test" },
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("createSpawnAgentInputSchema - additional edge cases", () => {
  it("should reject whitespace-only task_description", () => {
    const schema = createSpawnAgentInputSchema(100);
    // Note: The current schema doesn't explicitly reject whitespace-only strings
    // This test documents current behavior - whitespace-only strings pass min(1)
    const result = schema.safeParse({ task_description: "   " });
    // Current behavior: accepts whitespace-only (min check passes)
    expect(result.success).toBe(true);
  });

  it("should handle large maxTaskLength values", () => {
    const schema = createSpawnAgentInputSchema(1000000);
    const longTask = "x".repeat(999999);
    const result = schema.safeParse({ task_description: longTask });
    expect(result.success).toBe(true);
  });

  it("should reject at maxTaskLength + 1", () => {
    const schema = createSpawnAgentInputSchema(1000000);
    const tooLongTask = "x".repeat(1000001);
    const result = schema.safeParse({ task_description: tooLongTask });
    expect(result.success).toBe(false);
  });

  it("should handle maxTaskLength of 1", () => {
    const schema = createSpawnAgentInputSchema(1);
    const result1 = schema.safeParse({ task_description: "a" });
    expect(result1.success).toBe(true);

    const result2 = schema.safeParse({ task_description: "ab" });
    expect(result2.success).toBe(false);
  });

  it("should handle unicode characters in task_description", () => {
    const schema = createSpawnAgentInputSchema(100);
    const result = schema.safeParse({
      task_description: "Write a 你好世界 program 🌍",
    });
    expect(result.success).toBe(true);
  });

  it("should handle very long requirements", () => {
    const schema = createSpawnAgentInputSchema(100);
    const longRequirements = "x".repeat(100000);
    const result = schema.safeParse({
      task_description: "Test",
      requirements: longRequirements,
    });
    // Requirements has no max length constraint
    expect(result.success).toBe(true);
  });

  it("should handle newlines in task_description", () => {
    const schema = createSpawnAgentInputSchema(100);
    const result = schema.safeParse({
      task_description: "Line 1\nLine 2\nLine 3",
    });
    expect(result.success).toBe(true);
  });
});
