/**
 * @jest-environment node
 * @group smoke
 */
import { impactValueOverlap } from "./impactValueOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof impactValueOverlap).toBe("function");
  });
  test("impactValueOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await impactValueOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "impactValueOverlap", example.properties.name);
    }
  }, 120000);
});
