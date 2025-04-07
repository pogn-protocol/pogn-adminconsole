import React, { useCallback, useEffect, useRef, useState } from "react";
import RelayItem from "./RelayItem";
import { v4 as uuidv4 } from "uuid";

const RelayManager = ({
  addRelayConnections,
  onMessage,
  setSendMessage,
  connections,
  setConnections,
  removeRelayConnections,
  setRemoveRelayConnections,
  onSelect,
  selectedRelayId,
  pongTriggers,
}) => {
  const [closingConnections, setClosingConnections] = useState(new Map());
  const manualCloseRefs = useRef({});

  const sendMessageToRelay = useCallback(
    (id, message) => {
      if (!connections.has(id)) {
        console.error("Relay not found:", id);
        return;
      }
      if (!message?.uuid) {
        message.uuid = uuidv4();
      }
      if (!message.relayId) {
        message.relayId = id;
      }
      console.log("📤 Sending:", message, "to relayId", id);
      const conn = connections.get(id);
      conn?.sendJsonMessage?.(message);
    },
    [connections]
  );

  useEffect(() => {
    setSendMessage(() => sendMessageToRelay);
  }, [sendMessageToRelay, setSendMessage]);

  useEffect(() => {
    if (addRelayConnections?.length) {
      setConnections((prev) => {
        const newMap = new Map(prev);
        addRelayConnections.forEach((relay) => {
          if (!newMap.has(relay.id)) {
            manualCloseRefs.current[relay.id] = { current: false };
            newMap.set(relay.id, relay);
          }
        });
        return newMap;
      });
    }
  }, [addRelayConnections, setConnections]);

  useEffect(() => {
    if (removeRelayConnections?.length) {
      removeRelayConnections.forEach((id) => {
        manualCloseRefs.current[id] = { current: true };

        setClosingConnections((prev) => {
          const updated = new Map(prev);
          updated.set(id, { countdown: 5 });
          return updated;
        });

        setTimeout(() => {
          setConnections((prev) => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
          });

          setClosingConnections((prev) => {
            const updated = new Map(prev);
            updated.delete(id);
            return updated;
          });
        }, 5000);
      });

      setRemoveRelayConnections([]);
    }
  }, [removeRelayConnections, setConnections, setRemoveRelayConnections]);

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {Array.from(connections.values()).map((relay) => (
        <RelayItem
          key={relay.id}
          {...relay}
          onMessage={onMessage}
          setConnections={setConnections}
          sendMessageToRelay={sendMessageToRelay}
          closingConnections={closingConnections}
          manualCloseRef={manualCloseRefs.current[relay.id]}
          setRemoveRelayConnections={setRemoveRelayConnections}
          onSelect={onSelect}
          selectedRelayId={selectedRelayId}
          pongTriggers={pongTriggers} // ✅ here
        />
      ))}
    </div>
  );
};

export default RelayManager;
