import React from "react";
import {
  ReportResult,
  percentWithEdge,
  keyBy,
  toNullSketchArray,
  nestMetrics,
  valueFormatter,
  toPercentMetric,
  sortMetricsDisplayOrder,
  isSketchCollection,
  MetricGroup,
} from "@seasketch/geoprocessing/client-core";
import {
  ClassTable,
  Collapse,
  Column,
  ReportTableStyled,
  ResultsCard,
  Table,
  useSketchProperties,
  ToolbarCard,
  DataDownload,
} from "@seasketch/geoprocessing/client-ui";
import styled from "styled-components";
import project from "../../project";
import { Metric, squareMeterToKilometer } from "@seasketch/geoprocessing";
import Translator from "../components/TranslatorAsync";
import { Trans, useTranslation } from "react-i18next";
import { TFunction } from "i18next";

const Number = new Intl.NumberFormat("en", { style: "decimal" });

const TableStyled = styled(ReportTableStyled)`
  font-size: 12px;
  td {
    text-align: right;
  }

  tr:nth-child(1) > th:nth-child(n + 1) {
    text-align: center;
  }

  tr:nth-child(2) > th:nth-child(n + 1) {
    text-align: center;
  }

  tr > td:nth-child(1),
  tr > th:nth-child(1) {
    border-right: 1px solid #777;
  }

  tr:nth-child(1) > th:nth-child(2) {
    border-right: 1px solid #777;
  }

  tr > td:nth-child(3),
  tr > th:nth-child(3) {
    border-right: 1px solid #777;
  }
  tr > td:nth-child(5),
  tr > th:nth-child(5) {
    border-right: 1px solid #777;
  }
`;

export const SizeCard = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();
  const metricGroup = project.getMetricGroup("boundaryAreaOverlap", t);

  const notFoundString = t("Results not found");

  /* i18next-extract-disable-next-line */
  const planningUnitName = t(project.basic.planningAreaName);
  return (
    <ResultsCard
      title={t("Size")}
      functionName="boundaryAreaOverlap"
      useChildCard
    >
      {(data: ReportResult) => {
        if (Object.keys(data).length === 0) throw new Error(notFoundString);

        return (
          <>
            <ToolbarCard
              title={t("Size")}
              items={
                <>
                  <DataDownload
                    filename="size"
                    data={data.metrics}
                    formats={["csv", "json"]}
                    placement="left-end"
                  />
                </>
              }
            >
              <p>
                <Trans i18nKey="SizeCard - introduction">
                  This report summarizes plan overlap with
                </Trans>{" "}
                {planningUnitName}.
              </p>
              {genSingleSizeTable(data, metricGroup, t)}
              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genNetworkSizeTable(data, metricGroup, t)}
                </Collapse>
              )}
              <Collapse title={t("Learn more")}>
                <p>
                  <img
                    src={require("../assets/img/territorial_waters.png")}
                    style={{ maxWidth: "100%" }}
                  />
                  <a
                    target="_blank"
                    href="https://en.wikipedia.org/wiki/Territorial_waters"
                  >
                    <Trans i18nKey="SizeCard - learn more source">
                      Source: Wikipedia - Territorial Waters
                    </Trans>
                  </a>
                </p>
                <Trans i18nKey="SizeCard - learn more">
                  <p>🎯 Planning Objective: No specific objective</p>
                  <p>🗺️ Source Data: HELCOM</p>
                  <p>
                    📈 Report: The total area of the plan was calculated, along
                    with the total area under high protection and total area
                    under medium protection. Overlap was only counted once, and
                    if zones of different protection levels overlap, only the
                    highest protection level is counted.
                  </p>
                </Trans>
              </Collapse>
            </ToolbarCard>
          </>
        );
      }}
    </ResultsCard>
  );
};

