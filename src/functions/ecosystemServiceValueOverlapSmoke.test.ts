/**
 * @jest-environment node
 * @group smoke
 */
import { ecosystemServiceValueOverlap } from "./ecosystemServiceValueOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof ecosystemServiceValueOverlap).toBe("function");
  });
  test("ecosystemServiceValueOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await ecosystemServiceValueOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "ecosystemServiceValueOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
