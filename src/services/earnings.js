import Api from "./api";

export const getWithdrawalRequests = async () => {
  const response = await Api.get("withdrawal_requests");
  return {
    withdrawalRequests: response.data?.withdrawal_requests || [],
    earningsBalanceCents: response.data?.earnings_balance_cents ?? 0,
    pagination: response.data?.pagination,
  };
};

export const createWithdrawalRequest = async (amountCents, upiId) => {
  const response = await Api.post("withdrawal_requests", {
    amount_cents: amountCents,
    upi_id: upiId,
  });
  return response.data?.withdrawal_request || null;
};

export const cancelWithdrawalRequest = async (withdrawalRequestId) => {
  const response = await Api.post(`withdrawal_requests/${withdrawalRequestId}/cancel`);
  return response.data?.message;
};
