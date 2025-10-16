// src/features/student/studentSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../services/api";

export interface CourseItem {
  code: string;
  name: string;
  credits: number;
}

export interface SemesterResult {
  semesterName: string;
  core: CourseItem[];
  electives: CourseItem[];
  gradesByCode: Record<string, string>;
  gpa: number;
}

export interface StudentInfo {
  name: string;
  regNo: string;
  gradesByCode?: Record<string, string> | null;
}

export interface StudentResultsSheet {
  university: string;
  facultyLine: string;
  specialization: string;
  sheetTitle: string;
  provisionalLine: string;
  semesters: SemesterResult[];
  student: StudentInfo;
  note: string;
}

interface StudentState {
  resultsSheet?: StudentResultsSheet;
  loading: boolean;
  error?: string;
}

const initialState: StudentState = {
  resultsSheet: undefined,
  loading: false,
  error: undefined,
};

// Async thunk to fetch results sheet
export const fetchStudentResultsSheet = createAsyncThunk<
  StudentResultsSheet,
  number, // studentId
  { rejectValue: string }
>("student/fetchResultsSheet", async (userId, thunkAPI) => {
  try {
    const response = await api.get(`/students/${userId}/results-sheet`);
    // unwrap your data from backend
    return response.data.data as StudentResultsSheet;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Failed to fetch results");
  }
});

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearStudentData: (state) => {
      state.resultsSheet = undefined;
      state.loading = false;
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentResultsSheet.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        fetchStudentResultsSheet.fulfilled,
        (state, action: PayloadAction<StudentResultsSheet>) => {
          state.resultsSheet = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchStudentResultsSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error fetching results";
      });
  },
});

export const { clearStudentData } = studentSlice.actions;
export default studentSlice.reducer;
