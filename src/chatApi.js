export async function sendChatMessage(message, history, userProfile) {
  const response = await fetch("/api/functions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      history,
      userProfile
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error en el servidor");
  }

  return data;
}