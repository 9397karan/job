import api from "./api";

export const analyzeResume = async (file, jobId = "") => {
  const formData = new FormData();

  formData.append("resume", file);

  if (jobId) {
    formData.append("jobId", jobId);
  }

  const response = await api.post(
    "/resume-analyzer/analyze",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};