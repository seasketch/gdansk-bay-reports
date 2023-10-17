/**
 * @jest-environment node
 * @group smoke
 */
import { evAreaOverlap } from "./evAreaOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof evAreaOverlap).toBe("function");
  });
  test("evAreaOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await evAreaOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "evAreaOverlap", example.properties.name);
    }
  }, 120000);
});
