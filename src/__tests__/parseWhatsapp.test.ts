import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseWhatsapp } from "../whatsapp/parseWhatsapp.js";

async function withTempFile(content: string, fn: (path: string) => Promise<void>) {
  const path = join(tmpdir(), `test-chat-${Date.now()}.txt`);
  await writeFile(path, content, "utf8");
  try {
    await fn(path);
  } finally {
    await unlink(path);
  }
}

describe("parseWhatsapp", () => {
  it("parses a basic message", async () => {
    await withTempFile(
      "[01/01/2026, 09:15:00] Alex: Hello there\n",
      async (path) => {
        const msgs = await parseWhatsapp(path);
        assert.equal(msgs.length, 1);
        assert.equal(msgs[0].sender, "Alex");
        assert.equal(msgs[0].text, "Hello there");
        assert.equal(msgs[0].isSystem, false);
      }
    );
  });

  it("handles multiline messages", async () => {
    await withTempFile(
      "[01/01/2026, 09:15:00] Alex: First line\nSecond line\nThird line\n[01/01/2026, 09:16:00] Jordan: Reply\n",
      async (path) => {
        const msgs = await parseWhatsapp(path);
        assert.equal(msgs.length, 2);
        assert.ok(msgs[0].text.includes("Second line"));
        assert.ok(msgs[0].text.includes("Third line"));
      }
    );
  });

  it("flags system messages", async () => {
    await withTempFile(
      "[01/01/2026, 09:00:00] System: Messages and calls are end-to-end encrypted\n[01/01/2026, 09:01:00] Alex: Hey\n",
      async (path) => {
        const msgs = await parseWhatsapp(path);
        assert.equal(msgs[0].isSystem, true);
        assert.equal(msgs[1].isSystem, false);
      }
    );
  });

  it("parses US date format", async () => {
    await withTempFile(
      "[1/5/26, 9:15:00 AM] Alex: Morning\n",
      async (path) => {
        const msgs = await parseWhatsapp(path);
        assert.equal(msgs.length, 1);
        assert.equal(msgs[0].sender, "Alex");
      }
    );
  });

  it("returns empty array for empty file", async () => {
    await withTempFile("", async (path) => {
      const msgs = await parseWhatsapp(path);
      assert.equal(msgs.length, 0);
    });
  });

  it("preserves message order", async () => {
    await withTempFile(
      "[01/01/2026, 09:00:00] Alex: First\n[01/01/2026, 09:01:00] Jordan: Second\n[01/01/2026, 09:02:00] Alex: Third\n",
      async (path) => {
        const msgs = await parseWhatsapp(path);
        assert.equal(msgs[0].text, "First");
        assert.equal(msgs[1].text, "Second");
        assert.equal(msgs[2].text, "Third");
      }
    );
  });
});
