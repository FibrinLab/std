import { describe, expect, it } from "vitest";
import { confirmDemoReply, createDemoInvite, deleteDemoInvite, findDemoInviteByCode, getDemoReplies, listDemoInvites, saveDemoReply } from "@/lib/demo-store";

describe("demo reply store", () => {
  it("adds a new reply as pending", () => {
    const before = getDemoReplies().length;
    const reply = saveDemoReply({ fullName: "Sam Rivers", email: "sam@example.com", phone: "+234 801 000 0001", status: "celebrating", guestCount: 2, guestNames: ["Kemi Rivers"], note: "" });
    expect(reply.id).toBeTruthy();
    expect(reply.approval).toBe("pending");
    expect(reply.guestNames).toEqual(["Kemi Rivers"]);
    expect(getDemoReplies().length).toBe(before + 1);
  });
  it("updates in place when the same email replies again", () => {
    const first = saveDemoReply({ fullName: "Ada Eze", email: "ada@example.com", phone: "+234 801 000 0002", status: "celebrating", guestCount: 2, guestNames: ["Tunde Eze"], note: "" });
    const count = getDemoReplies().length;
    const second = saveDemoReply({ fullName: "Ada Eze", email: "ada@example.com", phone: "+234 801 000 0002", status: "from_afar", guestCount: 1, guestNames: [], note: "Plans changed" });
    expect(second.id).toBe(first.id);
    expect(second.status).toBe("from_afar");
    expect(second.guestNames).toEqual([]);
    expect(getDemoReplies().length).toBe(count);
  });
  it("links replies to invites and protects answered invites from deletion", () => {
    const invite = createDemoInvite("Ada Invitee", true);
    expect(findDemoInviteByCode(invite.code)?.id).toBe(invite.id);
    expect(findDemoInviteByCode("nope")).toBeNull();
    saveDemoReply({ fullName: "Ada Invitee", email: "ada.invitee@example.com", phone: "+234 801 000 0004", status: "celebrating", guestCount: 2, guestNames: ["Tunde Guest"], note: "", inviteId: invite.id });
    const listed = listDemoInvites().find((i) => i.id === invite.id);
    expect(listed?.reply?.status).toBe("celebrating");
    expect(listed?.reply?.guestCount).toBe(2);
    expect(deleteDemoInvite(invite.id)).toBe(false);
    const empty = createDemoInvite("Unanswered", false);
    expect(deleteDemoInvite(empty.id)).toBe(true);
  });
  it("confirms a reply, and a changed reply goes back to pending", () => {
    const reply = saveDemoReply({ fullName: "Bisi Ade", email: "bisi@example.com", phone: "+234 801 000 0003", status: "celebrating", guestCount: 1, guestNames: [], note: "" });
    const confirmed = confirmDemoReply(reply.id);
    expect(confirmed?.approval).toBe("confirmed");
    const changed = saveDemoReply({ fullName: "Bisi Ade", email: "bisi@example.com", phone: "+234 801 000 0003", status: "celebrating", guestCount: 2, guestNames: ["Femi Ade"], note: "" });
    expect(changed.approval).toBe("pending");
    expect(confirmDemoReply("00000000-0000-4000-8000-00000000dead")).toBeNull();
  });
});
