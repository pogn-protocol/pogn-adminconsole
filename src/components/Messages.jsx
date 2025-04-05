import React from "react";
import { JsonView } from "react-json-view-lite";

const Messages = ({ messagesSent, messagesReceived, selectedRelayId }) => {
  const filterByRelay = (messages) =>
    messages.filter((msg) => msg?.relayId === selectedRelayId);

  const sent = filterByRelay(messagesSent);
  const received = filterByRelay(messagesReceived);

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Messages Sent</h2>
      <div className="text-left max-h-[300px] overflow-y-auto mb-6 w-full">
        {sent.length > 0 ? (
          <>
            {sent.slice(0, -1).map((msg, i) => (
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
                data={sent[sent.length - 1]}
                shouldExpandNode={(level, _, field) =>
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
        {received.length > 0 ? (
          <>
            {received.slice(0, -1).map((msg, i) => (
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
                data={received[received.length - 1]}
                shouldExpandNode={(level, _, field) =>
                  level === 0 || field === "payload"
                }
                style={{ fontSize: "12px", lineHeight: "1.2" }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">No messages received yet.</p>
        )}
      </div>
    </>
  );
};

export default Messages;
