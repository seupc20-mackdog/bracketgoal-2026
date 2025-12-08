"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function MercadoPagoSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Confirmando pagamento...");

  useEffect(() => {
    async function confirmPayment() {
      const poolId = searchParams.get("poolId");
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
        if (poolId) url.searchParams.set("poolId", poolId);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (!res.ok || !data.success) {
          console.error("Erro ao confirmar pagamento:", data);
          setMessage(
            "Pagamento não pôde ser confirmado automaticamente. Verifique o status do bolão no dashboard."
          );
          return;
        }

        setMessage("Pagamento confirmado! Redirecionando para convites...");

        setTimeout(() => {
          if (poolId) {
            router.push(`/pools/${poolId}/invites`);
          } else {
            router.push("/dashboard");
          }
        }, 1800);
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
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="rounded-2xl border border-emerald-500/70 bg-slate-900/80 px-6 py-5 shadow-lg shadow-emerald-900/50 max-w-md text-center">
        <p className="text-sm font-semibold">{message}</p>
        <p className="mt-2 text-xs text-slate-300">
          Caso não seja redirecionado automaticamente, você pode voltar ao
          dashboard e conferir o status do seu bolão.
        </p>
      </div>
    </main>
  );
}
