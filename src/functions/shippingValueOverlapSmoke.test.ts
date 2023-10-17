/**
 * @jest-environment node
 * @group smoke
 */
import { shippingValueOverlap } from "./shippingValueOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof shippingValueOverlap).toBe("function");
  });
  test("shippingValueOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await shippingValueOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "shippingValueOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
