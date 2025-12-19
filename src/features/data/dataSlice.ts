import { createSlice, createAsyncThunk, PayloadAction, configureStore } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

// Types pour les données
export interface Resource {
  id: number;
  name: string;
  description: string;
  format: string;
  url: string;
  resource_type: string;
}

export interface Dataset {
  ckan_id: string;
  name: string;
  title: string;
  notes: string;
  author: string;
  organization_title: string;
  license_title: string;
  metadata_created: string;
  metadata_modified: string;
  state: string;
  private: boolean;
  tags: string[];
  groups: string[];
  resources: Resource[];
}

export type RootState = {
  data: DataState;
};

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface Filters {
  search: string;
  organization: string;
  license: string;
  tags: string[];
}

export interface Statistics {
  total_datasets?: number;
  total_resources?: number;
  organizations_count?: number;
  licenses_count?: number;
  [key: string]: any;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  current_page?: number;
  page_size?: number;
  [key: string]: any;
}

export interface DatasetsResponse extends ApiResponse<Dataset> {}

export interface DatasetDetailResponse extends Dataset {}

export interface ResourcesResponse extends ApiResponse<Resource> {}

// Types pour l'état
interface DataState {
  datasets: {
    list: Dataset[];
    currentDataset: Dataset | null;
    pagination: Pagination;
    filters: Filters;
    loading: boolean;
    error: string | null;
  };
  resources: {
    list: Resource[];
    pagination: Omit<Pagination, 'pageSize'>;
    loading: boolean;
    error: string | null;
  };
  statistics: {
    data: Statistics | null;
    loading: boolean;
    error: string | null;
  };
}

// Configuration Axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types pour les paramètres des thunks
interface FetchDatasetsParams {
  page?: number;
  search?: string;
  filters?: Partial<Filters>;
}

// Async Thunks
export const fetchDatasets = createAsyncThunk(
  'data/fetchDatasets',
  async ({ page = 1, search = '', filters = {} }: FetchDatasetsParams, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      
      // Ajoute les paramètres de base
      params.append('page', page.toString());
      
      // Ajouter la recherche
      if (search) {
        params.append('search', search);
      }
      
      // Ajouter les filtres un par un
      if (filters.organization) {
        params.append('organization', filters.organization);
      }
      
      if (filters.license) {
        params.append('license', filters.license);
      }
      
      // Gérer les tags comme tableau
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => {
          params.append('tags', tag);
        });
      }
      
      const response = await api.get<DatasetsResponse>(`/datasets/?${params.toString()}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchDatasetDetail = createAsyncThunk(
  "data/fetchDatasetDetail",
  async (ckanId: string) => {
    const res = await axios.get(
      `http://localhost:8000/api/datasets/${ckanId}/`
    );
    return res.data;
  }
);

export const fetchResources = createAsyncThunk(
  'data/fetchResources',
  async ({ page = 1 }: { page?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get<ResourcesResponse>(`/resources/?page=${page}`);
      
      return {
        results: response.data.results || [],
        count: response.data.count || 0,
        current_page: response.data.current_page || page,
        ...response.data
      } as ResourcesResponse;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const calculateStatsFromLoadedData = createAsyncThunk(
  'data/calculateStatsFromLoadedData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const datasets = state.data.datasets.list;
      
      if (!datasets || datasets.length === 0) {
        return {
          total_datasets: 0,
          organizations_count: 0,
          total_resources: 0,
        };
      }
      
      // Calculer les statistiques
      const uniqueOrganizations = new Set<string>();
      let totalResources = 0;
      
      datasets.forEach((dataset: Dataset) => {
        if (dataset.organization_title) {
          uniqueOrganizations.add(dataset.organization_title);
        }
        if (dataset.resources) {
          totalResources += dataset.resources.length;
        }
      });
      
      return {
        total_datasets: datasets.length,
        organizations_count: uniqueOrganizations.size,
        total_resources: totalResources,
      };
    } catch (error) {
      return rejectWithValue('Erreur de calcul des statistiques');
    }
  }
);

export const calculateStatistics = createAsyncThunk(
  'data/calculateStatistics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const datasets = state.data.datasets.list;
      
      const uniqueOrganizations = new Set(
        datasets.map(d => d.organization_title).filter(Boolean)
      );
      
      const totalResources = datasets.reduce(
        (sum, dataset) => sum + (dataset.resources?.length || 0), 0
      );
      
      return {
        total_datasets: datasets.length,
        organizations_count: uniqueOrganizations.size,
        total_resources: totalResources,
      };
    } catch (error) {
      return rejectWithValue('Erreur lors du calcul des statistiques');
    }
  }
);

