// src/features/lecturerCourses/lecturerCoursesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Course } from "./course";

interface LecturerCoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: LecturerCoursesState = {
  courses: [],
  loading: false,
  error: null,
};

export const fetchLecturerCourses = createAsyncThunk<
  Course[],
  number,
  { rejectValue: string }
>(
  "lecturerCourses/fetchLecturerCourses",
  async (_userId: number, { rejectWithValue }) => {
    try {
      return [] as Course[];
    } catch (err: any) {
      return rejectWithValue("Error fetching courses");
    }
  }
);

const lecturerCoursesSlice = createSlice({
  name: "lecturerCourses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLecturerCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLecturerCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
        state.loading = false;
      })
      .addCase(fetchLecturerCourses.rejected, (state, action) => {
        state.error = (action.payload as string) ?? action.error.message ?? "Failed to fetch courses";
        state.loading = false;
      });
  },
});

export default lecturerCoursesSlice.reducer;

