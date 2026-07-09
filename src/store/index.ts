import { configureStore } from "@reduxjs/toolkit";
import uiReducer      from "./slices/uiSlice";
import patientReducer from "./slices/patientSlice";
import reportReducer  from "./slices/reportSlice";
import formReducer    from "./slices/formSlice";
import authReducer    from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    ui:       uiReducer,
    patients: patientReducer,
    reports:  reportReducer,
    form:     formReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState   = ReturnType<typeof store.getState>;
