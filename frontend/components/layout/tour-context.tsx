"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SpotlightTour } from "@/components/layout/spotlight-tour";

interface TourContextType {
  isTourOpen: boolean;
  startTour: () => void;
  closeTour: () => void;
}

const TourContext = createContext<TourContextType>({
  isTourOpen: false,
  startTour: () => {},
  closeTour: () => {},
});

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const forceTour =
      urlParams.get("tour") === "true" ||
      urlParams.get("tour") === "1" ||
      sessionStorage.getItem("moukawil_demo_login") === "true";
    const tourShown = sessionStorage.getItem("moukawil_session_tour_shown");

    if (forceTour || !tourShown) {
      sessionStorage.setItem("moukawil_session_tour_shown", "true");
      sessionStorage.removeItem("moukawil_demo_login");
      if (urlParams.has("tour")) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
      const timer = setTimeout(() => setIsTourOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        startTour: () => setIsTourOpen(true),
        closeTour: () => setIsTourOpen(false),
      }}
    >
      {children}
      {/* Exactly one tour instance rendered globally to prevent overlapping cards */}
      <SpotlightTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}
