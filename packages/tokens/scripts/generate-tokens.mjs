import fs from "fs";
import path from "path";

const domains = ["ui", "business"];
const buildNames = [
  "default",
  "moduscreate-gbr",
  "nutmeg-gbr",
  "nutmeg-usa",
  "moduscreate-eur",
  "jlf-asia",
];
const themes = [
  "default",
  "marketing",
  "bigbear",
  "peanutbutter",
  "hotdog",
  "minimal",
];
const modes = ["light", "dark"];
const platforms = ["web", "ios", "android"];
const DEFAULT_VALUES = {
  theme: "default",
  mode: "light",
};

const baseTokens = {
  colors: [
    { name: "COLOR_UI_NEUTRAL_10", light: "#FFFFFF", dark: "#000000" },
    { name: "COLOR_UI_NEUTRAL_20", light: "#F8F9FA", dark: "#1A1A1A" },
    { name: "COLOR_UI_NEUTRAL_30", light: "#E9ECEF", dark: "#2D2D2D" },
    { name: "COLOR_UI_NEUTRAL_40", light: "#DEE2E6", dark: "#404040" },
    { name: "COLOR_UI_NEUTRAL_50", light: "#ADB5BD", dark: "#737373" },
    { name: "COLOR_UI_NEUTRAL_60", light: "#6C757D", dark: "#8C8C8C" },
    { name: "COLOR_UI_NEUTRAL_70", light: "#495057", dark: "#A6A6A6" },
    { name: "COLOR_UI_NEUTRAL_80", light: "#333333", dark: "#CCCCCC" },
    { name: "COLOR_UI_NEUTRAL_90", light: "#212529", dark: "#E6E6E6" },
    { name: "COLOR_UI_NEUTRAL_100", light: "#000000", dark: "#FFFFFF" },
    { name: "COLOR_UI_PRIMARY_10", light: "#E3F2FD", dark: "#0D1B2A" },
    { name: "COLOR_UI_PRIMARY_20", light: "#BBDEFB", dark: "#1A365D" },
    { name: "COLOR_UI_PRIMARY_30", light: "#90CAF9", dark: "#2C5282" },
    { name: "COLOR_UI_PRIMARY_40", light: "#64B5F6", dark: "#3182CE" },
    { name: "COLOR_UI_PRIMARY_50", light: "#007BFF", dark: "#4DA3FF" },
    { name: "COLOR_UI_PRIMARY_60", light: "#1976D2", dark: "#63B3ED" },
    { name: "COLOR_UI_PRIMARY_70", light: "#1565C0", dark: "#90CDF4" },
    { name: "COLOR_UI_PRIMARY_80", light: "#0D47A1", dark: "#BEE3F8" },
    { name: "COLOR_UI_PRIMARY_90", light: "#0A3D91", dark: "#EBF8FF" },
    { name: "COLOR_UI_PRIMARY_100", light: "#002171", dark: "#F7FAFC" },
    { name: "COLOR_UI_SUCCESS_50", light: "#28A745", dark: "#52C46A" },
    { name: "COLOR_UI_WARNING_50", light: "#FFC107", dark: "#FFD147" },
    { name: "COLOR_UI_DANGER_50", light: "#DC3545", dark: "#E55C69" },
    { name: "COLOR_BUSINESS_BRAND_PRIMARY", light: "#1E3A8A", dark: "#3B82F6" },
    {
      name: "COLOR_BUSINESS_BRAND_SECONDARY",
      light: "#7C3AED",
      dark: "#A78BFA",
    },
    { name: "COLOR_MARKETING_CTA_PRIMARY", light: "#DC2626", dark: "#EF4444" },
    {
      name: "COLOR_MARKETING_CTA_SECONDARY",
      light: "#059669",
      dark: "#10B981",
    },
    {
      name: "COLOR_ACCESSIBILITY_HIGH_CONTRAST",
      light: "#000000",
      dark: "#FFFFFF",
    },
  ],
  spacing: [
    { name: "SPACING_XS", web: "2px", ios: "2pt", android: "2dp" },
    { name: "SPACING_SMALL", web: "4px", ios: "4pt", android: "4dp" },
    { name: "SPACING_MEDIUM", web: "8px", ios: "8pt", android: "8dp" },
    { name: "SPACING_LARGE", web: "16px", ios: "16pt", android: "16dp" },
    { name: "SPACING_XLARGE", web: "32px", ios: "32pt", android: "32dp" },
    { name: "SPACING_XXL", web: "48px", ios: "48pt", android: "48dp" },
    { name: "SPACING_XXXL", web: "64px", ios: "64pt", android: "64dp" },
  ],
  typography: [
    { name: "FONT_SIZE_XS", web: "12px", ios: "12pt", android: "12sp" },
    { name: "FONT_SIZE_SMALL", web: "14px", ios: "14pt", android: "14sp" },
    { name: "FONT_SIZE_BODY", web: "16px", ios: "16pt", android: "16sp" },
    { name: "FONT_SIZE_LARGE", web: "18px", ios: "18pt", android: "18sp" },
    { name: "FONT_SIZE_HEADING", web: "24px", ios: "24pt", android: "24sp" },
    { name: "FONT_SIZE_H1", web: "32px", ios: "32pt", android: "32sp" },
    { name: "FONT_SIZE_H2", web: "28px", ios: "28pt", android: "28sp" },
    { name: "FONT_SIZE_H3", web: "24px", ios: "24pt", android: "24sp" },
    {
      name: "FONT_FAMILY_PRIMARY",
      web: "Roboto, sans-serif",
      ios: "San Francisco",
      android: "Roboto",
    },
    {
      name: "FONT_FAMILY_SECONDARY",
      web: "Inter, sans-serif",
      ios: "Helvetica Neue",
      android: "Inter",
    },
    {
      name: "FONT_FAMILY_MONO",
      web: "Fira Code, monospace",
      ios: "Menlo",
      android: "Fira Code",
    },
    { name: "LINE_HEIGHT_TIGHT", web: "1.25", ios: "1.25", android: "1.25" },
    { name: "LINE_HEIGHT_BODY", web: "1.5", ios: "1.5", android: "1.5" },
    { name: "LINE_HEIGHT_LOOSE", web: "1.75", ios: "1.75", android: "1.75" },
    { name: "FONT_WEIGHT_LIGHT", web: "300", ios: "300", android: "300" },
    { name: "FONT_WEIGHT_NORMAL", web: "400", ios: "400", android: "400" },
    { name: "FONT_WEIGHT_MEDIUM", web: "500", ios: "500", android: "500" },
    { name: "FONT_WEIGHT_BOLD", web: "700", ios: "700", android: "700" },
  ],
  sizing: [
    { name: "BORDER_RADIUS_SMALL", web: "4px", ios: "4pt", android: "4dp" },
    { name: "BORDER_RADIUS_MEDIUM", web: "8px", ios: "8pt", android: "8dp" },
    { name: "BORDER_RADIUS_LARGE", web: "12px", ios: "12pt", android: "12dp" },
    { name: "BORDER_RADIUS_XL", web: "16px", ios: "16pt", android: "16dp" },
    {
      name: "BORDER_RADIUS_FULL",
      web: "9999px",
      ios: "9999pt",
      android: "9999dp",
    },
    { name: "BORDER_WIDTH_THIN", web: "1px", ios: "1pt", android: "1dp" },
    { name: "BORDER_WIDTH_MEDIUM", web: "2px", ios: "2pt", android: "2dp" },
    { name: "BORDER_WIDTH_THICK", web: "4px", ios: "4pt", android: "4dp" },
    {
      name: "SHADOW_SMALL",
      web: "0 1px 2px rgba(0,0,0,0.05)",
      ios: "0 1px 2px rgba(0,0,0,0.05)",
      android: "0 1px 2px rgba(0,0,0,0.05)",
    },
    {
      name: "SHADOW_MEDIUM",
      web: "0 4px 6px rgba(0,0,0,0.1)",
      ios: "0 4px 6px rgba(0,0,0,0.1)",
      android: "0 4px 6px rgba(0,0,0,0.1)",
    },
    {
      name: "SHADOW_LARGE",
      web: "0 10px 15px rgba(0,0,0,0.1)",
      ios: "0 10px 15px rgba(0,0,0,0.1)",
      android: "0 10px 15px rgba(0,0,0,0.1)",
    },
  ],
};

