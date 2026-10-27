import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Bit lists portal skills via list_skills when asked what is available.",
  async test(t) {
    await t.send("门户现在有哪些 skill？请先查一下再告诉我。");
    t.succeeded();
    t.calledTool("list_skills");
  },
});
