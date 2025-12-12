/**
 * Smoke checklist (opcional) para exercícios locais.
 * Requer: SMOKE_BASE_URL (default http://localhost:3000) e SMOKE_USER_ID para criar pool.
 * Usa fetch nativo do Node 18+.
 */
const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const ownerUserId = process.env.SMOKE_USER_ID;

async function request(path, options) {
  const res = await fetch(new URL(path, baseUrl), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body };
}

async function run() {
  if (!ownerUserId) {
    console.log("Defina SMOKE_USER_ID para executar o smoke.");
    return;
  }

  console.log(`Base: ${baseUrl}`);

  const createPayload = {
    mode: "friends",
    ownerUserId,
    ownerEmail: "smoke@example.com",
    config: {
      tournamentType: "worldcup_2026",
      poolName: `Smoke ${Date.now()}`,
      numMatches: 5,
      filterHours: 24,
      maxPlayers: 8,
      accessType: "private",
    },
  };

  const create = await request("/api/pools", {
    method: "POST",
    body: JSON.stringify(createPayload),
  });
  console.log("POST /api/pools", create.status, create.body?.id || create.body?.error);
  if (!create.ok || !create.body?.id) return;

  const poolId = create.body.id;

  const pay = await request(`/api/pools/${poolId}/pay-service`, {
    method: "POST",
  });
  console.log("POST /api/pools/:id/pay-service", pay.status, pay.body?.status || pay.body?.error);

  const joinGet = await request(`/api/pools/${poolId}/join`, { method: "GET" });
  console.log("GET /api/pools/:id/join", joinGet.status, joinGet.body?.pool?.name || joinGet.body?.error);

  const joinPost = await request(`/api/pools/${poolId}/join`, {
    method: "POST",
    body: JSON.stringify({
      displayName: "Smoke Tester",
      whatsapp: "(11) 91234-5678",
      userId: ownerUserId,
    }),
  });
  console.log("POST /api/pools/:id/join", joinPost.status, joinPost.body?.entry?.id || joinPost.body?.error);
}

run().catch((err) => {
  console.error("Erro no smoke:", err);
  process.exit(1);
});
