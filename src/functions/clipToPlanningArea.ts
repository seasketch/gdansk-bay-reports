import {
  PreprocessingHandler,
  genPreprocessor,
} from "@seasketch/geoprocessing";
import project from "../../project";
import { genClipLoader } from "@seasketch/geoprocessing/dataproviders";

const clipLoader = genClipLoader(project, [
  {
    datasourceId: "gdansk_bay",
    operation: "intersection",
    options: {},
  },
]);

export const clipToPlanningArea = genPreprocessor(clipLoader);

export default new PreprocessingHandler(clipToPlanningArea, {
  title: "clipToPlanningArea",
  description: "Example-description",
  timeout: 40,
  requiresProperties: [],
  memory: 4096,
});
