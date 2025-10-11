import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import studentResultsReducer from "../features/studentResults/studentResultsSlice"; // ✅ reducer, not thunk
import studentCourseReducer from "../features/studentCourses/studentCoursesSlice";
import lecturerDashboardReducer from "../features/lecturerDashboard/lecturerDashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    studentResults: studentResultsReducer,
    studentCourses: studentCourseReducer,
    lecturerDashboard: lecturerDashboardReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
