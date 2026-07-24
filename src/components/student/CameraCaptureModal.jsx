import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, RefreshCw, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function CameraCaptureModal({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImg, setCapturedImg] = useState(null);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to Blob
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to capture image.");
        return;
      }
      setCapturedImg(URL.createObjectURL(blob));
      // Stop video stream after capture
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      // Pass the blob to the parent when confirmed, store it here temporarily
      canvas.blobData = blob;
    }, "image/jpeg", 0.9);
  };

  const handleRetake = () => {
    setCapturedImg(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (canvasRef.current && canvasRef.current.blobData) {
      onCapture(canvasRef.current.blobData);
    } else {
      toast.error("No image captured");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.9)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, width: "100%", maxWidth: 500, overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
            <Camera size={18} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Take a Selfie</h3>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, position: "relative", background: "#0f172a", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {error ? (
            <p style={{ color: "#ef4444", fontSize: 14, textAlign: "center", padding: 20 }}>{error}</p>
          ) : capturedImg ? (
            <img src={capturedImg} alt="Captured" style={{ width: "100%", borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: "100%", borderRadius: 8, backgroundColor: "#000", transform: "scaleX(-1)" }} // mirror for front cam
            />
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {/* Footer actions */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #334155", display: "flex", justifyContent: "center", gap: 12 }}>
          {capturedImg ? (
            <>
              <button onClick={handleRetake} style={{
                padding: "10px 20px", borderRadius: 8, border: "1px solid #475569", background: "transparent",
                color: "#cbd5e1", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
              }}>
                <RefreshCw size={16} /> Retake
              </button>
              <button onClick={handleConfirm} style={{
                padding: "10px 24px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 12px rgba(34,197,94,0.3)"
              }}>
                <Upload size={16} /> Confirm & Upload
              </button>
            </>
          ) : (
            <button onClick={handleCapture} disabled={!!error} style={{
              padding: "12px 32px", borderRadius: 30, border: "none", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", fontSize: 14, fontWeight: 800, cursor: error ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)", opacity: error ? 0.5 : 1
            }}>
              <Camera size={18} /> Capture
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
