/**
 * @jest-environment node
 * @group smoke
 */
import handler, { clipToPlanningArea } from "./clipToPlanningArea";
import { polygonPreprocessorSmokeTest } from "@seasketch/geoprocessing/scripts/testing";

polygonPreprocessorSmokeTest(clipToPlanningArea, handler.options.title, {
  timeout: 20000,
  debug: true,
});
