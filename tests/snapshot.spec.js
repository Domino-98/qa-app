/**
 * @vitest-environment happy-dom
 */

import { describe, test, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import QuestionItem from "../src/components/QuestionItem.vue";

describe("Snapshots QuestionItem.vue", () => {
  test("renders correctly", () => {
    const question = {
      content: "test",
      created_at: "2022-04-14T14:47:47.64+00:00",
      id: 194,
      name: "vue",
      owner_display_name: "Dominik",
      score: 3,
      tags: ["vue", "js", "programowanie"],
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

    expect(wrapper.element).toMatchSnapshot();
  });
});
