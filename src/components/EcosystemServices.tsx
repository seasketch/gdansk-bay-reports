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

export const EcosystemServices: React.FunctionComponent = (props) => {
  const [{ isCollection }] = useSketchProperties();
  const { t, i18n } = useTranslation();
  const metricGroup = project.getMetricGroup("ecosystemServiceValueOverlap");
  const precalcMetrics = project.getPrecalcMetrics(metricGroup, "sum");
  const mapLabel = t("Map");
  const sectorLabel = t("Sector");
  const percValueLabel = t("% Value Found Within Plan");

  return (
    <>
      <ResultsCard
        title={t("Ecological Value - HELCOM")}
        functionName="ecosystemServiceValueOverlap"
      >
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
                <Trans i18nKey="Ecosystem Services Card 1">
                  This report summarizes the percentage of ecological value that
                  overlaps with this plan. Plans should consider protecting
                  areas of greater ecological value.
                </Trans>
              </p>

              <ClassTable
                rows={parentMetrics}
                metricGroup={metricGroup}
                columnConfig={[
                  {
                    columnLabel: " ",
                    type: "class",
                    width: 40,
                  },
                  {
                    columnLabel: percValueLabel,
                    type: "metricChart",
                    metricId: metricGroup.metricId,
                    valueFormatter: "percent",
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 45,
                  },
                  {
                    columnLabel: mapLabel,
                    type: "layerToggle",
                    width: 15,
                  },
                ]}
              />
              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genSketchTable(data, precalcMetrics, metricGroup)}
                </Collapse>
              )}

              <Collapse title={t("Learn more")}>
                <Trans i18nKey="Ecosystem Services Card - learn more">
                  <p>
                    🎯 Planning Objective: there is no specific objective/target
                    for ecological value.
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
