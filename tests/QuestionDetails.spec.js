// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { expect } from "vitest";
import QuestionDetails from "../src/components/QuestionDetails.vue";

describe("QuestionDetails.vue", () => {
  test("renders question.content", async () => {
    const question = {
      content: "test",
      views: [
        {
          view_count: 100,
        },
      ],
    };

    const wrapper = shallowMount(QuestionDetails, {
      props: {
        question: question,
      },
    });

    const content = wrapper.find(".question__content");
    expect(content.text()).toBe(question.content);
  });
});
