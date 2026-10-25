"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { FormData } from "../types/formTypes"

interface DraftState {
  // Store drafts by ID (or 'new' for a new form)
  drafts: Record<string, FormData>
  // Save draft data
  saveDraft: (formId: string, data: FormData) => void
  // Get draft data
  getDraft: (formId: string) => FormData | null
  // Paso (0-based, sin contar el de objetivo) en el que se dejó cada borrador. Va aparte de los datos
  // del formulario para no mezclarse con lo que se envía al backend.
  draftSteps: Record<string, number>
  saveDraftStep: (formId: string, step: number) => void
  getDraftStep: (formId: string) => number | null
  // Clear a specific draft
  clearDraft: (formId: string) => void
  // Clear all drafts
  clearAllDrafts: () => void
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},

      saveDraft: (formId, data) => {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [formId]: data,
          },
        }))
      },

      getDraft: (formId) => {
        const state = get()
        return state.drafts[formId] || null
      },

      draftSteps: {},

      saveDraftStep: (formId, step) => {
        set((state) => ({
          draftSteps: { ...state.draftSteps, [formId]: step },
        }))
      },

      getDraftStep: (formId) => {
        const step = get().draftSteps?.[formId]
        return typeof step === "number" ? step : null
      },

      clearDraft: (formId) => {
        set((state) => {
          const newDrafts = { ...state.drafts }
          delete newDrafts[formId]
          const newSteps = { ...state.draftSteps }
          delete newSteps[formId]
          return { drafts: newDrafts, draftSteps: newSteps }
        })
      },

      clearAllDrafts: () => {
        set({ drafts: {}, draftSteps: {} })
      },
    }),
    {
      name: "form-drafts-storage",
    },
  ),
)

