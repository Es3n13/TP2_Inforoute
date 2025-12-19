import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from 'axios';

// Types
interface User {
  id: number;
  username: string;
  email?: string;
  phone_number?: string;
  avatar?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  access: string | null;
  refresh: string | null;
  status: "idle" | "loading" | "succeeded" | "failed" | "registered";
  error: string | null;
  isAuthenticated: boolean;
  loading?: boolean;
}

const initialState: AuthState = {
  user: null,
  access: localStorage.getItem("access"),
  refresh: localStorage.getItem("refresh"),
  status: "idle",
  error: null,
  isAuthenticated: !!localStorage.getItem("access"),
};

// Async Thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("http://localhost:8000/auth/login/", { 
        username, 
        password 
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Erreur de connexion. Vérifiez vos identifiants."
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    { username, password, email, phone_number }: { username: string; password: string; email?: string; phone_number?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("http://localhost:8000/auth/register/", { 
        username, 
        password,
        email,
        phone_number, 
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.username?.[0] ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.password?.[0] ||
        error.response?.data?.detail ||
        "Erreur lors de l'inscription"
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { getState }) => {
    const token = (getState() as any).auth.access;
    const res = await axios.get("http://localhost:8000/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (
    payload: { email?: string; phone_number?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.access;
      if (!token) throw new Error("No token");

      const res = await axios.patch("http://localhost:8000/users/me/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || "Impossible de mettre à jour le profil"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    payload: { old_password: string; new_password: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.access;
      if (!token) throw new Error("No token");

      await axios.post(
        "http://localhost:8000/users/me/change-password/",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.new_password?.[0] ||
          "Impossible de changer le mot de passe"
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.access = null;
      state.refresh = null;
      state.status = "idle";
      state.error = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.access = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("access", action.payload);
    },
    setTokenPair: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.isAuthenticated = true;
      localStorage.setItem("access", action.payload.access);
      localStorage.setItem("refresh", action.payload.refresh);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
        state.isAuthenticated = true;

        localStorage.setItem("access", action.payload.access);
        localStorage.setItem("refresh", action.payload.refresh);
      })

     // Register
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

    // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

    // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { 
  logout, 
  setToken, 
  setTokenPair, 
  setUser, 
  clearError,
  resetStatus 
} = authSlice.actions;

export default authSlice.reducer;