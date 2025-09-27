// Token node type definition
export type TokenNode = {
  name: string; // this is the name of the token or alias e.g COLOR_UI_NEUTRAL_10, NOTIFICATION_BORDER_COLOR, ICON_COLOR_PRIMARY, etc.
  _tokenType: "alias" | "token";
  domain: string; // domain (e.g ui, business, marketing, accessibility)
  buildName: string; // "[organization]-[region]" or "default"
  theme: string; // the name of the theme.
  mode: "light" | "dark";
  platform: "web" | "ios" | "android";
  value: string;
  src: string; // the location of the token in the file system
  category: string; // the name of the file the token is in without it's extension, e.g aliases-colors, notification, user-quote, aliases-font-color, aliases-border, etc.
  originalValue: string; // this is usually in the form of the interpolated string and points to another alias value. e.g {!COLOR_UI_NEUTRAL_80}
};

// Tree node structure for the hierarchical organization
export type TreeNode = {
  key: string;
  value: string;
  children: Map<string, TreeNode>;
  tokens: TokenNode[];
};

// Tree structure organized by domain -> platform -> buildName -> theme -> mode
export type TokenTree = {
  [domain: string]: {
    [platform: string]: {
      [buildName: string]: {
        [theme: string]: {
          [mode: string]: TreeNode;
        };
      };
    };
  };
};

/**
 * Builds a hierarchical tree structure from an array of tokens
 * Groups tokens by: domain -> platform -> buildName -> theme -> mode
 * Each leaf node contains tokens organized by category
 */
export const buildTokenTree = (allTokens: TokenNode[]): TokenTree => {
  const tree: TokenTree = {};

  // Group tokens by their hierarchy
  for (const token of allTokens) {
    const { domain, platform, buildName, theme, mode, category } = token;

    // Initialize the tree structure if it doesn't exist
    if (!tree[domain]) {
      tree[domain] = {};
    }
    if (!tree[domain][platform]) {
      tree[domain][platform] = {};
    }
    if (!tree[domain][platform][buildName]) {
      tree[domain][platform][buildName] = {};
    }
    if (!tree[domain][platform][buildName][theme]) {
      tree[domain][platform][buildName][theme] = {};
    }
    if (!tree[domain][platform][buildName][theme][mode]) {
      tree[domain][platform][buildName][theme][mode] = {
        key: `${domain}/${platform}/${buildName}/${theme}/${mode}`,
        value: `${domain} - ${platform} - ${buildName} - ${theme} - ${mode}`,
        children: new Map(),
      };
    }

    // Get the leaf node
    const leafNode = tree[domain][platform][buildName][theme][mode];

    // Group tokens by category within the leaf node
    if (!leafNode.children.has(category)) {
      leafNode.children.set(category, {
        key: category,
        value: category,
        children: new Map(),
        tokens: [],
      });
    }

    // Add token to the appropriate category
    const categoryNode = leafNode.children.get(category)!;
    categoryNode.tokens.push(token);
  }

  // TODO: maybe save tree somewhere so it can be read?
  return tree;
};

/**
 * Gets a specific tree node for a given hierarchy path
 */
export const getTreeNode = (
  tree: TokenTree,
  domain: string,
  platform: string,
  buildName: string,
  theme: string,
  mode: string
): TreeNode | null => {
  return tree[domain]?.[platform]?.[buildName]?.[theme]?.[mode] || null;
};

/**
 * Gets all tokens for a specific hierarchy path
 */
export const getTokensForPath = (
  tree: TokenTree,
  domain: string,
  platform: string,
  buildName: string,
  theme: string,
  mode: string
): TokenNode[] => {
  const node = getTreeNode(tree, domain, platform, buildName, theme, mode);
  if (!node) return [];

  const allTokens: TokenNode[] = [];
  Array.from(node.children.values()).forEach((categoryNode) => {
    allTokens.push(...categoryNode.tokens);
  });
  return allTokens;
};

/**
 * Gets tokens for a specific category within a hierarchy path
 */
export const getTokensForCategory = (
  tree: TokenTree,
  domain: string,
  platform: string,
  buildName: string,
  theme: string,
  mode: string,
  category: string
): TokenNode[] => {
  const node = getTreeNode(tree, domain, platform, buildName, theme, mode);
  if (!node) return [];

  const categoryNode = node.children.get(category);
  return categoryNode ? categoryNode.tokens : [];
};

/**
 * Gets all available paths in the tree
 */
export const getAllPaths = (tree: TokenTree): string[] => {
  const paths: string[] = [];

  for (const domain in tree) {
    for (const platform in tree[domain]) {
      for (const buildName in tree[domain][platform]) {
        for (const theme in tree[domain][platform][buildName]) {
          for (const mode in tree[domain][platform][buildName][theme]) {
            paths.push(`${domain}/${platform}/${buildName}/${theme}/${mode}`);
          }
        }
      }
    }
  }

  return paths;
};