const aliasTokens = [
  // UI Domain Aliases
  {
    name: "NOTIFICATION_BORDER_COLOR",
    category: "notification",
    ref: "COLOR_UI_NEUTRAL_80",
  },
  {
    name: "NOTIFICATION_BACKGROUND_COLOR",
    category: "notification",
    ref: "COLOR_UI_NEUTRAL_10",
  },
  {
    name: "NOTIFICATION_TEXT_COLOR",
    category: "notification",
    ref: "COLOR_UI_NEUTRAL_90",
  },
  { name: "ICON_COLOR_PRIMARY", category: "icon", ref: "COLOR_UI_PRIMARY_50" },
  {
    name: "ICON_COLOR_SECONDARY",
    category: "icon",
    ref: "COLOR_UI_NEUTRAL_60",
  },
  { name: "ICON_COLOR_DISABLED", category: "icon", ref: "COLOR_UI_NEUTRAL_40" },
  {
    name: "BUTTON_BACKGROUND_PRIMARY",
    category: "button",
    ref: "COLOR_UI_PRIMARY_50",
  },
  {
    name: "BUTTON_BACKGROUND_SECONDARY",
    category: "button",
    ref: "COLOR_UI_NEUTRAL_20",
  },
  {
    name: "BUTTON_BACKGROUND_DISABLED",
    category: "button",
    ref: "COLOR_UI_NEUTRAL_30",
  },
  {
    name: "BUTTON_TEXT_COLOR_PRIMARY",
    category: "button",
    ref: "COLOR_UI_NEUTRAL_10",
  },
  {
    name: "BUTTON_TEXT_COLOR_SECONDARY",
    category: "button",
    ref: "COLOR_UI_NEUTRAL_90",
  },
  {
    name: "BUTTON_BORDER_COLOR_PRIMARY",
    category: "button",
    ref: "COLOR_UI_PRIMARY_50",
  },
  {
    name: "BUTTON_BORDER_COLOR_SECONDARY",
    category: "button",
    ref: "COLOR_UI_NEUTRAL_60",
  },
  {
    name: "INPUT_BORDER_COLOR_DEFAULT",
    category: "input",
    ref: "COLOR_UI_NEUTRAL_60",
  },
  {
    name: "INPUT_BORDER_COLOR_FOCUS",
    category: "input",
    ref: "COLOR_UI_PRIMARY_50",
  },
  {
    name: "INPUT_BORDER_COLOR_ERROR",
    category: "input",
    ref: "COLOR_UI_DANGER_50",
  },
  {
    name: "INPUT_BACKGROUND_COLOR",
    category: "input",
    ref: "COLOR_UI_NEUTRAL_10",
  },
  { name: "INPUT_TEXT_COLOR", category: "input", ref: "COLOR_UI_NEUTRAL_90" },
  { name: "LINK_COLOR_DEFAULT", category: "link", ref: "COLOR_UI_PRIMARY_50" },
  { name: "LINK_COLOR_HOVER", category: "link", ref: "COLOR_UI_PRIMARY_60" },
  { name: "LINK_COLOR_VISITED", category: "link", ref: "COLOR_UI_PRIMARY_70" },
  {
    name: "HEADING_FONT_COLOR",
    category: "typography-aliases",
    ref: "COLOR_UI_NEUTRAL_90",
  },
  {
    name: "BODY_FONT_COLOR",
    category: "typography-aliases",
    ref: "COLOR_UI_NEUTRAL_80",
  },
  {
    name: "CAPTION_FONT_COLOR",
    category: "typography-aliases",
    ref: "COLOR_UI_NEUTRAL_60",
  },
  {
    name: "CARD_BACKGROUND_COLOR",
    category: "card",
    ref: "COLOR_UI_NEUTRAL_10",
  },
  { name: "CARD_BORDER_COLOR", category: "card", ref: "COLOR_UI_NEUTRAL_30" },
  { name: "CARD_SHADOW_COLOR", category: "card", ref: "COLOR_UI_NEUTRAL_80" },

  // Business Domain Aliases
  {
    name: "BUSINESS_HEADER_BACKGROUND",
    category: "business-header",
    ref: "COLOR_BUSINESS_BRAND_PRIMARY",
  },
  {
    name: "BUSINESS_HEADER_TEXT",
    category: "business-header",
    ref: "COLOR_UI_NEUTRAL_10",
  },
  {
    name: "BUSINESS_SIDEBAR_BACKGROUND",
    category: "business-sidebar",
    ref: "COLOR_BUSINESS_BRAND_SECONDARY",
  },
  {
    name: "BUSINESS_SIDEBAR_TEXT",
    category: "business-sidebar",
    ref: "COLOR_UI_NEUTRAL_10",
  },
  {
    name: "BUSINESS_NAVIGATION_ACTIVE",
    category: "business-navigation",
    ref: "COLOR_BUSINESS_BRAND_PRIMARY",
  },
  {
    name: "BUSINESS_NAVIGATION_INACTIVE",
    category: "business-navigation",
    ref: "COLOR_UI_NEUTRAL_60",
  },

  // Marketing Domain Aliases
  {
    name: "MARKETING_HERO_BACKGROUND",
    category: "marketing-hero",
    ref: "COLOR_MARKETING_CTA_PRIMARY",
  },
  {
    name: "MARKETING_HERO_TEXT",
    category: "marketing-hero",
    ref: "COLOR_UI_NEUTRAL_10",
  },
  {
    name: "MARKETING_CTA_BUTTON",
    category: "marketing-cta",
    ref: "COLOR_MARKETING_CTA_PRIMARY",
  },
  {
    name: "MARKETING_CTA_BUTTON_TEXT",
    category: "marketing-cta",
    ref: "COLOR_UI_NEUTRAL_10",
  },
  {
    name: "MARKETING_SECONDARY_CTA",
    category: "marketing-cta",
    ref: "COLOR_MARKETING_CTA_SECONDARY",
  },
  {
    name: "MARKETING_SECONDARY_CTA_TEXT",
    category: "marketing-cta",
    ref: "COLOR_UI_NEUTRAL_10",
  },

  // Accessibility Domain Aliases
  {
    name: "ACCESSIBILITY_FOCUS_RING",
    category: "accessibility",
    ref: "COLOR_ACCESSIBILITY_HIGH_CONTRAST",
  },
  {
    name: "ACCESSIBILITY_ERROR_TEXT",
    category: "accessibility",
    ref: "COLOR_UI_DANGER_50",
  },
  {
    name: "ACCESSIBILITY_SUCCESS_TEXT",
    category: "accessibility",
    ref: "COLOR_UI_SUCCESS_50",
  },
  {
    name: "ACCESSIBILITY_WARNING_TEXT",
    category: "accessibility",
    ref: "COLOR_UI_WARNING_50",
  },

  // Complex Alias Chains (aliases that reference other aliases)
  // These are intermediate aliases that should NOT be consumable by end users
  {
    name: "COMPONENT_BUTTON_PRIMARY_BACKGROUND",
    category: "component-button",
    ref: "BUTTON_BACKGROUND_PRIMARY",
  },
  {
    name: "COMPONENT_BUTTON_PRIMARY_TEXT",
    category: "component-button",
    ref: "BUTTON_TEXT_COLOR_PRIMARY",
  },
  {
    name: "COMPONENT_BUTTON_PRIMARY_BORDER",
    category: "component-button",
    ref: "BUTTON_BORDER_COLOR_PRIMARY",
  },
  {
    name: "COMPONENT_INPUT_DEFAULT_BORDER",
    category: "component-input",
    ref: "INPUT_BORDER_COLOR_DEFAULT",
  },
  {
    name: "COMPONENT_INPUT_FOCUS_BORDER",
    category: "component-input",
    ref: "INPUT_BORDER_COLOR_FOCUS",
  },
  {
    name: "COMPONENT_CARD_DEFAULT_BACKGROUND",
    category: "component-card",
    ref: "CARD_BACKGROUND_COLOR",
  },
  {
    name: "COMPONENT_CARD_DEFAULT_BORDER",
    category: "component-card",
    ref: "CARD_BORDER_COLOR",
  },
  {
    name: "LAYOUT_HEADER_BACKGROUND",
    category: "layout",
    ref: "BUSINESS_HEADER_BACKGROUND",
  },
  {
    name: "LAYOUT_HEADER_TEXT",
    category: "layout",
    ref: "BUSINESS_HEADER_TEXT",
  },
  {
    name: "LAYOUT_SIDEBAR_BACKGROUND",
    category: "layout",
    ref: "BUSINESS_SIDEBAR_BACKGROUND",
  },
  {
    name: "LAYOUT_SIDEBAR_TEXT",
    category: "layout",
    ref: "BUSINESS_SIDEBAR_TEXT",
  },

  // Additional intermediate aliases that are NOT consumable
  {
    name: "ALIASES_FONT_COLOR_PRIMARY",
    category: "aliases-font-color",
    ref: "COLOR_UI_PRIMARY_50",
  },
  {
    name: "ALIASES_FONT_COLOR_SECONDARY",
    category: "aliases-font-color",
    ref: "COLOR_UI_NEUTRAL_70",
  },
  {
    name: "ALIASES_BORDER_PRIMARY",
    category: "aliases-border",
    ref: "COLOR_UI_PRIMARY_50",
  },
  {
    name: "ALIASES_BORDER_SECONDARY",
    category: "aliases-border",
    ref: "COLOR_UI_NEUTRAL_60",
  },
  {
    name: "USER_QUOTE_TEXT_COLOR",
    category: "user-quote",
    ref: "COLOR_UI_NEUTRAL_80",
  },
  {
    name: "USER_QUOTE_BACKGROUND_COLOR",
    category: "user-quote",
    ref: "COLOR_UI_NEUTRAL_20",
  },
];

