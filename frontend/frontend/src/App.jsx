import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import InterviewRoom from "./pages/interview/InterviewRoom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RecruiterJobDetails from "./pages/recruiter/RecruiterJobDetails";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import EditJob from "./pages/recruiter/EditJob"
// Auth
import ResumeAnalyzer from "./pages/jobSeeker/ResumeAnalyzer";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/login";
import RecruiterInterviewDetails from "./pages/recruiter/RecruiterInterviewDetails";
// Job Seeker
import JobSeekerDashboard from "./pages/jobSeeker/Dashboard";
import Profile from "./pages/jobSeeker/Profile";
import Applications from "./pages/jobSeeker/Applications";
import Jobs from "./pages/jobSeeker/Jobs";
import JobDetails from "./pages/jobSeeker/JobDetails";
import Interviews from "./pages/jobSeeker/Interviews";
import SavedJobs from "./pages/jobSeeker/SavedJobs";
import { useState } from "react";
// Recruiter
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import CompanyProfile from "./pages/recruiter/CompanyProfile";
import CreateJob from "./pages/recruiter/CreateJob";
import MyJobs from "./pages/recruiter/MyJobs";
import RecruiterApplications from "./pages/recruiter/RecruiterApplications";
import RecruiterApplicationDetails from "./pages/recruiter/RecruiterApplicationDetails";
import ScheduleInterview from "./pages/recruiter/ScheduleInterview";
import RecruiterInterviews from "./pages/recruiter/RecruiterInterviews";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

// ============================================================
// JOB SEEKER PAGE WRAPPER
// ============================================================
const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar
        onMenuClick={() =>
          setMobileOpen(true)
        }
      />

      <div className="flex">

        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="min-w-0 flex-1">

          <div className="dashboard-bg min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">

            <div className="page-enter">
              {children}
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};
const JobSeekerPage = ({ children }) => (
  <DashboardLayout>
    {children}
  </DashboardLayout>
);

const RecruiterPage = ({ children }) => (
  <DashboardLayout>
    {children}
  </DashboardLayout>
);

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ==================================================
              PUBLIC ROUTES
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              />
            }
          >
            <Route
              element={<AdminLayout />}
            >
              <Route
                index
                element={<AdminDashboard />}
              />
            </Route>
          </Route>

          {/* ==================================================
              JOB SEEKER
          ================================================== */}

          <Route
            path="/job-seeker"
            element={
              <ProtectedRoute
                allowedRoles={["JOB_SEEKER"]}
              />
            }
          >
            <Route
              index
              element={
                <JobSeekerPage>
                  <JobSeekerDashboard />
                </JobSeekerPage>
              }
            />
            <Route
              path="resume-analyzer"
              element={
                <JobSeekerPage>
                  <ResumeAnalyzer />
                </JobSeekerPage>
              }
            />
            <Route
              path="jobs"
              element={
                <JobSeekerPage>
                  <Jobs />
                </JobSeekerPage>
              }
            />

            <Route
              path="jobs/:id"
              element={
                <JobSeekerPage>
                  <JobDetails />
                </JobSeekerPage>
              }
            />

            <Route
              path="profile"
              element={
                <JobSeekerPage>
                  <Profile />
                </JobSeekerPage>
              }
            />

            <Route
              path="applications"
              element={
                <JobSeekerPage>
                  <Applications />
                </JobSeekerPage>
              }
            />

            <Route
              path="interviews"
              element={
                <JobSeekerPage>
                  <Interviews />
                </JobSeekerPage>
              }
            />

            <Route
              path="saved-jobs"
              element={
                <JobSeekerPage>
                  <SavedJobs />
                </JobSeekerPage>
              }
            />
          </Route>
          <Route
            path="/interview-room/:id"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "JOB_SEEKER",
                  "RECRUITER",
                ]}
              />
            }
          >
            <Route
              index
              element={<InterviewRoom />}
            />
          </Route>

          {/* ==================================================
              RECRUITER
          ================================================== */}

          <Route
            path="/recruiter"
            element={
              <ProtectedRoute
                allowedRoles={["RECRUITER"]}
              />
            }
          >
            <Route
              index
              element={
                <RecruiterPage>
                  <RecruiterDashboard />
                </RecruiterPage>
              }
            />

            <Route
              path="company"
              element={
                <RecruiterPage>
                  <CompanyProfile />
                </RecruiterPage>
              }
            />

            {/* Manage Jobs */}
            <Route
              path="jobs"
              element={
                <RecruiterPage>
                  <MyJobs />
                </RecruiterPage>
              }
            />

            {/* Create Job */}
            <Route
              path="jobs/create"
              element={
                <RecruiterPage>
                  <CreateJob />
                </RecruiterPage>
              }
            />
            <Route
              path="jobs/:id"
              element={
                <RecruiterPage>
                  <RecruiterJobDetails />
                </RecruiterPage>
              }
            />

            {/* Edit Job */}
            <Route
              path="jobs/:id/edit"
              element={
                <RecruiterPage>
                  <EditJob />
                </RecruiterPage>
              }
            />

            {/* Applications */}
            <Route
              path="applications"
              element={
                <RecruiterPage>
                  <RecruiterApplications />
                </RecruiterPage>
              }
            />

            <Route
              path="applications/:id"
              element={
                <RecruiterPage>
                  <RecruiterApplicationDetails />
                </RecruiterPage>
              }
            />

            {/* Interviews */}
            <Route
              path="interviews/schedule"
              element={
                <RecruiterPage>
                  <ScheduleInterview />
                </RecruiterPage>
              }
            />

            <Route
              path="interviews"
              element={
                <RecruiterPage>
                  <RecruiterInterviews />
                </RecruiterPage>
              }
            /><Route
              path="interviews/:id"
              element={
                <RecruiterPage>
                  <RecruiterInterviewDetails />
                </RecruiterPage>
              }
            />
          </Route>


          {/* ==================================================
              UNKNOWN ROUTES
          ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;