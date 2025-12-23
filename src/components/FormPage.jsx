import React, { useState } from "react";
import { useParams } from "react-router-dom";
import GeneralApplicationForm from "./Applications/GeneralForm";
import WaterApplicationForm from "./Applications/WaterForm";
import HouseApplicationForm from "./Applications/HouseConstruction";

const FormPage = () => {
  const { slug } = useParams();
  switch (slug) {
    case "general":
      return <GeneralApplicationForm />;

    case "water":
      return <WaterApplicationForm />;

    case "house":
      return <HouseApplicationForm />;

    case "rashan":
      return <GeneralApplicationForm />;

    case "masjid":
      return <GeneralApplicationForm />;

    default:
      return <div>Form not found</div>;
  }
};

export default FormPage;