const allTokens = [];

// Define which tokens should be consumable by end users (leaf nodes)
// These will have _tokenType: "token"
const consumableTokens = new Set([
  // Base color tokens - these are the fundamental colors that can be consumed
  "COLOR_UI_NEUTRAL_10",
  "COLOR_UI_NEUTRAL_20",
  "COLOR_UI_NEUTRAL_30",
  "COLOR_UI_NEUTRAL_40",
  "COLOR_UI_NEUTRAL_50",
  "COLOR_UI_NEUTRAL_60",
  "COLOR_UI_NEUTRAL_70",
  "COLOR_UI_NEUTRAL_80",
  "COLOR_UI_NEUTRAL_90",
  "COLOR_UI_NEUTRAL_100",
  "COLOR_UI_PRIMARY_10",
  "COLOR_UI_PRIMARY_20",
  "COLOR_UI_PRIMARY_30",
  "COLOR_UI_PRIMARY_40",
  "COLOR_UI_PRIMARY_50",
  "COLOR_UI_PRIMARY_60",
  "COLOR_UI_PRIMARY_70",
  "COLOR_UI_PRIMARY_80",
  "COLOR_UI_PRIMARY_90",
  "COLOR_UI_PRIMARY_100",
  "COLOR_UI_SUCCESS_50",
  "COLOR_UI_WARNING_50",
  "COLOR_UI_DANGER_50",
  "COLOR_BUSINESS_BRAND_PRIMARY",
  "COLOR_BUSINESS_BRAND_SECONDARY",
  "COLOR_MARKETING_CTA_PRIMARY",
  "COLOR_MARKETING_CTA_SECONDARY",
  "COLOR_ACCESSIBILITY_HIGH_CONTRAST",

  // Base spacing tokens
  "SPACING_XS",
  "SPACING_SMALL",
  "SPACING_MEDIUM",
  "SPACING_LARGE",
  "SPACING_XLARGE",
  "SPACING_XXL",
  "SPACING_XXXL",

  // Base typography tokens
  "FONT_SIZE_XS",
  "FONT_SIZE_SMALL",
  "FONT_SIZE_BODY",
  "FONT_SIZE_LARGE",
  "FONT_SIZE_HEADING",
  "FONT_SIZE_H1",
  "FONT_SIZE_H2",
  "FONT_SIZE_H3",
  "FONT_FAMILY_PRIMARY",
  "FONT_FAMILY_SECONDARY",
  "FONT_FAMILY_MONO",
  "LINE_HEIGHT_TIGHT",
  "LINE_HEIGHT_BODY",
  "LINE_HEIGHT_LOOSE",
  "FONT_WEIGHT_LIGHT",
  "FONT_WEIGHT_NORMAL",
  "FONT_WEIGHT_MEDIUM",
  "FONT_WEIGHT_BOLD",

  // Base sizing tokens
  "BORDER_RADIUS_SMALL",
  "BORDER_RADIUS_MEDIUM",
  "BORDER_RADIUS_LARGE",
  "BORDER_RADIUS_XL",
  "BORDER_RADIUS_FULL",
  "BORDER_WIDTH_THIN",
  "BORDER_WIDTH_MEDIUM",
  "BORDER_WIDTH_THICK",
  "SHADOW_SMALL",
  "SHADOW_MEDIUM",
  "SHADOW_LARGE",

  // High-level consumable tokens - these are the ones end users should actually use
  "BUTTON_BACKGROUND_PRIMARY",
  "BUTTON_BACKGROUND_SECONDARY",
  "BUTTON_BACKGROUND_DISABLED",
  "BUTTON_TEXT_COLOR_PRIMARY",
  "BUTTON_TEXT_COLOR_SECONDARY",
  "BUTTON_BORDER_COLOR_PRIMARY",
  "BUTTON_BORDER_COLOR_SECONDARY",
  "INPUT_BORDER_COLOR_DEFAULT",
  "INPUT_BORDER_COLOR_FOCUS",
  "INPUT_BORDER_COLOR_ERROR",
  "INPUT_BACKGROUND_COLOR",
  "INPUT_TEXT_COLOR",
  "LINK_COLOR_DEFAULT",
  "LINK_COLOR_HOVER",
  "LINK_COLOR_VISITED",
  "CARD_BACKGROUND_COLOR",
  "CARD_BORDER_COLOR",
  "CARD_SHADOW_COLOR",
  "NOTIFICATION_BACKGROUND_COLOR",
  "NOTIFICATION_TEXT_COLOR",
  "NOTIFICATION_BORDER_COLOR",
  "ICON_COLOR_PRIMARY",
  "ICON_COLOR_SECONDARY",
  "ICON_COLOR_DISABLED",
  "HEADING_FONT_COLOR",
  "BODY_FONT_COLOR",
  "CAPTION_FONT_COLOR",
  "BUSINESS_HEADER_BACKGROUND",
  "BUSINESS_HEADER_TEXT",
  "BUSINESS_SIDEBAR_BACKGROUND",
  "BUSINESS_SIDEBAR_TEXT",
  "BUSINESS_NAVIGATION_ACTIVE",
  "BUSINESS_NAVIGATION_INACTIVE",
  "MARKETING_HERO_BACKGROUND",
  "MARKETING_HERO_TEXT",
  "MARKETING_CTA_BUTTON",
  "MARKETING_CTA_BUTTON_TEXT",
  "MARKETING_SECONDARY_CTA",
  "MARKETING_SECONDARY_CTA_TEXT",
  "ACCESSIBILITY_FOCUS_RING",
  "ACCESSIBILITY_ERROR_TEXT",
  "ACCESSIBILITY_SUCCESS_TEXT",
  "ACCESSIBILITY_WARNING_TEXT",
]);

