import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { ImpactAreas } from "./ImpactAreas";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      <ImpactAreas />
      <SketchAttributesCard autoHide />
    </>
  );
};

export default ReportPage;
