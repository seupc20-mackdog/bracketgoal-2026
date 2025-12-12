"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Confirmando pagamento...");

  useEffect(() => {
    async function confirmPayment() {
      const poolIdParam = searchParams.get("poolId");
      const paymentId =
        searchParams.get("payment_id") ?? searchParams.get("paymentId");
      const externalReference = searchParams.get("external_reference");

      try {
        const url = new URL(
          "/api/mercadopago/confirm",
          window.location.origin
        );

        if (paymentId) url.searchParams.set("payment_id", paymentId);
        if (externalReference)
          url.searchParams.set("external_reference", externalReference);
        if (poolIdParam) url.searchParams.set("poolId", poolIdParam);

        const res = await fetch(url.toString());
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          console.error("Erro ao confirmar pagamento:", data);
          setMessage(
            data?.error
              ? `Erro ao confirmar pagamento: ${data.error}`
              : "Pagamento nÇœo pÇïde ser confirmado automaticamente. Verifique o status do bolÇœo no dashboard."
          );
          return;
        }

        const resolvedPoolId = poolIdParam ?? data.poolId;
        setMessage("Pagamento confirmado! Redirecionando para convites...");

        setTimeout(() => {
          if (resolvedPoolId) {
            router.replace(`/pools/${resolvedPoolId}/invites`);
          } else {
            router.replace("/dashboard");
          }
        }, 1200);
      } catch (err) {
        console.error("Erro inesperado ao confirmar pagamento:", err);
        setMessage(
          "Erro inesperado ao confirmar o pagamento. Verifique o status no dashboard."
        );
      }
    }

    confirmPayment();
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-md rounded-2xl border border-emerald-500/70 bg-slate-900/80 px-6 py-5 text-center shadow-lg shadow-emerald-900/50">
        <p className="text-sm font-semibold">{message}</p>
        <p className="mt-2 text-xs text-slate-300">
          Caso nÇœo seja redirecionado automaticamente, vocÇ¦ pode voltar ao
          dashboard e conferir o status do seu bolÇœo.
        </p>
      </div>
    </main>
  );
}

export default function MercadoPagoSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
          <div className="max-w-md rounded-2xl border border-emerald-500/70 bg-slate-900/80 px-6 py-5 text-center shadow-lg shadow-emerald-900/50">
            <p className="text-sm font-semibold">
              Carregando dados do pagamento...
            </p>
            <p className="mt-2 text-xs text-slate-300">
              Aguarde enquanto confirmamos o status com o Mercado Pago.
            </p>
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
