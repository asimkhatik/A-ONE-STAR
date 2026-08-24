import React, { useState } from "react";
import { X, QrCode, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { processOnlinePayment } from "../lib/paymentGateway";
import { getLocalSettings } from "../lib/firebase";
import { formatCurrency } from "../lib/utils";
import { toast } from "sonner";

export const PayNowModal = ({
  isOpen,
  onClose,
  customer,
  onSuccess
}) => {
  const settings = getLocalSettings();
  const [payAmount, setPayAmount] = useState(String(customer.current_balance || 0));
  const [selectedGateway, setSelectedGateway] = useState('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedTxnId, setVerifiedTxnId] = useState("");

  if (!isOpen) return null;

  const numAmount = parseFloat(payAmount) || 0;

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (numAmount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processOnlinePayment({
        customerId: customer.id,
        customerName: customer.name,
        amount: numAmount,
        paymentGateway: selectedGateway,
        paymentMode: "UPI",
        notes: `Online Bill Payment via ${selectedGateway}`
      });

      if (result.success) {
        setVerifiedTxnId(result.transactionId);
        setPaymentSuccess(true);
        toast.success(`Payment of ${formatCurrency(numAmount)} verified successfully`);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || "Payment verification failed.");
      }
    } catch (err) {
      toast.error("Payment Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans text-white">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover-white p-1 rounded-xl hover-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentSuccess ? (
          /* Payment Success Animation Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-2xl text-white">Payment Verified</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your payment has been securely verified and credited to your account.
              </p>
            </div>

            <div className="bg-[#18233c] border border-slate-800 p-4 rounded-2xl text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Transaction ID:</span>
                <span className="font-bold text-amber-300">{verifiedTxnId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(numAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Gateway:</span>
                <span className="font-bold text-white">{selectedGateway}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentSuccess(false);
                onClose();
              }}
              className="w-full bg-[#2563eb] hover-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Payment Selection Form */
          <form onSubmit={handlePaySubmit} className="p-6 sm-8 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                A ONE STAR • ONLINE PAYMENTS
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-white">
                Pay Bill Online
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current Due Balance: <span className="font-bold text-amber-300">{formatCurrency(customer.current_balance)}</span>
              </p>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount to Pay (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-[#18233c] border border-slate-700/80 rounded-xl text-lg font-extrabold text-white focus-none focus-blue-500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
                {[
                  { key, label },
                  { key, label },
                  { key, label },
                  { key, label },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedGateway(item.key )}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedGateway === item.key
                        ? "bg-blue-600/20 border-blue-500 text-white font-bold shadow-md"
                        : "bg-[#141e33] border-slate-800 text-slate-400 hover-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-[#141d33] border border-slate-800/80 p-3 rounded-xl flex items-center space-x-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>256-bit Encrypted SSL Gateway & Webhook Signature Verified</span>
            </div>

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#2563eb] hover-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 text-base active-[0.99]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Gateway...</span>
                </>
              ) : (
                <>
                  <span>Pay {formatCurrency(numAmount)} Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
