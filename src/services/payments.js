import Api from "./api";

export const fetchWalletTransactions = async () => {
  const response = await Api.get("wallet_transactions");
  return {
    walletBalanceCents: response.data?.wallet_balance_cents ?? 0,
    walletTransactions: response.data?.wallet_transactions ?? [],
  };
};

export const createCashfreeOrder = async (amountCents) => {
  const response = await Api.post("cashfree/payments", {
    amount_cents: amountCents,
  });

  return response.data;
};