// Helper function to determine if a token should be consumable
// A token is consumable only if it's a leaf node (doesn't reference other tokens)
function isConsumableToken(tokenName, originalValue, actualValue) {
  // Only tokens that are in the consumable set AND are leaf nodes (originalValue === actualValue)
  return consumableTokens.has(tokenName) && originalValue === actualValue;
}

// Helper function to determine domain from token name
function getDomainFromTokenName(tokenName) {
  if (tokenName.includes("BUSINESS_")) return "business";
  if (tokenName.includes("MARKETING_")) return "marketing";
  if (tokenName.includes("ACCESSIBILITY_")) return "accessibility";
  return "ui"; // default domain
}

// Helper function to parse buildName into organization and region
function parseBuildName(buildName) {
  if (buildName === "default") {
    return { organization: "all-orgs", region: "all-regions" };
  }
  const [organization, region] = buildName.split("-");
  return { organization, region };
}

// Helper function to get path values with defaults
function getPathValues(domain, buildName, theme, mode) {
  const { organization, region } = parseBuildName(buildName);

  return {
    domain: domain, // CANNOT be default
    organization: organization, // default -> all-orgs
    region:
      buildName === "default" ||
      organization === "all-orgs" ||
      region === "all-regions"
        ? undefined
        : region, // CANNOT be default
    theme: theme === "default" ? "all-themes" : theme, // default -> all-themes
    mode: mode === "default" || mode === "light" ? "all-modes" : mode, // default -> all-modes
  };
}

