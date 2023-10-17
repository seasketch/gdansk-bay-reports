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

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const ShippingDensity: React.FunctionComponent = (props) => {
  const [{ isCollection }] = useSketchProperties();
  const { t, i18n } = useTranslation();

  const metricGroup = project.getMetricGroup("shippingValueOverlap");
  const precalcMetrics = project.getPrecalcMetrics(metricGroup, "sum");

  const mapLabel = t("Map");
  const sectorLabel = t("Sector");
  const valueLabel = t("Ships");
  const percLabel = t("% Ships Within Plan");

  return (
    <>
      <ResultsCard
        title={t("Shipping (2018-2019)")}
        functionName="shippingValueOverlap"
      >
        {(data: ReportResult) => {
          // Single sketch or collection top-level
          const metrics = metricsWithSketchId(
            data.metrics.filter((m) => m.metricId === metricGroup.metricId),
            [data.sketch.properties.id]
          );

          const percMetricIdName = `${metricGroup.metricId}Perc`;
          const percMetrics = metricsWithSketchId(
            toPercentMetric(metrics, precalcMetrics, percMetricIdName),
            [data.sketch.properties.id]
          );

          const finalMetrics = [...metrics, ...percMetrics];

          return (
            <>
              <p>
                <Trans i18nKey="Shipping Density Card 1">
                  This report summarizes the proportion of ships over the years
                  2018-2019 that overlap with this plan, using data on ship
                  density in the planning area. Plans should consider the
                  potential impact on shipping if access is restricted.
                </Trans>
              </p>

              <ClassTable
                rows={finalMetrics}
                metricGroup={metricGroup}
                columnConfig={[
                  {
                    columnLabel: sectorLabel,
                    type: "class",
                    width: 30,
                  },
                  {
                    columnLabel: valueLabel,
                    type: "metricValue",
                    metricId: metricGroup.metricId,
                    valueFormatter: (val: string | number) =>
                      Number.format(
                        Math.round(
                          typeof val === "string" ? parseInt(val) : val
                        )
                      ),
                    width: 25,
                  },
                  {
                    columnLabel: percLabel,
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
                <Trans i18nKey="Shipping Density Card - learn more">
                  <p>
                    ℹ️ The four types of shipping vessels noted in this report
                    are: passenger shipping, touristic shipping (coastal
                    recreation), fishery shipping (for all activities including
                    the tracks from the ports to fishery grounds), and all
                    shipping registered by the AIS system.
                  </p>
                  <p>🎯 Planning Objective: No specific planning objective.</p>
                  <p>
                    🗺️ Source data: Shipping density data (ships no. per 1 sq.
                    km) extracted from AIS system or 2 years (2018-2019).
                  </p>
                  <p>
                    📈 Report: Percentages are calculated by summing shipping
                    density counts within MPAs in this plan, and dividing it by
                    the shipping density counts of the planning area. If the
                    plan includes multiple areas that overlap, the overlap is
                    only counted once.
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
