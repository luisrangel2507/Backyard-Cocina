// Sends order texts through Twilio. Without credentials it just logs (handy in dev).
export async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM;
  if (!sid || !token || !from || !to) { console.log("[sms skipped]", to, body); return; }
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  if (!res.ok) console.error("Twilio error", res.status, await res.text());
}

export function orderText(o: { id: string; fulfillment: string; status: string }, firstName = "there") {
  const ref = o.id.slice(-6).toUpperCase();
  if (o.status === "ready")
    return o.fulfillment === "pickup"
      ? `Hi ${firstName}! Your Backyard Cocina order #${ref} is ready for pickup at 1636 Greenwood Ave, Torrance. 🌶`
      : `Hi ${firstName}! Your Backyard Cocina order #${ref} is packed and will head out soon.`;
  if (o.status === "out") return `Hi ${firstName}! Your Backyard Cocina order #${ref} is on the way. 🚗`;
  if (o.status === "done") return `Thanks ${firstName}! Enjoy your salsa. Leave a review in the app ⭐`;
  return "";
}
