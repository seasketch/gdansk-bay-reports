import React from "react";
import { EcosystemServices } from "./EcosystemServices";
import { EcologicalValue } from "./EcologicalValue";
import { GeoProp } from "../types";

const ReportPage: React.FunctionComponent<GeoProp> = (props) => {
  return (
    <>
      <EcosystemServices geographyId={props.geographyId} />
      <EcologicalValue geographyId={props.geographyId} />
    </>
  );
};

export default ReportPage;
