import React from "react";
import {
  Collapse,
  ClassTable,
  SketchClassTable,
  ResultsCard,
  useSketchProperties,
  ToolbarCard,
  LayerToggle,
  KeySection,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  squareMeterToKilometer,
  valueFormatter,
  Metric,
  MetricGroup,
  toPercentMetric,
} from "@seasketch/geoprocessing/client-core";

import project from "../../project";
import Translator from "./TranslatorAsync";
import { Trans, useTranslation } from "react-i18next";
import { basic } from "./SizeCard.stories";

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const EcologicalValue: React.FunctionComponent = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const metricGroup = project.getMetricGroup("evAreaOverlap", t);
  const precalcMetrics = project.getPrecalcMetrics(metricGroup, "area");

  const mapLabel = t("Map");
  const speciesLabel = t("Ecological Value");
  const areaWithin = t("Area Within Plan");
  const percAreaWithin = t("% Area Within Plan");
  const sqKmLabel = t("km²");
  const reportTitleLabel = t("Ecological Value - Poland MSP");

  return (
    <>
      <ResultsCard
        title={reportTitleLabel}
        functionName="evAreaOverlap"
        useChildCard
      >
        {(data: ReportResult) => {
          let singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          const finalMetrics = [
            ...singleMetrics,
            ...toPercentMetric(
              singleMetrics,
              precalcMetrics,
              project.getMetricGroupPercId(metricGroup)
            ),
          ];

          return (
            <ToolbarCard
              title={reportTitleLabel}
              items={
                <LayerToggle
                  label={mapLabel}
                  layerId={metricGroup.layerId}
                  simple
                />
              }
            >
              <Trans i18nKey="Ecological Value Card">
                <p>
                  This report summarizes the ecological value of areas within
                  this plan from 1 (least valuable) to 10 (most valuable). Plans
                  should consider protecting areas of greater ecological value.
                </p>
              </Trans>
              <Translator>
                <ClassTable
                  rows={finalMetrics}
                  metricGroup={metricGroup}
                  columnConfig={[
                    {
                      columnLabel: speciesLabel,
                      type: "class",
                      width: 30,
                    },
                    {
                      columnLabel: areaWithin,
                      type: "metricValue",
                      metricId: metricGroup.metricId,
                      valueFormatter: (val: string | number) =>
                        Number.format(
                          Math.round(
                            squareMeterToKilometer(
                              typeof val === "string" ? parseInt(val) : val
                            )
                          )
                        ),
                      valueLabel: sqKmLabel,
                      width: 30,
                    },
                    {
                      columnLabel: percAreaWithin,
                      type: "metricChart",
                      metricId: project.getMetricGroupPercId(metricGroup),
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                        targetLabelPosition: "bottom",
                        targetLabelStyle: "tight",
                        barHeight: 11,
                      },
                      width: 30,
                      targetValueFormatter: (
                        value: number,
                        row: number,
                        numRows: number
                      ) => {
                        if (row === 0) {
                          return (value: number) =>
                            `${valueFormatter(value / 100, "percent0dig")} ${t(
                              "Target"
                            )}`;
                        } else {
                          return (value: number) =>
                            `${valueFormatter(value / 100, "percent0dig")}`;
                        }
                      },
                    },
                    {
                      columnLabel: mapLabel,
                      type: "layerToggle",
                      width: 10,
                    },
                  ]}
                />
              </Translator>

              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genSketchTable(data, precalcMetrics, metricGroup)}
                </Collapse>
              )}

              <Collapse title={t("Learn more")}>
                <Trans i18nKey="Ecological Value Card - learn more">
                  <p>
                    🎯 Planning Objective: there is no specific objective/target
                    for ecological value.
                  </p>
                  <p>
                    🗺️ Source data: Ecological valuation map from Poland MSP.
                  </p>
                  <p>
                    📈 Report: The area within the plan at each ecological value
                    was summed. Percentages are calculated by taking this sum
                    and dividing it by each total ecological value area. If the
                    plan includes multiple areas that overlap, the overlap is
                    only counted once.
                  </p>
                </Trans>
              </Collapse>
            </ToolbarCard>
          );
        }}
      </ResultsCard>
    </>
  );
};

const genSketchTable = (
  data: ReportResult,
  precalcMetrics: Metric[],
  metricGroup: MetricGroup
) => {
  // Build agg metric objects for each child sketch in collection with percValue for each class
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(
      data.metrics.filter((m) => m.metricId === metricGroup.metricId),
      childSketchIds
    ),
    precalcMetrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    metricGroup.classes,
    childSketches
  );
  return (
    <SketchClassTable rows={sketchRows} metricGroup={metricGroup} formatPerc />
  );
};
