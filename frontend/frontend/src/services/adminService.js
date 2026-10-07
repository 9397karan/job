import api from "./api";

export const getAdminDashboard = async () => {
  const response = await api.get(
    "/admin/dashboard"
  );

  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get(
    "/admin/users"
  );

  return response.data;
};

export const getAdminCompanies = async () => {
  const response = await api.get(
    "/admin/companies"
  );

  return response.data;
};

export const getAdminJobs = async () => {
  const response = await api.get(
    "/admin/jobs"
  );

  return response.data;
};

export const getAdminApplicationStats =
  async () => {
    const response = await api.get(
      "/admin/applications/stats"
    );

    return response.data;
  };