import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import RelayManager from "./components/RelayManager";
import Messages from "./components/Messages";
import LobbyView from "./components/LobbyView";
import pognClientConfigs from "./pognAdminConsoleConfigs";

function App() {
  const [connections, setConnections] = useState(new Map());
  const [addRelayConnections, setAddRelayConnections] = useState([
    { id: "lobby1", url: pognClientConfigs.LOBBY_WS_URL, type: "lobby" },
  ]);
  const [removeRelayConnections, setRemoveRelayConnections] = useState([]);
  const [sendMessageToUrl, setSendMessageToUrl] = useState(() => () => {});
  const [messagesSent, setMessagesSent] = useState([]);
  const [messagesReceived, setMessagesReceived] = useState([]);
  const [selectedRelayId, setSelectedRelayId] = useState(null);
  const [lobbyConnectUrl, setLobbyConnectUrl] = useState("");
  const [lobbyConnectId, setLobbyConnectId] = useState("");
  const [selectedLobbyId, setSelectedLobbyId] = useState("lobby1");
  const [lastPongTimes, setLastPongTimes] = useState({});
  const [pongTriggers, setPongTriggers] = useState({});

  useEffect(() => {
    setLobbyConnectUrl(pognClientConfigs.LOBBY_WS_URL);
    setLobbyConnectId("lobby1");
  }, []);

  const handleMessage = (id, message) => {
    console.log("📥 Received:", message);

    if (message?.payload?.type === "pong") {
      const relayId = message.relayId || id;
      console.log(`🎯 Setting pongTrigger for ${relayId}`);
      setPongTriggers((prev) => ({
        ...prev,
        [relayId]: uuidv4(), // or message.uuid
      }));
    }

    setMessagesReceived((prev) => [...prev, message]);
  };

  const sendMessage = ({ payload, relayId } = {}) => {
    const connection = connections.get(relayId);
    if (!connection) return;

    const message = {
      payload: {
        ...payload,
        type: payload.type || connection.type,
        action: payload.action,
        playerId: payload.playerId || "admin",
      },
      uuid: uuidv4(),
      relayId: relayId || selectedRelayId,
    };

    sendMessageToUrl(relayId, message);
    setMessagesSent((prev) => [...prev, message]);
    console.log("📤 Sent:", message);
  };

  const onSelect = (id) => {
    console.log("Selected Relay ID:", id);
    setSelectedRelayId((prev) => (prev === id ? null : id));
    setSelectedLobbyId(id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">POGN Admin Console</h1>

        <div className="mt-3">
          <RelayManager
            setAddRelayConnections={setAddRelayConnections}
            addRelayConnections={addRelayConnections}
            removeRelayConnections={removeRelayConnections}
            setRemoveRelayConnections={setRemoveRelayConnections}
            onMessage={handleMessage}
            setSendMessage={setSendMessageToUrl}
            connections={connections}
            setConnections={setConnections}
            onSelect={onSelect}
            selectedRelayId={selectedRelayId}
            setSelectedRelayId={setSelectedRelayId}
          />
        </div>

        <div className="mt-6 w-full text-left">
          <h4 className="text-lg font-semibold mb-2">Connect to relay:</h4>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              className="w-full sm:w-[300px] border border-gray-300 rounded px-3 py-2"
              placeholder={pognClientConfigs.LOBBY_WS_URL}
              value={lobbyConnectUrl}
              onChange={(e) => setLobbyConnectUrl(e.target.value)}
            />
            <input
              type="text"
              className="w-full sm:w-[200px] border border-gray-300 rounded px-3 py-2"
              placeholder="Lobby ID"
              value={lobbyConnectId}
              onChange={(e) => setLobbyConnectId(e.target.value)}
            />
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
              onClick={() => {
                console.log(
                  "Adding lobby connection url:",
                  lobbyConnectUrl,
                  "id:",
                  lobbyConnectId
                );
                if (!lobbyConnectUrl || !lobbyConnectId) return;
                setAddRelayConnections((prev) => [
                  ...prev,
                  { id: lobbyConnectId, url: lobbyConnectUrl, type: "lobby" },
                ]);
                setSelectedLobbyId(lobbyConnectId); // auto-select
                setLobbyConnectUrl("");
                setLobbyConnectId("");
              }}
            >
              Connect
            </button>
          </div>
        </div>

        <div className="flex gap-4 justify-center my-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={() =>
              sendMessage({
                payload: {
                  type: "lobby",
                  action: "login",
                  lobbyId: selectedRelayId,
                },
                relayId: selectedRelayId,
              })
            }
          >
            Login to {selectedRelayId}
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() =>
              sendMessage({
                payload: {
                  type: "lobby",
                  action: "refreshLobby",
                  lobbyId: selectedRelayId,
                },
                relayId: selectedRelayId,
              })
            }
          >
            Refresh {selectedRelayId}
          </button>
        </div>
        <div>
          {(() => {
            const latestLobbyMessage = [...messagesReceived]
              .reverse()
              .find(
                (msg) =>
                  msg?.payload?.type === "lobby" &&
                  msg?.payload?.lobbyId === selectedRelayId &&
                  (msg.payload.lobbyPlayers || msg.payload.lobbyGames)
              );

            return latestLobbyMessage ? (
              <LobbyView
                lobbyId={selectedRelayId}
                players={latestLobbyMessage.payload.lobbyPlayers}
                games={latestLobbyMessage.payload.lobbyGames}
              />
            ) : null;
          })()}
        </div>
        <Messages
          messagesSent={messagesSent}
          messagesReceived={messagesReceived}
          selectedRelayId={selectedRelayId}
        />

        {/* <h2 className="text-lg font-semibold mb-2">Messages Sent</h2>
        <div className="text-left max-h-[300px] overflow-y-auto mb-6 w-full">
          {messagesSent.length > 0 ? (
            <>
              {messagesSent.slice(0, -1).map((msg, i) => (
                <details key={`sent-prev-${i}`} className="mb-1">
                  <summary>Previous #{i + 1}</summary>
                  <JsonView
                    data={msg}
                    shouldExpandNode={() => false}
                    style={{ fontSize: "12px", lineHeight: "1.2" }}
                  />
                </details>
              ))}
              <div className="bg-gray-50 p-2 rounded">
                <JsonView
                  data={messagesSent[messagesSent.length - 1]}
                  shouldExpandNode={(level, value, field) =>
                    level === 0 || field === "payload"
                  }
                  style={{ fontSize: "12px", lineHeight: "1.2" }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No messages sent yet.</p>
          )}
        </div>
        <h2 className="text-lg font-semibold mb-2">Messages Received</h2>
        <div className="text-left max-h-[300px] overflow-y-auto w-full">
          {messagesReceived.length > 0 ? (
            <>
              {messagesReceived.slice(0, -1).map((msg, i) => (
                <details key={`recv-prev-${i}`} className="mb-1">
                  <summary>Previous #{i + 1}</summary>
                  <JsonView
                    data={msg}
                    shouldExpandNode={() => false}
                    style={{ fontSize: "12px", lineHeight: "1.2" }}
                  />
                </details>
              ))}
              <div className="bg-gray-50 p-2 rounded">
                <JsonView
                  data={messagesReceived[messagesReceived.length - 1]}
                  shouldExpandNode={(level, value, field) =>
                    level === 0 || field === "payload"
                  }
                  style={{ fontSize: "12px", lineHeight: "1.2" }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No messages received yet.</p>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default App;
