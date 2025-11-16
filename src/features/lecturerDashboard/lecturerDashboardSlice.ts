import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Backend integration removed: keep UI only
// import api from "../../services/api";

interface MarksRange {
  studentCounts: number[]; // e.g., [1,0,3,6,0]
}

interface PassFailPercentage {
  passCount: number;
  failCount: number;
}

interface AnalyticsData {
  [key: string]: {
    passFailPercentage: PassFailPercentage;
    marksRange: MarksRange;
  };
}

interface AvailableCourse {
  courseId: string;
  courseDisplayName: string;
}

interface CardsData {
  currentlyAssignedCourses: number;
  totalEnrolledStudents: number;
  managingSemesters: string[];
}

interface LecturerDashboardData {
  cards: CardsData;
  availableCourses: AvailableCourse[];
  analyticsData: AnalyticsData;
}

interface LecturerDashboardState {
  loading: boolean;
  error: string | null;
  data: LecturerDashboardData | null;
  selectedCourseId: string | null;
}

const initialState: LecturerDashboardState = {
  loading: false,
  error: null,
  data: null,
  selectedCourseId: null,
};

// ✅ Thunk: fetch lecturer dashboard data by lecturerId
export const fetchLecturerDashboard = createAsyncThunk(
  "lecturerDashboard/fetch",
  async (lecturerId: number, { rejectWithValue }) => {
    try {
      // Integration removed: return empty dashboard data
      const empty: LecturerDashboardData = {
        cards: {
          currentlyAssignedCourses: 0,
          totalEnrolledStudents: 0,
          managingSemesters: [],
        },
        availableCourses: [],
        analyticsData: {},
      };
      return empty;
    } catch (err: any) {
      return rejectWithValue("Failed to fetch lecturer dashboard");
    }
  }
);

const lecturerDashboardSlice = createSlice({
  name: "lecturerDashboard",
  initialState,
  reducers: {
    setSelectedCourse: (state, action) => {
      state.selectedCourseId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLecturerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLecturerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        // set first course as default
        state.selectedCourseId =
          action.payload.availableCourses[0]?.courseId ?? null;
      })
      .addCase(fetchLecturerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCourse } = lecturerDashboardSlice.actions;
export default lecturerDashboardSlice.reducer;
