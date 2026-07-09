import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UiState, NavView, Toast } from "../../types";

const initialState: UiState = {
  activeView: "dashboard",
  sidebarCollapsed: false,
  toasts: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveView(state, action: PayloadAction<NavView>) {
      state.activeView = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    addToast(state, action: PayloadAction<Omit<Toast, "id">>) {
      const id = Date.now().toString();
      state.toasts.push({ id, ...action.payload });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { setActiveView, toggleSidebar, addToast, removeToast } =
  uiSlice.actions;
export default uiSlice.reducer;
