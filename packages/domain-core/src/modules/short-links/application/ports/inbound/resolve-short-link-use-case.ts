export interface ResolveShortLinkCommand {
  shortCode: string;
}

export type ResolveShortLinkResult =
  { found: true; originalUrl: string } | { found: false };

export interface ResolveShortLinkUseCase {
  resolveShortLink(
    command: ResolveShortLinkCommand,
  ): Promise<ResolveShortLinkResult>;
}
