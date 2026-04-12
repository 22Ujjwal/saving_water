import React from "react";
import { SelectionState } from "./ProspectingDashboard";
import StateSummaryPanel from "../panels/StateSummaryPanel";
import MetroSummaryPanel from "../panels/MetroSummaryPanel";
import BuildingListPanel from "../panels/BuildingListPanel";
import BuildingProfilePanel from "../panels/BuildingProfilePanel";
import { BuildingCandidate } from "@/types/building";
import { StateScore } from "@/types/state";
import { RoiResult } from "@/types/roi";
import { BriefResult } from "@/types/brief";
import RoiPreviewPanel from "../panels/RoiPreviewPanel";
import BriefPreviewPanel from "../panels/BriefPreviewPanel";

type RightPanelProps = {
  selection: SelectionState;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
  buildings: BuildingCandidate[];
  filteredBuildings: BuildingCandidate[];
  stateScores: StateScore[];
  roiResult: RoiResult | null;
  isCalculatingRoi: boolean;
  roiError: string | null;
  onCalculateRoi: (building: BuildingCandidate) => void;
  briefResult: BriefResult | null;
  isGeneratingBrief: boolean;
  briefError: string | null;
  onGenerateBrief: (building: BuildingCandidate) => void;
};

export default function RightPanel(props: RightPanelProps) {
  const { selection, setSelection } = props;

  if (selection.mapMode === "national") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 bg-gray-950">
        <div className="text-gray-400 text-3xl mb-3">↗</div>
        <p className="text-[15px] font-semibold text-white mb-2">Click any state to begin</p>
        <p className="text-[13px] text-gray-400 leading-relaxed">
          States are scored by market readiness. Select one to view metrics and top metros.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 overflow-y-auto">
      {selection.mapMode === "state" && (
        <div className="p-4 space-y-3">
          <StateSummaryPanel selection={selection} stateScores={props.stateScores} />
          <MetroSummaryPanel selection={selection} setSelection={setSelection} stateScores={props.stateScores} />
        </div>
      )}

      {selection.mapMode === "metro" && (
        <div className="p-4 h-full flex flex-col">
          <BuildingListPanel
            selection={selection}
            setSelection={setSelection}
            filteredBuildings={props.filteredBuildings}
          />
        </div>
      )}

      {selection.mapMode === "building" && (
        <div className="flex flex-col">
          <BuildingProfilePanel
            selection={selection}
            filteredBuildings={props.filteredBuildings}
            isCalculatingRoi={props.isCalculatingRoi}
            onCalculateRoi={props.onCalculateRoi}
            isGeneratingBrief={props.isGeneratingBrief}
            onGenerateBrief={props.onGenerateBrief}
          />
          {(props.roiResult || props.isCalculatingRoi || props.roiError) && (
            <div className="px-4 pb-4">
              <RoiPreviewPanel
                roiResult={props.roiResult}
                loading={props.isCalculatingRoi}
                error={props.roiError}
              />
            </div>
          )}
          {(props.briefResult || props.isGeneratingBrief || props.briefError) && (
            <div className="px-4 pb-4">
              <BriefPreviewPanel
                briefResult={props.briefResult}
                loading={props.isGeneratingBrief}
                error={props.briefError}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
