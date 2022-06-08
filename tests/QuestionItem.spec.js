// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { expect } from "vitest";
import QuestionItem from "../src/components/QuestionItem.vue";

describe("QuestionItem.vue", () => {
  test("renders question.owner_display_name", async () => {
    const question = {
      owner_display_name: "Dominik",
      views: [
        {
          view_count: 100,
        },
      ],
    };

    const wrapper = shallowMount(QuestionItem, {
      props: {
        question: question,
      },
    });

    const displayName = wrapper.find(".display-name");
    expect(displayName.text()).toBe(question.owner_display_name);
  });
});
