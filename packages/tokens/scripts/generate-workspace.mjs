import fs from "fs";
import path from "path";

function ensureFileExists(filePath) {
  // Ensure parent directory exists
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  try {
    // Create empty file if it does not exist
    fs.writeFileSync(filePath, "", { flag: "wx" });
    console.log("File created:", filePath);
  } catch (err) {
    if (err.code === "EEXIST") {
      console.log("File already exists:", filePath);
    } else {
      throw err;
    }
  }

  // Read file
  const data = fs.readFileSync(filePath, "utf-8");
  return data;
}

export default function generateWorkspace() {
  // Read the generated tokens
  const tokensData = JSON.parse(
    fs.readFileSync(
      path.join(import.meta.dirname, "../data/dist/tokens.json"),
      "utf8"
    )
  );

  console.log("Creating workspace");
  console.log("Total tokens loaded:", tokensData.length);

  if (fs.existsSync(path.join(import.meta.dirname, "../data/src"))) {
    fs.rmdirSync(path.join(import.meta.dirname, "../data/src"), {
      recursive: true,
    });
  }

  if (tokensData.length > 0) {
    tokensData.forEach((token) => {
      const { src } = token;
      const filePath = path.join(
        import.meta.dirname,
        "../data/src",
        src,
        `${token.category}.json`
      );

      const fileContent = JSON.parse(ensureFileExists(filePath) || "[]");

      fileContent.push(token);

      fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
    });
  }

  console.log("Workspace created successfully!");
}
