import { describe, expect, it } from "vitest";
import { getDemoReplies, saveDemoReply } from "@/lib/demo-store";

describe("demo reply store", () => {
  it("adds a new reply", () => {
    const before = getDemoReplies().length;
    const reply = saveDemoReply({ fullName: "Sam Rivers", email: "sam@example.com", status: "celebrating", guestCount: 3, note: "" });
    expect(reply.id).toBeTruthy();
    expect(getDemoReplies().length).toBe(before + 1);
  });
  it("updates in place when the same email replies again", () => {
    const first = saveDemoReply({ fullName: "Ada Eze", email: "ada@example.com", status: "celebrating", guestCount: 4, note: "" });
    const count = getDemoReplies().length;
    const second = saveDemoReply({ fullName: "Ada Eze", email: "ada@example.com", status: "from_afar", guestCount: 1, note: "Plans changed" });
    expect(second.id).toBe(first.id);
    expect(second.status).toBe("from_afar");
    expect(getDemoReplies().length).toBe(count);
  });
});
