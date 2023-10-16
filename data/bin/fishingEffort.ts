import {
  Metric,
  Polygon,
  Feature,
  isInternalVectorDatasource,
  getFlatGeobufFilename,
  getJsonFilename,
  FeatureCollection,
  createMetric,
} from "@seasketch/geoprocessing";
import fs from "fs-extra";
import project from "../../project";

const metricGroup = project.getMetricGroup("fishingEffortValueOverlap");
const fishingEffortClass = metricGroup.classes[0];
const sumProperty = "SUM_kwfhr";

if (!fishingEffortClass)
  throw new Error("Problem accessing fishing effort data");

const ds = project.getDatasourceById(fishingEffortClass.datasourceId!);

if (!isInternalVectorDatasource(ds))
  throw new Error("Fishing effort data not in vector form");
const url = `data/dist/${getJsonFilename(ds)}`;
const features = JSON.parse(
  fs.readFileSync(url).toString()
) as FeatureCollection<Polygon>;

async function main() {
  const sumFishingEffort = features.features.reduce(
    (sumSoFar: number, feat) => sumSoFar + feat.properties![sumProperty],
    0
  );

  const metrics: Metric[] = [
    createMetric({
      classId: fishingEffortClass.classId,
      value: sumFishingEffort,
      metricId: metricGroup.metricId,
    }),
  ];

  fs.writeFile(
    "data/bin/fishingEffort.json",
    JSON.stringify({ metrics }, null, 2),
    (err) =>
      err
        ? console.error("Error", err)
        : console.info(`Successfully wrote fishingEffort.json`)
  );
}

main();
