import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Save, MapPin, Loader2, Navigation } from "lucide-react";

export default function AdminInstituteSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState({ lat: "", lng: "", radius: 50 });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/settings");
      const list = res.data;
      const geoSetting = list.find(s => s.key === "geofence");
      if (geoSetting && geoSetting.value) {
        setLocation(geoSetting.value);
      }
    } catch (err) {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng || !location.radius) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      setSaving(true);
      await API.patch("/settings", {
        key: "geofence",
        value: {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng),
          radius: parseInt(location.radius)
        }
      });
      toast.success("Geofence settings updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      toast.loading("Fetching current location...", { id: "geo" });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          }));
          toast.success("Location updated!", { id: "geo" });
        },
        (error) => {
          toast.error("Could not get location. Please ensure location services are enabled.", { id: "geo" });
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <Toaster position="top-center" />
      
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 5, height: 28, background: "#0F3C8A", borderRadius: 4 }} />
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>Institute Settings</h1>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <MapPin style={{ color: "#3b82f6" }} size={20} />
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>Attendance Geofence Configuration</h2>
        </div>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
          Students will only be able to Punch In and Punch Out if they are within the specified radius from the institute's location.
        </p>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b" }}>
            <Loader2 className="animate-spin" size={16} /> Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Latitude
                </label>
                <input
                  type="number" step="any"
                  value={location.lat}
                  onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                  placeholder="e.g. 19.0760"
                  required
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#334155", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Longitude
                </label>
                <input
                  type="number" step="any"
                  value={location.lng}
                  onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                  placeholder="e.g. 72.8777"
                  required
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#334155", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <button
                type="button"
                onClick={getCurrentLocation}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                  borderRadius: 8, border: "1px solid #3b82f6", background: "rgba(59,130,246,0.05)",
                  color: "#2563eb", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s"
                }}
              >
                <Navigation size={14} /> Use My Current Location
              </button>
            </div>

            <div style={{ marginBottom: 30 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Allowed Radius (in meters)
              </label>
              <input
                type="number"
                value={location.radius}
                onChange={(e) => setLocation({ ...location, radius: e.target.value })}
                placeholder="e.g. 50"
                min="10"
                required
                style={{ width: "100%", maxWidth: 200, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#334155", boxSizing: "border-box" }}
              />
              <span style={{ marginLeft: 12, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Default is 50 meters</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px",
                borderRadius: 8, border: "none", background: "linear-gradient(135deg, #0F3C8A, #1e3a5f)",
                color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: saving ? 0.7 : 1,
                boxShadow: "0 4px 12px rgba(15,60,138,0.2)"
              }}
            >
              <Save size={18} /> {saving ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
