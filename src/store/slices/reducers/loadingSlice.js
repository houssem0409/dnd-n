const loadingSlice = {
  initialState: {},
  reducers: {
    setLoading: (dataSet, action) => {
      return { ...dataSet, loading: true };
    },
    unsetLoading: (dataSet, action) => {
      return { ...dataSet, loading: false };
    },
  },
};

export default loadingSlice;

export const setLoading = "loadingSlice/setLoading";

export const unsetLoading = "loadingSlice/unsetLoading";
