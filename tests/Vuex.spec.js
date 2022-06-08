// @vitest-environment happy-dom

import store from "../src/store/index";
import { describe, expect, it } from "vitest";

describe("Vuex store", () => {
  it("sets user state", async () => {
    expect(store.state.user).toBe(null);
    store.commit("setUser", { user: { email: "test@example.com" } });
    expect(store.state.user).toEqual({
      user: { email: "test@example.com" },
    });
  });
});
