import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Save, MapPin, Loader2, Navigation, Plus, Trash2, Settings as SettingsIcon } from "lucide-react";

export default function AdminInstituteSettings() {
  const [loading, setLoading] = useState(false);
  const [savingGeo, setSavingGeo] = useState(false);
  const [savingFields, setSavingFields] = useState(false);
  const [location, setLocation] = useState({ lat: "", lng: "", radius: 50 });
  const [customFields, setCustomFields] = useState([]);

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

      const fieldsSetting = list.find(s => s.key === "student_custom_fields");
      if (fieldsSetting && Array.isArray(fieldsSetting.value)) {
        setCustomFields(fieldsSetting.value);
      }
    } catch (err) {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeo = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng || !location.radius) {
      toast.error("Please fill all geofence fields.");
      return;
    }

    try {
      setSavingGeo(true);
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
      toast.error(err.response?.data?.message || "Failed to update geofence");
    } finally {
      setSavingGeo(false);
    }
  };

  const handleSaveFields = async (e) => {
    e.preventDefault();
    // Validate empty names
    if (customFields.some(f => !f.name.trim())) {
      toast.error("Field names cannot be empty.");
      return;
    }
    
    try {
      setSavingFields(true);
      await API.patch("/settings", {
        key: "student_custom_fields",
        value: customFields.map(f => ({
          name: f.name.trim(),
          type: f.type,
          isRequired: f.isRequired
        }))
      });
      toast.success("Custom fields updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update custom fields");
    } finally {
      setSavingFields(false);
    }
  };

  const addField = () => {
    setCustomFields([...customFields, { name: "", type: "text", isRequired: false }]);
  };

  const removeField = (index) => {
    const newFields = [...customFields];
    newFields.splice(index, 1);
    setCustomFields(newFields);
  };

  const updateField = (index, key, value) => {
    const newFields = [...customFields];
    newFields[index][key] = value;
    setCustomFields(newFields);
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
          <form onSubmit={handleSaveGeo}>
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
              disabled={savingGeo}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px",
                borderRadius: 8, border: "none", background: "linear-gradient(135deg, #0F3C8A, #1e3a5f)",
                color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: savingGeo ? 0.7 : 1,
                boxShadow: "0 4px 12px rgba(15,60,138,0.2)"
              }}
            >
              <Save size={18} /> {savingGeo ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        )}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginTop: 24, marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <SettingsIcon style={{ color: "#3b82f6" }} size={20} />
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>Student Custom Fields</h2>
        </div>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
          Define additional fields to collect when adding a student (e.g., Aadhaar Number, DOB, Parent's Contact). These will also be included in the Bulk Upload template.
        </p>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b" }}>
            <Loader2 className="animate-spin" size={16} /> Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSaveFields}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {customFields.map((field, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name (e.g., Aadhaar No.)"
                    required
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontWeight: 600, color: "#334155" }}
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontWeight: 600, color: "#334155", background: "#fff", cursor: "pointer" }}
                  >
                    <option value="text">Text / String</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) => updateField(index, "isRequired", e.target.checked)}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 4, display: "flex" }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addField}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", marginBottom: 24,
                borderRadius: 8, border: "1px dashed #94a3b8", background: "transparent",
                color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer"
              }}
            >
              <Plus size={16} /> Add Custom Field
            </button>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
              <button
                type="submit"
                disabled={savingFields}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px",
                  borderRadius: 8, border: "none", background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: savingFields ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(16,185,129,0.2)"
                }}
              >
                <Save size={18} /> {savingFields ? "Saving..." : "Save Custom Fields"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
