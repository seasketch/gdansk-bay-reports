/**
 * @jest-environment node
 * @group smoke
 */
import { fishingEffortValueOverlap } from "./fishingEffortValueOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof fishingEffortValueOverlap).toBe("function");
  });
  test("fishingEffortValueOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await fishingEffortValueOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "fishingEffortValueOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
