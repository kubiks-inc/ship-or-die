export const createVibeKitClient = async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { VibeKit } = await require('@vibe-kit/sdk');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createE2BProvider } = await require('@vibe-kit/e2b');
  const e2bProvider = createE2BProvider({
    apiKey: process.env.E2B_API_KEY!,
    templateId: '3ccbgi9t5jhzrk63a8d9',
  });

  const vibeKit = new VibeKit()
    .withAgent({
      type: 'claude',
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: 'claude-sonnet-4-20250514',
    })
    .withSandbox(e2bProvider);

  return vibeKit;
};
