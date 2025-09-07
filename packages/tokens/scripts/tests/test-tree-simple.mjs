import fs from 'fs';
import path from 'path';

// Read the generated tokens
const tokensData = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '../../data/dist/tokens.json'), 'utf8'));

console.log('Total tokens loaded:', tokensData.length);

// Simple tree building function
function buildTokenTree(allTokens) {
  const tree = {};

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
        categories: {},
        tokens: []
      };
    }

    // Get the leaf node
    const leafNode = tree[domain][platform][buildName][theme][mode];

    // Group tokens by category within the leaf node
    if (!leafNode.categories[category]) {
      leafNode.categories[category] = [];
    }

    // Add token to the appropriate category
    leafNode.categories[category].push(token);
    leafNode.tokens.push(token);
  }

  return tree;
}

// Build the tree
const tree = buildTokenTree(tokensData);

console.log('\nTree built successfully!');

// Count total paths
let totalPaths = 0;
const domainStats = {};
const platformStats = {};

for (const domain in tree) {
  domainStats[domain] = 0;
  for (const platform in tree[domain]) {
    platformStats[platform] = (platformStats[platform] || 0);
    for (const buildName in tree[domain][platform]) {
      for (const theme in tree[domain][platform][buildName]) {
        for (const mode in tree[domain][platform][buildName][theme]) {
          totalPaths++;
          domainStats[domain]++;
          platformStats[platform]++;
        }
      }
    }
  }
}

console.log('Total paths available:', totalPaths);
console.log('Paths per domain:', domainStats);
console.log('Paths per platform:', platformStats);

// Test getting a specific path
const testPath = tree['ui']?.['web']?.['default']?.['default']?.['light'];
if (testPath) {
  console.log('\nTest path found:', testPath.key);
  console.log('Categories in this path:', Object.keys(testPath.categories));
  console.log('Total tokens in this path:', testPath.tokens.length);
  
  // Show some tokens from the first category
  const firstCategory = Object.keys(testPath.categories)[0];
  if (firstCategory && testPath.categories[firstCategory].length > 0) {
    console.log('\nSample tokens from first category (' + firstCategory + '):');
    testPath.categories[firstCategory].slice(0, 3).forEach(token => {
      console.log(`- ${token.name}: ${token.value}`);
    });
  }
}

// Test business domain
const businessPath = tree['business']?.['web']?.['default']?.['default']?.['light'];
if (businessPath) {
  console.log('\nBusiness domain path found:', businessPath.key);
  console.log('Categories in business path:', Object.keys(businessPath.categories));
  console.log('Total tokens in business path:', businessPath.tokens.length);
}

// Test token type distribution
console.log('\nToken Type Distribution:');
const tokenTypeStats = {};
tokensData.forEach(token => {
  tokenTypeStats[token._tokenType] = (tokenTypeStats[token._tokenType] || 0) + 1;
});
console.log('Token types:', tokenTypeStats);

// Test specific token types
console.log('\nSample Token Types:');
const sampleTokens = [
  'COLOR_UI_NEUTRAL_10',
  'BUTTON_BACKGROUND_PRIMARY', 
  'COMPONENT_BUTTON_PRIMARY_BACKGROUND',
  'ALIASES_FONT_COLOR_PRIMARY'
];

sampleTokens.forEach(tokenName => {
  const token = tokensData.find(t => t.name === tokenName);
  if (token) {
    console.log(`${tokenName}: ${token._tokenType} (${token.originalValue})`);
  }
});

console.log('\nTree structure verification complete!');
