import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../services/api";

export type AllocationItem = {
  allocationId: number;
  courseType: string;
  course: {
    id: number;
    courseCode: string;
    courseName: string;
    credits?: number;
  };
  semester: {
    id: number;
    name: string;
    number?: number;
    year?: number;
    batchName?: string;
  };
};

export type CAHeader = {
  allocationId: number;
  courseType: string;
  course: {
    id: number;
    courseCode: string;
    courseName: string;
    credits?: number;
  };
  semester: {
    id: number;
    name: string;
    number?: number;
    year?: number;
    batchName?: string;
  };
  lecturer?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  assessments: Array<{
    assessmentId: number;
    assessmentTypeId: number;
    assessmentTypeName: string;
    group: string; // CA
    title: string;
    maxMarks: number;
    weight?: number;
    date?: string;
  }>;
  totals?: {
    caMaxTotal?: number;
    caWeightTotal?: number;
    overallPassPercent?: number;
  };
};

export type CAStudentRow = {
  studentId: number;
  regNo: string;
  name: string;
  marksByAssessmentId: Record<string, number>;
  total?: number;
  percentage?: number;
  status?: string;
};

export type EndExamHeader = {
  allocationId: number;
  courseType: string;
  course: {
    id: number;
    courseCode: string;
    courseName: string;
    credits?: number;
  };
  semester: {
    id: number;
    name: string;
    number?: number;
    year?: number;
    batchName?: string;
  };
  lecturer?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  endExam?: { maxMarks: number; weight?: number };
  passRules?: {
    caPassPercent?: number;
    endExamPassPercent?: number;
    overallPassPercent?: number;
  };
};

export type EndExamStudentRow = {
  studentId: number;
  regNo: string;
  name: string;
  endExamMarks?: number;
  endExamMax?: number;
  endExamPercentage?: number;
  caTotal?: number;
  overallTotal?: number;
  grade?: string;
  status?: string;
};

export type ResultsPreviewCAResponse = {
  header: CAHeader;
  students: CAStudentRow[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

export type ResultsPreviewEndResponse = {
  header: EndExamHeader;
  students: EndExamStudentRow[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

type ResultsType = "CA" | "END_EXAM";

export const fetchAllocationsByLecturer = createAsyncThunk<
  AllocationItem[],
  number,
  { rejectValue: string }
>("resultsPreview/fetchAllocationsByLecturer", async (lecturerId, thunkAPI) => {
  try {
    // Try non-/api path by escaping base '/api' with ../
    const res = await api.get(`../lecturers/${lecturerId}/allocations`);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? (data as AllocationItem[]) : [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message ?? "Failed to fetch allocations"
    );
  }
});

export const fetchResultsPreview = createAsyncThunk<
  ResultsPreviewCAResponse | ResultsPreviewEndResponse,
  {
    allocationId: number;
    type: ResultsType;
    page?: number;
    size?: number;
    includeMeta?: boolean;
  },
  { rejectValue: string }
>("resultsPreview/fetchResults", async (args, thunkAPI) => {
  const { allocationId, type, page = 0, size = 50, includeMeta = true } = args;
  try {
    const res = await api.get(`../results/preview`, {
      params: { allocationId, type, page, size, includeMeta },
    });
    const data = res.data?.data ?? res.data;
    return data as ResultsPreviewCAResponse | ResultsPreviewEndResponse;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message ?? "Failed to fetch results preview"
    );
  }
});

interface ResultsPreviewState {
  allocations: AllocationItem[];
  allocationsLoading: boolean;
  allocationsError?: string;

  results?: ResultsPreviewCAResponse | ResultsPreviewEndResponse;
  resultsLoading: boolean;
  resultsError?: string;
}

const initialState: ResultsPreviewState = {
  allocations: [],
  allocationsLoading: false,
  allocationsError: undefined,
  results: undefined,
  resultsLoading: false,
  resultsError: undefined,
};

const resultsPreviewSlice = createSlice({
  name: "resultsPreview",
  initialState,
  reducers: {
    clearResults(state) {
      state.results = undefined;
      state.resultsError = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocationsByLecturer.pending, (state) => {
        state.allocationsLoading = true;
        state.allocationsError = undefined;
      })
      .addCase(
        fetchAllocationsByLecturer.fulfilled,
        (state, action: PayloadAction<AllocationItem[]>) => {
          state.allocations = action.payload;
          state.allocationsLoading = false;
        }
      )
      .addCase(fetchAllocationsByLecturer.rejected, (state, action) => {
        state.allocationsLoading = false;
        state.allocationsError = action.payload;
      })
      .addCase(fetchResultsPreview.pending, (state) => {
        state.resultsLoading = true;
        state.resultsError = undefined;
      })
      .addCase(
        fetchResultsPreview.fulfilled,
        (
          state,
          action: PayloadAction<
            ResultsPreviewCAResponse | ResultsPreviewEndResponse
          >
        ) => {
          state.results = action.payload;
          state.resultsLoading = false;
        }
      )
      .addCase(fetchResultsPreview.rejected, (state, action) => {
        state.resultsLoading = false;
        state.resultsError = action.payload;
      });
  },
});

export const { clearResults } = resultsPreviewSlice.actions;
export default resultsPreviewSlice.reducer;
