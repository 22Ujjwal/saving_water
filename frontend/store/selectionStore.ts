'use client'

import { create } from 'zustand'
import type { AppSelectionState } from '@/types/state'
import type { RoiResult } from '@/types/roi'
import type { InvestmentBrief } from '@/types/brief'

type SelectionStore = AppSelectionState & {
  roiResult: RoiResult | null
  roiLoading: boolean
  brief: InvestmentBrief | null
  briefLoading: boolean

  setSelectedState: (id: string | null) => void
  setSelectedMetro: (id: string | null) => void
  setSelectedBuilding: (id: string | null) => void
  setMapMode: (mode: AppSelectionState['mapMode']) => void
  setFilter: (key: keyof AppSelectionState['filters'], value: boolean | number) => void
  setRoiResult: (result: RoiResult | null) => void
  setRoiLoading: (loading: boolean) => void
  setBrief: (brief: InvestmentBrief | null) => void
  setBriefLoading: (loading: boolean) => void
  reset: () => void
}

const defaultFilters: AppSelectionState['filters'] = {
  roofAboveThreshold: false,
  coolingTowerOnly: false,
  highWaterCostOnly: false,
  esgPrioritizedOnly: false,
  minViabilityScore: 0,
  minCvConfidence: 0,
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedStateId: null,
  selectedMetroId: null,
  selectedBuildingId: null,
  mapMode: 'national',
  filters: defaultFilters,
  roiResult: null,
  roiLoading: false,
  brief: null,
  briefLoading: false,

  setSelectedState: (id) =>
    set({
      selectedStateId: id,
      selectedMetroId: null,
      selectedBuildingId: null,
      mapMode: id ? 'state' : 'national',
      roiResult: null,
      brief: null,
    }),

  setSelectedMetro: (id) =>
    set({
      selectedMetroId: id,
      selectedBuildingId: null,
      mapMode: id ? 'metro' : 'state',
      roiResult: null,
      brief: null,
    }),

  setSelectedBuilding: (id) =>
    set({
      selectedBuildingId: id,
      mapMode: id ? 'building' : 'metro',
      roiResult: null,
      brief: null,
    }),

  setMapMode: (mode) => set({ mapMode: mode }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setRoiResult: (result) => set({ roiResult: result }),
  setRoiLoading: (loading) => set({ roiLoading: loading }),
  setBrief: (brief) => set({ brief }),
  setBriefLoading: (loading) => set({ briefLoading: loading }),

  reset: () =>
    set({
      selectedStateId: null,
      selectedMetroId: null,
      selectedBuildingId: null,
      mapMode: 'national',
      filters: defaultFilters,
      roiResult: null,
      roiLoading: false,
      brief: null,
      briefLoading: false,
    }),
}))
