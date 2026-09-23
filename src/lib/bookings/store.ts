import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Persist a completed à la carte booking payment (deposit hold or pay in
 * full) to the payments ledger.
 *
 * Called from the Stripe webhook with the service-role client (RLS
 * bypassed). Idempotent on the Stripe payment intent id, so a replayed
 * webhook is a no-op. The buyer may be a guest: profile_id is linked if a
 * profile already exists for the email, otherwise left null.
 */

const idOf = (value: string | { id: string } | null | undefined): string | null =>
  typeof value === "string" ? value : value && typeof value === "object" ? value.id : null;

export async function recordBookingPayment(session: Stripe.Checkout.Session) {
  const m = session.metadata || {};
  const paymentIntentId = idOf(session.payment_intent);
  if (m.type === "membership" || !m.email || !paymentIntentId) return { skipped: true as const };

  const admin = createAdminClient();

  const { data: salon } = await admin
    .from("salons")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!salon) throw new Error("No salon configured for payments");

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", m.email)
    .is("deleted_at", null)
    .maybeSingle();

  const paidInFull = m.payment_type === "full";
  const amountPence = session.amount_total ?? Math.round(Number(m.amount || 0) * 100);

  const { error } = await admin.from("payments").upsert(
    {
      salon_id: salon.id,
      profile_id: profile?.id ?? null,
      email: m.email,
      kind: paidInFull ? "full" : "deposit",
      // A pay-in-full charge settles immediately. A deposit is authorised
      // with manual capture and only actually "succeeded" once staff
      // capture it -- that approve/decline flow isn't built yet (see
      // docs/STRIPE_GOLIVE.md "known gaps"), so it sits as "processing"
      // until it is.
      status: paidInFull ? "succeeded" : "processing",
      amount_pence: amountPence,
      currency: (session.currency || "gbp").toUpperCase(),
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id: idOf(session.customer),
    },
    { onConflict: "stripe_payment_intent_id", ignoreDuplicates: true },
  );
  if (error) throw new Error(`Could not record payment: ${error.message}`);
  return { ok: true as const };
}
