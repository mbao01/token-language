import fs from "fs";
import path from "path";
import {
  buildTokenTree,
  getTreeNode,
  getTokensForPath,
  getAllPaths,
} from "../../src/helpers/buildTokenTree.ts";

// Read the generated tokens
const tokensData = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "../../data/dist/tokens.json"),
    "utf8"
  )
);

// Build the tree
const tree = buildTokenTree(tokensData);

console.log("Tree built successfully!");
console.log("Total paths available:", getAllPaths(tree).length);

// Test getting a specific path
const testPath = getTreeNode(tree, "ui", "web", "default", "default", "light");
if (testPath) {
  console.log("\nTest path found:", testPath.key);
  console.log("Categories in this path:", Array.from(testPath.children.keys()));
  console.log("Total tokens in this path:", testPath.children.size);

  // Show some tokens from the first category
  const firstCategory = Array.from(testPath.children.values())[0];
  if (firstCategory && firstCategory.tokens.length > 0) {
    console.log("\nSample tokens from first category:");
    firstCategory.tokens.slice(0, 3).forEach((token) => {
      console.log(`- ${token.name}: ${token.value}`);
    });
  }
}

// Test getting tokens for a specific path
const tokensForPath = getTokensForPath(
  tree,
  "ui",
  "web",
  "default",
  "default",
  "light"
);
console.log(
  `\nTotal tokens for ui/web/default/default/light: ${tokensForPath.length}`
);

// Show some statistics
console.log("\nTree Statistics:");
const paths = getAllPaths(tree);
const domainStats = {};
const platformStats = {};

paths.forEach((path) => {
  const [domain, platform] = path.split("/");
  domainStats[domain] = (domainStats[domain] || 0) + 1;
  platformStats[platform] = (platformStats[platform] || 0) + 1;
});

console.log("Paths per domain:", domainStats);
console.log("Paths per platform:", platformStats);
