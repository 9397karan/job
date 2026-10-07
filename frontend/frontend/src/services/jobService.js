import api from "./api";

export const getJobs = async (filters = {}) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) =>
        value !== "" &&
        value !== null &&
        value !== undefined
    )
  );

  const response = await api.get("/jobs", {
    params: cleanFilters,
  });

  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};