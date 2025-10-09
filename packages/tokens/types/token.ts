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
  type?: string;
  deprecated?: boolean;
};

export type TokenGraph = {
  name: string;
  attributes: TokenNode;
  children?: TokenGraph[];
};
