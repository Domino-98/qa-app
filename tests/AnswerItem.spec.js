// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { expect } from "vitest";
import AnswerItem from "../src/components/AnswerItem.vue";

describe("AnswerItem.vue", () => {
  test("renders answer.content", async () => {
    expect(AnswerItem).toBeTruthy();

    const answer = {
      content: "test",
      replies: [],
    };

    const wrapper = shallowMount(AnswerItem, {
      props: {
        answer: answer,
      },
    });

    const content = wrapper.find(".answers__item-content");
    expect(content.text()).toBe(answer.content);
  });
});
