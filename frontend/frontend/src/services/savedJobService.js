import api from "./api";

export const getSavedJobs = async () => {
  const response = await api.get("/saved-jobs");
  return response.data;
};

export const saveJob = async (jobId) => {
  const response = await api.post("/saved-jobs", {
    jobId,
  });

  return response.data;
};

export const removeSavedJob = async (jobId) => {
  const response = await api.delete(
    `/saved-jobs/${jobId}`
  );

  return response.data;
};