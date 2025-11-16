import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Backend integration removed: keep UI only
// import api from "../../services/api";

interface Course {
  code: string;
  name: string;
  credits: number;
  status: string;
}

interface Semester {
  semesterName: string;
  courses: Course[];
}

interface Student {
  id: number;
  name: string;
  registrationNumber: string;
  batchName: string;
  departmentName: string;
}

interface StudentCoursesState {
  loading: boolean;
  error: string | null;
  student: Student | null;
  semesters: Semester[];
}

const initialState: StudentCoursesState = {
  loading: false,
  error: null,
  student: null,
  semesters: [],
};

/**
 * Fetch Student Courses by userId
 * Uses global api.ts with Authorization header + error handling
 */
export const fetchStudentCourses = createAsyncThunk(
  "studentCourses/fetchByUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      // Integration removed: return empty student + semesters
      return { student: null, semesters: [] } as any;
    } catch (error: any) {
      return rejectWithValue("Failed to fetch student courses");
    }
  }
);

const studentCoursesSlice = createSlice({
  name: "studentCourses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload.student;
        state.semesters = action.payload.semesters;
      })
      .addCase(fetchStudentCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default studentCoursesSlice.reducer;