// Helper function to get token source file subpath
function getTokenSourceFileSubpath(domain, buildName, theme, mode) {
  const pathValues = getPathValues(domain, buildName, theme, mode);

  const srcSubpath = [
    pathValues.domain,
    pathValues.organization,
    pathValues.region,
    pathValues.theme,
    pathValues.mode,
  ]
    .filter(Boolean)
    .join("/");

  return srcSubpath;
}

// Helper function to resolve alias value (handles both base tokens and other aliases)
function resolveAliasValue(
  aliasRef,
  allTokens,
  buildName,
  theme,
  mode,
  platform
) {
  // First, try to find a base token
  const refTokenCategory = Object.keys(baseTokens).find((cat) =>
    baseTokens[cat].some((t) => t.name === aliasRef)
  );

  if (refTokenCategory) {
    const refToken = baseTokens[refTokenCategory].find(
      (t) => t.name === aliasRef
    );
    if (refTokenCategory === "colors") {
      return refToken[mode];
    } else {
      return refToken[platform];
    }
  }

  // If not a base token, try to find another alias token
  const existingAlias = allTokens.find(
    (t) =>
      t.name === aliasRef &&
      t.buildName === buildName &&
      t.theme === theme &&
      t.mode === mode &&
      t.platform === platform
  );

  return existingAlias ? existingAlias.value : null;
}

