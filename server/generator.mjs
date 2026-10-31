export const SYSTEM = `Build the user's playable game as a complete HTML document with inline CSS and JavaScript. Support any requested genre or mechanics, 2D or 3D. Use Three.js via pinned HTTPS CDN ES modules and an import map when requested. There is no template or engine restriction. The game runs in a mobile WebView: provide responsive touch controls, a start/restart flow, and fit the viewport. Include viewport metadata. The iframe has an opaque origin: browser localStorage and IndexedDB are unavailable; keep gameplay state in memory. Remote assets and libraries may be loaded over HTTPS. Return the entire working document, never a patch. When revising, preserve existing functionality unless the user requests changes. Use the deliver_game tool to return the title and HTML. You have no shell, browser, or agent harness.`;
export async function generateGame(
  prompt,
  previous,
  { key, model, fetcher = fetch }
) {
  const response = await fetcher("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(480000),
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 24000,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: previous
            ? `Current game source:\n${previous}\n\nRequested change:\n${prompt}`
            : prompt,
        },
      ],
      tools: [
        {
          name: "deliver_game",
          description: "Return the complete playable game.",
          input_schema: {
            type: "object",
            properties: { title: { type: "string" }, html: { type: "string" } },
            required: ["title", "html"],
            additionalProperties: false,
          },
        },
      ],
      tool_choice: { type: "tool", name: "deliver_game" },
    }),
  });
  if (!response.ok) throw new Error(`AI service returned ${response.status}`);
  const data = await response.json();
  const game = data.content?.find(
    (b) => b.type === "tool_use" && b.name === "deliver_game"
  )?.input;
  if (
    data.stop_reason === "max_tokens" ||
    !game ||
    typeof game.html !== "string" ||
    !game.html.trim() ||
    typeof game.title !== "string" ||
    game.html.length > 1500000
  )
    throw new Error("The game response was incomplete. Please try again.");
  return { title: game.title.slice(0, 100), html: game.html };
}
export function allowedUser(user, appleOnly = true) {
  return (
    !!user &&
    !user.is_anonymous &&
    !!user.email_confirmed_at &&
    (!appleOnly ||
      user.app_metadata?.provider === "apple" ||
      !!user.app_metadata?.providers?.includes("apple"))
  );
}
