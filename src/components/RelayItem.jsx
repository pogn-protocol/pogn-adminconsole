import React, { useEffect, useState } from "react";
import useRelayConnection from "../hooks/useRelayConnection";

const RelayItem = ({
  id,
  url,
  type,
  onMessage,
  sendMessageToRelay,
  setConnections,
  closingConnections,
  manualCloseRef,
  onSelect,
  selectedRelayId,
  setRemoveRelayConnections,
}) => {
  const { readyState } = useRelayConnection({
    id,
    url,
    type,
    onMessage,
    setConnections,
    closingConnections,
    manualCloseRef,
    onSelect,
    selectedRelayId,
  });

  const [countdown, setCountdown] = useState(null);
  console.log("Comparing IDs:", selectedRelayId, "===", id);
  console.log("RelayItem ID:", id, "URL:", url, "Type:", type);
  const isSelected = selectedRelayId === id;

  useEffect(() => {
    if (!closingConnections.has(id)) return;

    setCountdown(closingConnections.get(id)?.countdown || 5);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev === 1 ? clearInterval(interval) : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [closingConnections, id]);

  return (
    // <div
    //   className="relay-item flex flex-col items-center p-3 border rounded hover:bg-gray-100 cursor-pointer gap-2 w-fit"
    //   onClick={() => onSelect(id)}
    // >
    //   <div className="font-semibold">{id}</div>

    <div
      className={`relay-item flex flex-col items-center p-3 border rounded hover:bg-gray-100 cursor-pointer gap-2 w-fit ${
        isSelected ? "border-green-500 bg-green-50" : "border-gray-300"
      }`}
      onClick={() => onSelect(id)}
    >
      <div
        className="text-2xl cursor-pointer"
        title="Click to disconnect"
        onClick={(e) => {
          e.stopPropagation();
          setRemoveRelayConnections((prev) => [...prev, id]);
        }}
      >
        {closingConnections.has(id)
          ? `🛑 ${countdown}s`
          : readyState === 1
          ? "✅"
          : readyState === 0
          ? "🟡"
          : readyState === 3
          ? "🔴"
          : readyState === 4
          ? "🟠"
          : "⚪️"}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          sendMessageToRelay(id, { payload: { type: "ping" } });
        }}
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
      >
        Ping 🛎️
      </button>
    </div>
  );
};

export default RelayItem;
