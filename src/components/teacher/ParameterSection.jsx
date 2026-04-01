export default function ParameterSection({ parameters, setParameters }) {
  const addParameter = () => {
    setParameters([...parameters, { name: "", score: "" }]);
  };

  const updateParameter = (index, field, value) => {
    const updated = [...parameters];
    updated[index][field] = value;
    setParameters(updated);
  };

  const removeParameter = (index) => {
    const updated = parameters.filter((_, i) => i !== index);
    setParameters(updated);
  };

  return (
    <div className="bg-white p-4 rounded-xl border space-y-4">
      <h2 className="font-medium text-gray-700">
        Assignment
      </h2>

      {parameters.map((param, index) => (
        <div key={index} className="flex gap-2">
          <input
            placeholder="Assignment Name"
            value={param.name}
            onChange={(e) =>
              updateParameter(index, "name", e.target.value)
            }
            className="flex-1 border rounded-lg p-2"
          />

          <input
            placeholder="Score"
            value={param.score}
            onChange={(e) =>
              updateParameter(index, "score", e.target.value)
            }
            className="w-24 border rounded-lg p-2"
          />

          <button
            onClick={() => removeParameter(index)}
            className="text-red-500"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addParameter}
        className="text-emerald-600 text-sm"
      >
        + Add Parameter
      </button>
    </div>
  );
}