// Pour GraphQL
export const fetchGraphQLData = createAsyncThunk(
  'data/fetchGraphQLData',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/graphql/', { query });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Initial state
const initialState: DataState = {
  datasets: {
    list: [],
    currentDataset: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 10,
    },
    filters: {
      search: '',
      organization: '',
      license: '',
      tags: [],
    },
    loading: false,
    error: null,
  },
  resources: {
    list: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
    loading: false,
    error: null,
  },
  statistics: {
    data: null,
    loading: false,
    error: null,
  },
};

interface SetFiltersPayload {
  search?: string;
  organization?: string;
  tags?: string[];
}

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.datasets.filters.search = action.payload;
    },
    setOrganizationFilter: (state, action: PayloadAction<string>) => {
      state.datasets.filters.organization = action.payload;
    },
    setLicenseFilter: (state, action: PayloadAction<string>) => {
      state.datasets.filters.license = action.payload;
    },
    setTagFilter: (state, action: PayloadAction<string[]>) => {
      state.datasets.filters.tags = action.payload;
    },
    setFilters: (state, action: PayloadAction<SetFiltersPayload>) => {
      state.datasets.filters = {
        ...state.datasets.filters,
        ...action.payload,
      };
    },
    clearFilters: (state) => {
      state.datasets.filters = initialState.datasets.filters;
    },
    clearCurrentDataset: (state) => {
      state.datasets.currentDataset = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.datasets.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchDatasets
    builder
      .addCase(fetchDatasets.pending, (state) => {
        state.datasets.loading = true;
        state.datasets.error = null;
      })
      .addCase(fetchDatasets.fulfilled, (state, action: PayloadAction<DatasetsResponse | Dataset[]>) => {
        state.datasets.loading = false;
        
        const payload = action.payload;
        
        const isDatasetsResponse = (data: any): data is DatasetsResponse => {
            return data && 
                (data.results !== undefined || 
                    data.count !== undefined || 
                    data.next !== undefined || 
                    data.previous !== undefined);
        };
        
        if (isDatasetsResponse(payload)) {
            state.datasets.list = payload.results || [];
            
            if (payload.count !== undefined) {
            const pageSize = payload.page_size || 
                            (payload.results ? payload.results.length : 10) || 
                            10;
            
            let currentPage = 1;
            
            if (payload.next) {
                const nextPageMatch = payload.next.match(/page=(\d+)/);
                currentPage = nextPageMatch ? parseInt(nextPageMatch[1]) - 1 : 1;
            } else if (payload.previous) {
                const prevPageMatch = payload.previous.match(/page=(\d+)/);
                currentPage = prevPageMatch ? parseInt(prevPageMatch[1]) + 1 : 1;
            }
            
            state.datasets.pagination = {
                currentPage,
                totalPages: Math.ceil(payload.count / pageSize),
                totalItems: payload.count,
                pageSize,
            };
            }
        } else if (Array.isArray(payload)) {
            state.datasets.list = payload;
            state.datasets.pagination = {
            currentPage: 1,
            totalPages: 1,
            totalItems: payload.length,
            pageSize: payload.length,
            };
        } else {
            state.datasets.list = [];
        }
        })

    // fetchDatasetDetail
    builder
      .addCase(fetchDatasetDetail.pending, (state) => {
        state.datasets.loading = true;
        state.datasets.error = null;
      })
      .addCase(fetchDatasetDetail.fulfilled, (state, action) => {
        state.datasets.loading = false;
        state.datasets.currentDataset = action.payload;
      })
      .addCase(fetchDatasetDetail.rejected, (state, action) => {
        state.datasets.loading = false;
        state.datasets.error = action.payload as string || 'Erreur lors du chargement du dataset';
      });

    // fetchResources
    builder
      .addCase(fetchResources.pending, (state) => {
        state.resources.loading = true;
        state.resources.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resources.loading = false;
        
        const payload = action.payload as ResourcesResponse;
        
        state.resources.list = payload.results || [];
        
        if (payload.count !== undefined) {
            const pageSize = 10;
            
            state.resources.pagination = {
            currentPage: payload.current_page || 1,
            totalPages: Math.ceil(payload.count / pageSize),
            totalItems: payload.count,
            };
        }
        })
      .addCase(fetchResources.rejected, (state, action) => {
        state.resources.loading = false;
        state.resources.error = action.payload as string || 'Erreur lors du chargement des ressources';
      });
  },
});

export const {
  setSearchFilter,
  setOrganizationFilter,
  setLicenseFilter,
  setTagFilter,
  setFilters,
  clearFilters,
  clearCurrentDataset,
  setPage,
} = dataSlice.actions;

export default dataSlice.reducer;