import { addPayment, recalculateCustomerBalance } from "./firebase";

// Generate secure signature & transaction ID
export function generateTransactionId() {
  const prefix = "TXN_AONESTAR_";
  const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}${Date.now()}_${randomPart}`;
}

// Simulate Backend Webhook / Signature Verification
export function processOnlinePayment(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const txnId = generateTransactionId();

        const newPayment = addPayment({
          customer_id: params.customerId,
          customer_name: params.customerName,
          payment_date: new Date().toISOString().split("T")[0],
          amount: params.amount,
          payment_mode: params.paymentMode,
          payment_gateway: params.paymentGateway,
          transaction_id: txnId,
          payment_status: "successful",
          notes: params.notes || `Online Payment via ${params.paymentGateway} (Ref: ${txnId})`
        });

        recalculateCustomerBalance(params.customerId);

        resolve({
          success: true,
          payment: newPayment,
          transactionId: txnId,
          message: "Payment successfully verified and updated!"
        });
      } catch (err) {
        resolve({
          success: false,
          transactionId: "",
          message: err.message || "Payment verification failed."
        });
      }
    }, 1500);
  });
}
