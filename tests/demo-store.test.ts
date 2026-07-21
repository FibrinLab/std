import { describe, expect, it } from "vitest";
import { getDemoReplies, saveDemoReply } from "@/lib/demo-store";

describe("demo reply store", () => {
  it("adds a new reply", () => {
    const before = getDemoReplies().length;
    const reply = saveDemoReply({ fullName: "Sam Rivers", email: "sam@example.com", status: "celebrating", guestCount: 3, guestNames: ["Kemi Rivers", "Bola Rivers"], note: "" });
    expect(reply.id).toBeTruthy();
    expect(reply.guestNames).toEqual(["Kemi Rivers", "Bola Rivers"]);
    expect(getDemoReplies().length).toBe(before + 1);
  });
  it("updates in place when the same email replies again", () => {
    const first = saveDemoReply({ fullName: "Ada Eze", email: "ada@example.com", status: "celebrating", guestCount: 4, guestNames: ["A", "B", "C"], note: "" });
    const count = getDemoReplies().length;
    const second = saveDemoReply({ fullName: "Ada Eze", email: "ada@example.com", status: "from_afar", guestCount: 1, guestNames: [], note: "Plans changed" });
    expect(second.id).toBe(first.id);
    expect(second.status).toBe("from_afar");
    expect(second.guestNames).toEqual([]);
    expect(getDemoReplies().length).toBe(count);
  });
});
