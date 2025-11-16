import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
// Backend integration removed: keep UI only
// import api from "../../services/api";

// Component-level marks within a course (Assignment, Project, Quiz 1, etc.)
export interface CourseComponentMark {
  componentName: string;
  maxMarks: number;
  obtainedMarks: number;
}

// Course CA entry matching backend
export interface CourseCAEntry {
  code: string;
  name: string;
  components: CourseComponentMark[];
  total?: number; // optional; frontend can sum obtained
  status?: string; // "PASS" | "FAIL"
}

export interface SemesterCA {
  semesterNumber: number; // 1..n
  semesterName: string; // e.g., "Semester 1"
  ca: CourseCAEntry[];
}

export interface StudentHeaderInfo {
  name: string;
  regNo: string;
  departmentName?: string;
  batchName?: string;
}

export interface StudentCASheet {
  university: string;
  departmentLine: string;
  batchText: string;
  sheetTitle: string;
  student: StudentHeaderInfo;
  semesters: SemesterCA[];
}

interface StudentCAState {
  loading: boolean;
  error?: string;
  sheet?: StudentCASheet;
}

const initialState: StudentCAState = {
  loading: false,
  error: undefined,
  sheet: undefined,
};

// Fetch CA results using provided endpoint with query param
export const fetchStudentCAByUser = createAsyncThunk<
  StudentCASheet,
  number,
  { rejectValue: string }
>("studentCA/fetchByUser", async (userId, thunkAPI) => {
  try {
    // Integration removed: return empty CA sheet
    const empty: StudentCASheet = {
      university: "",
      departmentLine: "",
      batchText: "",
      sheetTitle: "",
      student: { name: "", regNo: "" },
      semesters: [],
    };
    return empty;
  } catch (err: any) {
    return thunkAPI.rejectWithValue("Failed to fetch CA marks");
  }
});

const studentCASlice = createSlice({
  name: "studentCA",
  initialState,
  reducers: {
    clearStudentCA(state) {
      state.sheet = undefined;
      state.loading = false;
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentCAByUser.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        fetchStudentCAByUser.fulfilled,
        (state, action: PayloadAction<StudentCASheet>) => {
          state.sheet = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchStudentCAByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Error fetching CA marks";
      });
  },
});

export const { clearStudentCA } = studentCASlice.actions;

// Selectors
export const selectCASheet = (state: any) =>
  state.studentCA.sheet as StudentCASheet | undefined;

export const selectCASemester = (state: any, semesterNumber: number) => {
  const sheet: StudentCASheet | undefined = state.studentCA.sheet;
  if (!sheet) return undefined;
  return sheet.semesters.find((s) => s.semesterNumber === semesterNumber);
};

export default studentCASlice.reducer;
