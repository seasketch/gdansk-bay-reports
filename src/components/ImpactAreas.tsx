import React, { useState } from "react";
import {
  ClassTable,
  Collapse,
  ResultsCard,
  SketchClassTable,
  useSketchProperties,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  Metric,
  MetricGroup,
  toPercentMetric,
} from "@seasketch/geoprocessing/client-core";
import project from "../../project";
import { Trans, useTranslation } from "react-i18next";

export const ImpactAreas: React.FunctionComponent = (props) => {
  const [{ isCollection }] = useSketchProperties();
  const { t, i18n } = useTranslation();
  const metricGroup = project.getMetricGroup("impactValueOverlap");
  const precalcMetrics = project.getPrecalcMetrics(metricGroup, "sum");
  const mapLabel = t("Map");
  const sectorLabel = t("Sector");
  const percValueLabel = t("% Impact Found Within Plan");

  return (
    <>
      <ResultsCard title={t("Impact Areas")} functionName="impactValueOverlap">
        {(data: ReportResult) => {
          // Single sketch or collection top-level
          const parentMetrics = metricsWithSketchId(
            toPercentMetric(
              data.metrics.filter((m) => m.metricId === metricGroup.metricId),
              precalcMetrics
            ),
            [data.sketch.properties.id]
          );

          return (
            <>
              <p>
                <Trans i18nKey="Impact Areas Card 1">
                  This report summarizes overlap with the impact index of Gdańsk
                  Bay, an index for all pressures and their relationship with
                  ecosystem components. Plans should consider the consequences
                  of overlapping with high impact areas.
                </Trans>
              </p>

              <ClassTable
                rows={parentMetrics}
                metricGroup={metricGroup}
                columnConfig={[
                  {
                    columnLabel: " ",
                    type: "class",
                    width: 30,
                  },
                  {
                    columnLabel: percValueLabel,
                    type: "metricChart",
                    metricId: metricGroup.metricId,
                    valueFormatter: "percent",
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 60,
                  },
                  {
                    columnLabel: mapLabel,
                    type: "layerToggle",
                    width: 10,
                  },
                ]}
              />
              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genSketchTable(data, precalcMetrics, metricGroup)}
                </Collapse>
              )}

              <Collapse title={t("Learn more")}>
                <Trans i18nKey="Impact Areas Card - learn more">
                  <p>
                    🎯 Planning Objective: there is no specific objective/target
                    for ecosystem services.
                  </p>
                  <p>
                    🗺️ Source data: Ecological valuation map from HELCOM
                    ecosystem service assessment.
                  </p>
                  <p>
                    📈 Report: Percentages are calculated by summing the areas
                    of value within the MPAs in this plan, and dividing it by
                    total ecosystem services value. If the plan includes
                    multiple areas that overlap, the overlap is only counted
                    once.
                  </p>
                </Trans>
              </Collapse>
            </>
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
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(data.metrics, childSketchIds),
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
