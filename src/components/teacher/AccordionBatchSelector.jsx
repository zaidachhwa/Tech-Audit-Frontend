import { useState } from "react";
import { ChevronDown } from "lucide-react";

const groupBatchesByName = (batches) => {
  const grouped = {};

  batches.forEach((batch) => {
    const name = batch.batch_name?.trim().toUpperCase() || "Unknown";
    if (!grouped[name]) {
      grouped[name] = [];
    }
    grouped[name].push(batch);
  });

  return Object.entries(grouped)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([name, batchArray]) => ({
      name,
      batches: batchArray.sort((a, b) =>
        String(a.batch_no).localeCompare(String(b.batch_no))
      ),
    }));
};

export default function AccordionBatchSelector({
  batches = [],
  selectedBatch = "",
  onBatchSelect = () => {},
  expandedBatchName = "",
  onExpandedChange = () => {},
  loading = false,
}) {
  const groupedBatches = groupBatchesByName(batches);
  const isLoading = loading;

  console.log("AccordionBatchSelector received batches:", batches);
  console.log("Grouped batches:", groupedBatches);

  const handleBatchNameClick = (batchName) => {
    onExpandedChange(expandedBatchName === batchName ? "" : batchName);
  };

  const handleBatchNoClick = (batchNo, batchName) => {
    console.log("Batch clicked - batchNo:", batchNo, "batchName:", batchName);
    console.log("Looking in batches:", batches);

    const selectedBatchObj = batches.find(
      (b) => String(b.batch_name).trim().toUpperCase() === batchName && String(b.batch_no) === batchNo
    );

    console.log("Found batch:", selectedBatchObj);

    if (selectedBatchObj) {
      console.log("Calling onBatchSelect with:", selectedBatchObj._id);
      onBatchSelect(selectedBatchObj._id);
    } else {
      console.warn("No batch found matching:", { batchName, batchNo });
    }
  };

  const styles = {
    container: {
      background: "#fff",
      border: "1.5px solid #E2E8F0",
      borderRadius: 12,
      overflow: "hidden",
    },
    header: {
      padding: "12px 16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.15s ease",
      borderBottom: "1.5px solid #E2E8F0",
      marginBottom: 0,
    },
    headerText: {
      fontSize: 14,
      fontWeight: 600,
      color: "#1B2B4B",
    },
    headerCollapsed: {
      background: "#F8FAFC",
    },
    headerExpanded: {
      background: "#EFF6FF",
      borderBottomColor: "#2563EB",
    },
    headerHover: {
      background: "#F0F4F8",
    },
    expandContent: {
      padding: "12px 16px",
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      animation: "expandIn 0.2s ease-out",
    },
    batchButton: {
      padding: "8px 14px",
      fontSize: 13,
      fontWeight: 600,
      border: "1.5px solid #E2E8F0",
      borderRadius: 6,
      background: "#fff",
      color: "#1B2B4B",
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.15s ease",
      minWidth: "fit-content",
    },
    batchButtonSelected: {
      background: "#2563EB",
      color: "#fff",
      border: "1.5px solid #2563EB",
    },
    batchButtonHover: {
      background: "#F1F5F9",
      borderColor: "#CBD5E1",
    },
    chevron: {
      transition: "transform 0.2s ease",
    },
    emptyState: {
      padding: "20px 16px",
      textAlign: "center",
      color: "#94A3B8",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
    },
  };

  if (batches.length === 0) {
    return (
      <div style={{ ...styles.container }}>
        <div style={styles.emptyState}>
          {isLoading ? "Loading batches..." : "No batches available"}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes expandIn {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
        .batch-header:hover {
          background: #F0F4F8;
        }
        .batch-button:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }
      `}</style>

      {groupedBatches.map((group) => {
        const isExpanded = expandedBatchName === group.name;

        return (
          <div key={group.name}>
            {/* Header */}
            <div
              className="batch-header"
              onClick={() => handleBatchNameClick(group.name)}
              style={{
                ...styles.header,
                ...(isExpanded ? styles.headerExpanded : styles.headerCollapsed),
              }}
            >
              <span style={styles.headerText}>{group.name}</span>
              <ChevronDown
                size={16}
                color={isExpanded ? "#2563EB" : "#94A3B8"}
                style={{
                  ...styles.chevron,
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div style={styles.expandContent}>
                {group.batches.map((batch) => {
                  const isSelected = selectedBatch === batch._id;

                  return (
                    <button
                      key={batch._id}
                      className="batch-button"
                      onClick={() => handleBatchNoClick(batch.batch_no, group.name)}
                      style={{
                        ...styles.batchButton,
                        ...(isSelected ? styles.batchButtonSelected : {}),
                      }}
                      disabled={isLoading}
                    >
                      {batch.batch_no}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
