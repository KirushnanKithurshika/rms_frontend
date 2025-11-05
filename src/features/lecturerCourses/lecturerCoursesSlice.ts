// src/features/lecturerCourses/lecturerCoursesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
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

export const fetchLecturerCourses = createAsyncThunk(
  "lecturerCourses/fetchLecturerCourses",
  async (lecturerId: number, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/v1/course-allocations/GetCoursesForLecturer/${lecturerId}`
      );
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error fetching courses");
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
        // 👇 Fix: unwrap .data if exists
        state.courses = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data ?? [];
        state.loading = false;
      })
      .addCase(fetchLecturerCourses.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to fetch courses";
        state.loading = false;
      });
  },
});

export default lecturerCoursesSlice.reducer;
