import type { Hooks, Plugin, PluginInput } from "@opencode-ai/plugin";
import type { Part, UserMessage } from "@opencode-ai/sdk";

const BRIDGE_HEADER = "<!-- omo-plannotator-bridge -->";

const getUserAgent = async (
  pluginInput: PluginInput,
  sessionId: string | undefined,
) => {
  if (!sessionId) return;

  const messagesResponse = await pluginInput.client.session.messages({
    path: { id: sessionId },
  });
  return messagesResponse.data
    ?.find(
      (message): message is { info: UserMessage; parts: Part[] } =>
        message.info.role === "user",
    )
    ?.info.agent.toLowerCase();
};

const interceptPlannotatorApprove = (parts: Part[]): Part[] =>
  parts.map((part) => {
    if (part.type === "text" && part.text === "Proceed with implementation") {
      return { ...part, text: "" };
    }
    return part;
  });

const plugin: Plugin = async (pluginInput) => {
  const hooks: Hooks = {
    "chat.message": async (_, output) => {
      output.parts = interceptPlannotatorApprove(output.parts);
    },

    "experimental.chat.messages.transform": async (_, output) => {
      output.messages.forEach((message) => {
        message.parts = interceptPlannotatorApprove(message.parts);
      });
    },

    "experimental.chat.system.transform": async (input, output) => {
      const systemPrompt = output.system.join("\n").toLowerCase();
      const alreadyInjected = systemPrompt.includes(BRIDGE_HEADER);
      if (alreadyInjected) return;

      const userAgent = await getUserAgent(pluginInput, input.sessionID);
      const isPrometheus =
        userAgent === "prometheus" || systemPrompt.includes("prometheus");
      const isSisyphus =
        userAgent === "sisyphus" ||
        (systemPrompt.includes("sisyphus") &&
          !systemPrompt.includes("sisyphus-junior"));

      if (isPrometheus) {
        output.system.push(`${BRIDGE_HEADER}
## Plan Submission

Once the plan is complete, you must call the submit_plan tool to get user review.
You must call submit_plan before asking about Start Work / High Accuracy.
Once the user approves, ask about Start Work / High Accuracy.`);
      } else if (isSisyphus) {
        output.system.push(`${BRIDGE_HEADER}
## Plan Submission

Before proceeding with important work steps, call the submit_plan tool to get user confirmation.
Use this when confirmation is needed, such as "Should I proceed this way?" or "Is it okay to go in this direction?"`);
      }
    },
  };

  return hooks;
};

export default plugin;
