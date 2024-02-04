import { ConsoleLogger } from '@nestjs/common';

enum TokenType {
  CATEGORY,
  TYPE,
  PLAIN,
}

type Token = {
  value: string;
  type: TokenType;
};

const tokenize = (value: string): string[] =>
  value
    .replace(/(IoT)|(CQRS)|(API)|([A-Z]+)/g, (substring) => ` ${substring}`)
    .trim()
    .split(' ');

const tokenTypes: Record<string, TokenType> = {
  Handler: TokenType.TYPE,
  Command: TokenType.CATEGORY,
  Event: TokenType.CATEGORY,
  Query: TokenType.CATEGORY,
  Sagas: TokenType.CATEGORY,
  Service: TokenType.CATEGORY,
  Client: TokenType.CATEGORY,
  Factory: TokenType.CATEGORY,
  Bus: TokenType.TYPE,
};

const processTokens = (tokens: string[]): Token[] => {
  const tempTokens: string[] = [...tokens].reverse();
  const tokenMetas = tempTokens.reduce(
    (acc: Token[], token: string, index: number) => {
      let tokenType: TokenType = TokenType.PLAIN;
      // console.dir({
      //   token,
      //   type: tokenTypes[token],
      //   nextTokenType:
      //     index < tempTokens.length - 1
      //       ? tokenTypes[tempTokens[index + 1]]
      //       : undefined,
      //   prevTokenTYpe: index === 0 ? undefined : acc[index - 1].type,
      // });
      if (tokenTypes[token] !== undefined) {
        tokenType = tokenTypes[token];
      } else if (
        index < tempTokens.length - 1 &&
        tokenTypes[tempTokens[index + 1]]
      ) {
        if (
          index > 0 &&
          tokenTypes[tempTokens[index + 1]] === acc[index - 1].type
        ) {
          // Found a plain token between two non-plain tokens, next matches previous, assume this token is that type
          tokenType = acc[index - 1].type;
        }
      }
      acc.push({
        value: token,
        type: tokenType,
      });

      return acc;
    },
    [] as Token[],
  );
  return tokenMetas.reverse();
};

export class CQRSLogger extends ConsoleLogger {
  protected formatContext(context: string): string {
    const contextTokens = tokenize(context);
    const processedTokens = processTokens(contextTokens);
    const categoryString = processedTokens
      .filter((token) => token.type === TokenType.CATEGORY)
      .map((token) => token.value)
      .join('');
    const typeTokens = processedTokens
      .filter((token) => token.type === TokenType.TYPE)
      .map((token) => token.value);
    const typeString = typeTokens.length > 0 ? `[${typeTokens.join('')}]` : '';
    const plainString = processedTokens
      .filter((token) => token.type === TokenType.PLAIN)
      .map((token) => token.value)
      .join('');
    const separator =
      (categoryString.length > 0 || typeString.length > 0) &&
      plainString.length > 0
        ? ' - '
        : '';
    return super.formatContext(
      `${categoryString}${typeString}${separator}${plainString}`,
    );
  }
}
