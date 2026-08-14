import { createClient } from "@supabase/supabase-js";

const URL = "https://fcjhjaavzoqoaflqkcih.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjamhqYWF2em9xb2FmbHFrY2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTU0NTgsImV4cCI6MjEwMTQzMTQ1OH0.gfParCpzb4ng5ihTnUVVyu6NeJdYz-a3Va6cXxspFgo";
const id = "TESTRT3";

const supabase = createClient(URL, KEY);
const h = { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${KEY}` };

let got = false;
const timeout = setTimeout(() => {
  console.log(got ? "RESULT: PASS" : "RESULT: FAIL — no event");
  process.exit(got ? 0 : 1);
}, 25000);

const channel = supabase
  .channel("np-any3")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "np_polls" }, (payload) => {
    got = true;
    console.log("CLIENT GOT INSERT →", payload.new.id, JSON.stringify(payload.new.data.options.map((o) => o.votes)));
    fetch(`${URL}/rest/v1/np_polls?id=eq.${id}`, { method: "DELETE", headers: h }).then(() => console.log("cleanup done"));
  })
  .subscribe((status) => console.log("SUB STATUS:", status));

setTimeout(async () => {
  const poll = { id, question: "rt3", options: [{ id: "a", text: "A", votes: 0 }], events: [], createdAt: Date.now(), closed: false, expiresAt: null };
  const r = await fetch(`${URL}/rest/v1/np_polls`, { method: "POST", headers: h, body: JSON.stringify({ id, data: poll }) });
  console.log("INSERT:", r.status);
}, 3000);
