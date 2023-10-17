import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { ImpactAreas } from "./ImpactAreas";
import { FishingEffort } from "./FishingEffort";
import { ShippingDensity } from "./ShippingDensity";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      <ImpactAreas />
      <FishingEffort />
      <ShippingDensity />
      <SketchAttributesCard autoHide />
    </>
  );
};

export default ReportPage;
