import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isRemote = Boolean(url && anon);
export const supabase = isRemote ? createClient(url, anon) : null;

export async function remoteSave(poll) {
  if (!isRemote) return;
  await supabase.from("np_polls").upsert(
    { id: poll.id, data: poll },
    { onConflict: "id" }
  );
}

export async function remoteLoad(id) {
  if (!isRemote) return null;
  const { data } = await supabase
    .from("np_polls")
    .select("data")
    .eq("id", id)
    .maybeSingle();
  return data?.data ?? null;
}

export async function remoteVote(id, optIdx, who, fromIdx) {
  if (!isRemote) return null;
  const { data, error } = await supabase.rpc("np_vote", {
    p_id: id,
    p_opt: optIdx,
    p_who: who,
    p_from: fromIdx ?? -1,
  });
  if (error) return null;
  return data ?? null;
}

export function remoteSubscribe(id, cb) {
  if (!isRemote) return () => {};
  const channel = supabase
    .channel(`np-${id}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "np_polls", filter: `id=eq.${id}` },
      (payload) => {
        if (payload.new?.data) cb(payload.new.data);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