export default function generateTokens() {
  // Generate base tokens
  for (const category in baseTokens) {
    for (const token of baseTokens[category]) {
      for (const domain of domains) {
        for (const buildName of buildNames) {
          for (const theme of themes) {
            for (const mode of modes) {
              for (const platform of platforms) {
                let value;
                if (category === "colors") {
                  value = token[mode];
                } else {
                  value = token[platform];
                }

                if (value) {
                  const tokenDomain = getDomainFromTokenName(token.name);
                  // Only generate tokens for their appropriate domain
                  if (tokenDomain === domain) {
                    const src = getTokenSourceFileSubpath(
                      domain,
                      buildName,
                      theme,
                      mode
                    );
                    allTokens.push({
                      name: token.name,
                      _tokenType: isConsumableToken(token.name, value, value)
                        ? "token"
                        : "alias",
                      domain,
                      buildName,
                      theme,
                      mode,
                      platform,
                      value,
                      src,
                      category,
                      originalValue: value, // Base tokens reference themselves
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Generate alias tokens
  for (const alias of aliasTokens) {
    const aliasDomain = getDomainFromTokenName(alias.name);

    for (const domain of domains) {
      for (const buildName of buildNames) {
        for (const theme of themes) {
          for (const mode of modes) {
            for (const platform of platforms) {
              // Only generate aliases for their appropriate domain
              if (aliasDomain === domain) {
                const value = resolveAliasValue(
                  alias.ref,
                  allTokens,
                  buildName,
                  theme,
                  mode,
                  platform
                );

                if (value) {
                  const src = getTokenSourceFileSubpath(
                    domain,
                    buildName,
                    theme,
                    mode
                  );

                  allTokens.push({
                    name: alias.name,
                    _tokenType: isConsumableToken(
                      alias.name,
                      `{!${alias.ref}}`,
                      value
                    )
                      ? "token"
                      : "alias",
                    domain,
                    buildName,
                    theme,
                    mode,
                    platform,
                    value,
                    src,
                    category: alias.category,
                    originalValue: `{!${alias.ref}}`,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  const outputPath = path.resolve(
    import.meta.dirname,
    "../data/dist/tokens.json"
  );
  // Ensure the directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(allTokens, null, 2));

  console.log(
    `Generated ${allTokens.length} tokens and saved to ${outputPath}`
  );
}
