/**
 * TourEntry — /tour route. Activates WildFire Tour mode and redirects to Archipelago.
 * K358 / B092.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useArchipelagoTour } from "@/contexts/ArchipelagoTourContext";

const TourEntry = () => {
  const navigate = useNavigate();
  const { startTour } = useArchipelagoTour();

  useEffect(() => {
    startTour();
    navigate("/hexisle", { replace: true });
  }, [startTour, navigate]);

  return null;
};

export default TourEntry;
