import { describe, it } from "node:test";
import assert from "node:assert/strict";
import apiClient from "./apiClient";
import { challengeSupportService } from "./challengeSupportService";

describe("challengeSupportService", () => {
  it("createOrGetSession calls POST /challenge-support/sessions with reasoningId", async () => {
    const originalPost = apiClient.post;
    try {
      apiClient.post = (async (url: string, data: any) => {
        assert.equal(url, "/challenge-support/sessions");
        assert.deepEqual(data, { reasoningId: "reasoning-1" });
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "session-1",
              reasoningId: "reasoning-1",
              currentRound: 1,
              isCompleted: false,
              messages: [
                {
                  id: "m-1",
                  sessionId: "session-1",
                  roundNumber: 1,
                  role: "CHALLENGE_SUPPORT",
                  content: "Q1?",
                  createdAt: "2026-11-19T10:00:00Z",
                },
              ],
            },
          },
        };
      }) as any;

      const session = await challengeSupportService.createOrGetSession("reasoning-1");
      assert.equal(session.id, "session-1");
      assert.equal(session.currentRound, 1);
      assert.equal(session.messages[0].content, "Q1?");
    } finally {
      apiClient.post = originalPost;
    }
  });

  it("sendReply calls POST /challenge-support/sessions/:id/replies with reply", async () => {
    const originalPost = apiClient.post;
    try {
      apiClient.post = (async (url: string, data: any) => {
        assert.equal(url, "/challenge-support/sessions/session-1/replies");
        assert.deepEqual(data, { reply: "My student reply" });
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "session-1",
              currentRound: 2,
              isCompleted: true,
              messages: [],
            },
          },
        };
      }) as any;

      const session = await challengeSupportService.sendReply("session-1", "My student reply");
      assert.equal(session.currentRound, 2);
      assert.equal(session.isCompleted, true);
    } finally {
      apiClient.post = originalPost;
    }
  });

  it("getSession calls GET /challenge-support/sessions/:id", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/challenge-support/sessions/session-1");
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "session-1",
              currentRound: 1,
              isCompleted: false,
              messages: [],
            },
          },
        };
      }) as any;

      const session = await challengeSupportService.getSession("session-1");
      assert.equal(session.id, "session-1");
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("completeSession calls POST /challenge-support/sessions/:id/complete", async () => {
    const originalPost = apiClient.post;
    try {
      apiClient.post = (async (url: string) => {
        assert.equal(url, "/challenge-support/sessions/session-1/complete");
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "session-1",
              currentRound: 1,
              isCompleted: true,
              messages: [],
            },
          },
        };
      }) as any;

      const session = await challengeSupportService.completeSession("session-1");
      assert.equal(session.isCompleted, true);
    } finally {
      apiClient.post = originalPost;
    }
  });
});
