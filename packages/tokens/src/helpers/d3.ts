import { type TokenGraph } from "@/token";
import fs from "fs";
import path from "path";
import { parseHTML } from "linkedom";
import puppeteer from "puppeteer";
import Jimp from "jimp";
import { ascending } from "d3-array";
import { select } from "d3-selection";
import { linkHorizontal } from "d3-shape";
import { hierarchy, tree } from "d3-hierarchy";
import { getTokenUniqueIdentifier } from "./token/getTokenUniqueIdentifier";

const WIDTH = 720;
const DEVICE_SCALE_FACTOR = 2;

const createGraph = (graph: TokenGraph) => {
  // Compute the tree height; this approach will allow the height of the
  // SVG to scale according to the breadth (width) of the tree layout.
  const root = hierarchy<TokenGraph>(graph);
  const dx = 30;
  const width = 160 * (root.height + 2);
  const dy = width / (root.height + 1);

  // Create a tree layout.
  const t = tree<TokenGraph>()
    .nodeSize([dx, dy])
    .separation((a, b) => {
      return a.parent == b.parent ? 1 : 1;
    });

  // Sort the tree and apply the layout.
  root.sort((a, b) => ascending(a.data.name, b.data.name));
  t(root);

  // Compute the extent of the tree. Note that x and y are swapped here
  // because in the tree layout, x is the breadth, but when displayed, the
  // tree extends right rather than down.
  let x0 = Infinity;
  let x1 = -x0;
  root.each((d) => {
    if ((d.x as number) > x1) x1 = d.x as number;
    if ((d.x as number) < x0) x0 = d.x as number;
  });

  // Compute the adjusted height of the tree.
  const height = x1 - x0 + dx * 2;
  const { document } = parseHTML(`<!DOCTYPE html><body></body>`) as any;
  const svg = select(document.body)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-dy / 3, x0 - dx, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  const link = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(root.links())
    .join("path")
    .attr(
      "d",
      linkHorizontal()
        .x((d) => (d as any).y)
        .y((d) => (d as any).x) as unknown as [number, number]
    );

  const node = svg
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll()
    .data(root.descendants())
    .join("g")
    .attr("transform", (d) => `translate(${d.y},${d.x})`);

  node
    .append("circle")
    .attr("fill", (d) =>
      d.data.attributes._tokenType === "alias" ? "#f00" : "#00f"
    )
    .attr("r", 3)
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  node
    .append("text")
    .attr("dy", "0.31em")
    .attr("x", (d) => (d.children ? -6 : 6))
    .attr("text-anchor", (d) => (d.children ? "end" : "start"))
    .text((d) =>
      d.data.attributes?.deprecated ? `⚠️ ${d.data.name}` : d.data.name
    );
  // .attr("stroke", "white")
  // .attr("stroke-width", 1.5)
  // .attr("paint-order", "stroke");

  return { node: svg.node(), width, height };
};

const getTokenFilePaths = (graph: TokenGraph, rootDir: string) => {
  const tokenIdentifier = getTokenUniqueIdentifier(graph.attributes);
  const tmpDir = path.join(rootDir, "tmp", tokenIdentifier);
  const imagePath = path.join(tmpDir, "graph.png") as `${string}.png`;
  const smImagePath = path.join(tmpDir, "graph_small.png") as `${string}.png`;
  const timestampPath = path.join(tmpDir, "timestamp");

  return { tmpDir, imagePath, smImagePath, timestampPath };
};

const saveGraphToFile = async (
  svgString: string,
  graph: TokenGraph,
  rootDir: string,
  { width, height }: { width: number; height: number }
) => {
  const { tmpDir, imagePath, smImagePath, timestampPath } = getTokenFilePaths(
    graph,
    rootDir
  );

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const timestamp = new Date().getTime();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  });
  await page.setContent(
    `<body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">${svgString}</body>`
  );
  const svgHandle = await page.$("svg");
  await svgHandle?.screenshot({ path: imagePath, omitBackground: true });
  await browser.close();

  const image = await Jimp.read(imagePath);
  await image
    .scale(WIDTH / (width * DEVICE_SCALE_FACTOR))
    .writeAsync(smImagePath);

  fs.writeFileSync(timestampPath, String(timestamp));

  console.log(
    `Saved Token ${graph.name}'s graph at ${timestamp} to: ${imagePath}`
  );

  return { filepath: smImagePath, timestamp };
};

export const drawGraph = async (graph: TokenGraph, rootDir: string) => {
  const { timestampPath, smImagePath } = getTokenFilePaths(graph, rootDir);
  if (fs.existsSync(timestampPath) && fs.existsSync(smImagePath)) {
    // TODO:: read timestamp and check against build timestamp. If a build has occured, then proceed to generate image.
    // also, check that timestamp is not more than 3mins in the future. If so, delete it as well, and proceed to generate image.
    return { filepath: smImagePath };
  }

  const { node, width, height } = createGraph(graph);
  // serialize the SVG
  const svgString = node?.outerHTML || "";
  const { filepath } = await saveGraphToFile(svgString, graph, rootDir, {
    width,
    height,
  });

  return { filepath };
};