const genSingleSizeTable = (
  data: ReportResult,
  mg: MetricGroup,
  t: TFunction
) => {
  const boundaryLabel = t("Boundary");
  const foundWithinLabel = t("Found Within Plan");
  const areaWithinLabel = t("Area Within Plan");
  const areaPercWithinLabel = t("% Within Plan");
  const mapLabel = t("Map");
  const sqKmLabel = t("km²");

  const classesById = keyBy(mg.classes, (c) => c.classId);
  let singleMetrics = data.metrics.filter(
    (m) => m.sketchId === data.sketch.properties.id
  );

  const boundaryTotalMetrics = project.getPrecalcMetrics(mg, "area");

  const finalMetrics = sortMetricsDisplayOrder(
    [
      ...singleMetrics,
      ...toPercentMetric(
        singleMetrics,
        boundaryTotalMetrics,
        project.getMetricGroupPercId(mg)
      ),
    ],
    "classId",
    ["eez", "offshore", "contiguous"]
  );

  return (
    <>
      <ClassTable
        rows={finalMetrics}
        metricGroup={mg}
        columnConfig={[
          {
            columnLabel: " ",
            type: "class",
            width: 25,
          },
          {
            columnLabel: areaWithinLabel,
            type: "metricValue",
            metricId: mg.metricId,
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
            columnLabel: areaPercWithinLabel,
            type: "metricChart",
            metricId: project.getMetricGroupPercId(mg),
            valueFormatter: "percent",
            chartOptions: {
              showTitle: true,
              showTargetLabel: true,
              targetLabelPosition: "bottom",
              targetLabelStyle: "tight",
              barHeight: 11,
            },
            width: 35,
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
            type: "layerToggle",
            width: 10,
            columnLabel: mapLabel,
          },
        ]}
      />
    </>
  );
};

const genNetworkSizeTable = (
  data: ReportResult,
  mg: MetricGroup,
  t: TFunction
) => {
  const sketches = toNullSketchArray(data.sketch);
  const sketchesById = keyBy(sketches, (sk) => sk.properties.id);
  const sketchIds = sketches.map((sk) => sk.properties.id);
  const sketchMetrics = data.metrics.filter(
    (m) => m.sketchId && sketchIds.includes(m.sketchId)
  );

  const boundaryTotalMetrics = project.getPrecalcMetrics(mg, "area");

  const finalMetrics = [
    ...sketchMetrics,
    ...toPercentMetric(
      sketchMetrics,
      boundaryTotalMetrics,
      project.getMetricGroupPercId(mg)
    ),
  ];

  const aggMetrics = nestMetrics(finalMetrics, [
    "sketchId",
    "classId",
    "metricId",
  ]);
  // Use sketch ID for each table row, index into aggMetrics
  const rows = Object.keys(aggMetrics).map((sketchId) => ({
    sketchId,
  }));

  const classColumns: Column<{ sketchId: string }>[] = mg.classes.map(
    (curClass, index) => {
      /* i18next-extract-disable-next-line */
      const transString = t(curClass.display);
      return {
        Header: transString,
        style: { color: "#777" },
        columns: [
          {
            Header: t("Area") + " ".repeat(index),
            accessor: (row) => {
              const value =
                aggMetrics[row.sketchId][curClass.classId as string][
                  mg.metricId
                ][0].value;
              return (
                Number.format(Math.round(squareMeterToKilometer(value))) +
                " " +
                t("km²")
              );
            },
          },
          {
            Header: t("% Area") + " ".repeat(index),
            accessor: (row) => {
              const value =
                aggMetrics[row.sketchId][curClass.classId as string][
                  project.getMetricGroupPercId(mg)
                ][0].value;
              return percentWithEdge(value);
            },
          },
        ],
      };
    }
  );

  const columns: Column<any>[] = [
    {
      Header: " ",
      accessor: (row) => <b>{sketchesById[row.sketchId].properties.name}</b>,
    },
    ...classColumns,
  ];

  return (
    <TableStyled>
      <Table columns={columns} data={rows} />
    </TableStyled>
  );
};

/**
 * SizeCard as a top-level report client
 */
export const SizeCardReportClient = () => {
  return (
    <Translator>
      <SizeCard />
    </Translator>
  );
};
