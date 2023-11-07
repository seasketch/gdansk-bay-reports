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
import fishingEffortTotalMetrics from "../../data/bin/fishingEffort.json";
import { GeoProp } from "../types";

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const FishingEffort: React.FunctionComponent<GeoProp> = (props) => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const metricGroup = project.getMetricGroup("fishingEffortValueOverlap");
  const precalcMetrics = fishingEffortTotalMetrics.metrics;

  const mapLabel = t("Map");
  const effort = t("Fishing Effort");
  const percValueLabel = t("% Within Plan");
  const hoursLabel = t("kW hours");

  return (
    <>
      <ResultsCard
        title={t("Fishing Effort")}
        functionName="fishingEffortValueOverlap"
      >
        {(data: ReportResult) => {
          // Single sketch or collection top-level
          const percMetricIdName = `${metricGroup.metricId}Perc`;
          const parentMetrics = metricsWithSketchId(
            [
              ...data.metrics.filter(
                (m) => m.metricId === metricGroup.metricId
              ),
              ...toPercentMetric(
                data.metrics.filter((m) => m.metricId === metricGroup.metricId),
                precalcMetrics,
                { metricIdOverride: percMetricIdName }
              ),
            ],
            [data.sketch.properties.id]
          );

          return (
            <>
              <p>
                <Trans i18nKey="Fishing Effort Card 1">
                  This report summarizes the proportion of bottom trawling
                  fishing effort that is within this plan. The higher the
                  percentage, the greater the potential impact to the fishery if
                  access or activities are restricted.
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
                    columnLabel: effort,
                    type: "metricValue",
                    metricId: metricGroup.metricId,
                    valueFormatter: (val: string | number) =>
                      Number.format(
                        Math.round(
                          typeof val === "string" ? parseInt(val) : val
                        )
                      ),
                    valueLabel: hoursLabel,
                    width: 25,
                  },
                  {
                    columnLabel: percValueLabel,
                    type: "metricChart",
                    metricId: percMetricIdName,
                    valueFormatter: "percent",
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 35,
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
                <Trans i18nKey="Fishing Effort Card - learn more">
                  <p>
                    ℹ️ Overview: kW hours is used as a measure of fishing
                    effort. This report is specifically focused on bottom
                    trawling, a fishing practice that herds and captures the
                    target species, like ground fish or crabs, by towing a net
                    along the ocean floor (NOAA Fisheries).
                  </p>
                  <p>🎯 Planning Objective: No specific planning objective.</p>
                  <p>🗺️ Source data: </p>
                  <p>
                    📈 Report: Percentages are calculated by summing fishing
                    effort within MPAs in this plan, and dividing it by the
                    total fishing effort of the planning area. If the plan
                    includes multiple areas that overlap, the overlap is only
                    counted once.
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
