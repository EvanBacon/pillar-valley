import { KNOWN_SIZES, getSimsForSizesAsync } from "./getSimsForSizes";

// Main function
function main() {
  const results = getSimsForSizesAsync(KNOWN_SIZES);

  console.log(JSON.stringify(results));
}

main();
