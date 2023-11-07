import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { ImpactAreas } from "./ImpactAreas";
import { FishingEffort } from "./FishingEffort";
import { ShippingDensity } from "./ShippingDensity";
import { GeoProp } from "../types";

const ReportPage: React.FunctionComponent<GeoProp> = (props) => {
  return (
    <>
      <SizeCard geographyId={props.geographyId} />
      <ImpactAreas geographyId={props.geographyId} />
      <FishingEffort geographyId={props.geographyId} />
      <ShippingDensity geographyId={props.geographyId} />
      <SketchAttributesCard autoHide />
    </>
  );
};

export default ReportPage;
