import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import api from "../../services/api";

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const meetingRef = useRef(null);
  const zegoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const joinInterview = async () => {
      try {
        console.log("================================");
        console.log("Joining interview:", id);
        console.log("================================");

        setLoading(true);
        setError("");

        // Wait until the container is mounted
        if (!meetingRef.current) {
          console.log("Container not ready, waiting...");

          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!meetingRef.current) {
            throw new Error("Video container is not ready");
          }
        }

        // Get Zego token from backend
        const response = await api.get(
          `/interviews/${id}/zego-token`
        );

        console.log("Zego API response:", response.data);

        if (!mounted) return;

        const {
          appId,
          token,
          roomId,
          userId,
          userName,
        } = response.data;

        if (!appId) {
          throw new Error("ZEGOCLOUD App ID is missing");
        }

        if (!token) {
          throw new Error("ZEGOCLOUD Token is missing");
        }

        if (!roomId) {
          throw new Error("Interview room ID is missing");
        }

        if (!userId) {
          throw new Error("User ID is missing");
        }

        if (!meetingRef.current) {
          throw new Error("Video container is not ready");
        }

        console.log("Creating Zego Kit Token...");

        // Convert server Token04 → UIKit Kit Token
        const kitToken =
          ZegoUIKitPrebuilt.generateKitTokenForProduction(
            Number(appId),
            token,
            roomId,
            userId,
            userName || "JobConnect User"
          );

        if (!kitToken) {
          throw new Error(
            "Failed to generate ZEGOCLOUD Kit Token"
          );
        }

        console.log("Kit token generated");

        // Create Zego instance
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zegoRef.current = zp;

        console.log("Joining Zego room...");

        await zp.joinRoom({
          container: meetingRef.current,

          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },

          showPreJoinView: true,

          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,

          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,

          maxUsers: 2,

          showLeavingView: true,

          layout: "Auto",

          sharedLinks: [
            {
              name: "JobConnect Interview",
              url: window.location.href,
            },
          ],

          onJoinRoom: () => {
            console.log("Successfully joined Zego room");
          },

          onLeaveRoom: () => {
            console.log("Left Zego room");
            navigate(-1);
          },
        });

        if (mounted) {
          console.log("Zego room loaded successfully");
          setLoading(false);
        }
      } catch (err) {
        console.error("================================");
        console.error("JOIN INTERVIEW ERROR");
        console.error(err);
        console.error("================================");

        if (!mounted) return;

        const message =
          err.response?.data?.message ||
          err.message ||
          "Unable to join interview.";

        setError(message);
        setLoading(false);
      }
    };

    joinInterview();

    return () => {
      mounted = false;

      if (zegoRef.current) {
        try {
          zegoRef.current = null;
        } catch (cleanupError) {
          console.error("Zego cleanup error:", cleanupError);
        }
      }
    };
  }, [id, navigate]);

  return (
    <div className="fixed inset-0 bg-black text-white">

      {/* IMPORTANT:
          Container is ALWAYS rendered.
          This fixes meetingRef.current === null.
      */}
      <div
        ref={meetingRef}
        className="h-full w-full"
      />

      {/* Loading overlay */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2
              size={45}
              className="animate-spin text-primary"
            />

            <div>
              <h2 className="text-xl font-bold">
                Joining Interview
              </h2>

              <p className="mt-2 text-sm opacity-70">
                Setting up your video interview...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300 p-6">
          <div className="card w-full max-w-md bg-base-100 shadow-2xl">
            <div className="card-body items-center text-center">

              <div className="rounded-full bg-error/10 p-4">
                <AlertCircle
                  size={40}
                  className="text-error"
                />
              </div>

              <h2 className="card-title text-xl">
                Unable to Join Interview
              </h2>

              <p className="text-sm opacity-70">
                {error}
              </p>

              <div className="card-actions mt-4">

                <button
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>

                <button
                  className="btn btn-ghost"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InterviewRoom;