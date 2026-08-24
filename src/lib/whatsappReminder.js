import { 
  getLocalCustomers, 
  getLocalSettings, 
  addReminderLog, 
  getLocalReminderLogs 
} from "./firebase";
import { formatCurrency } from "./utils";

export function generateWhatsAppMessage(customer, upiId, shopName) {
  const paymentLink = `https://aonestar.app/pay?cust=${customer.id}&amount=${customer.current_balance}`;
  
  return `Hello *${customer.name}*,\n\n` +
    `This is an automated payment reminder from *${shopName}*.\n` +
    `----------------------------------------\n` +
    `• *Current Outstanding Balance:* ${formatCurrency(customer.current_balance)}\n` +
    `• *Due Amount:* ${formatCurrency(customer.current_balance)}\n` +
    `• *UPI ID for Payment:* ${upiId}\n` +
    `• *Secure Pay Link:* ${paymentLink}\n` +
    `----------------------------------------\n` +
    `Please clear your bill at your earliest convenience. Thank you for your continued business!`;
}

export function sendWhatsAppReminderToCustomer(customer, openWindow = true) {
  const settings = getLocalSettings();
  const rawPhone = customer.whatsapp_number || customer.phone || "";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");

  if (!cleanPhone) {
    addReminderLog({
      customer_id: customer.id,
      customer_name: customer.name,
      sent_at: new Date().toISOString(),
      amount: customer.current_balance,
      status: "failed",
      error_message: "No valid WhatsApp phone number provided."
    });
    return { success: false, url: "", message: "Missing phone number" };
  }

  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const message = generateWhatsAppMessage(customer, settings.upi_id || "aonestar@upi", settings.shop_name || "A ONE STAR");
  const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

  addReminderLog({
    customer_id: customer.id,
    customer_name: customer.name,
    sent_at: new Date().toISOString(),
    amount: customer.current_balance,
    status: "successful"
  });

  if (openWindow && typeof window !== "undefined") {
    window.open(waUrl, "_blank");
  }

  return { success: true, url: waUrl, message };
}

export function runDailyWhatsAppReminders(openWindow = true) {
  const settings = getLocalSettings();

  if (!settings.reminder_enabled_global) {
    return { totalProcessed: 0, successful: 0, failed: 0, skipped: 0 };
  }

  const customers = getLocalCustomers();
  const logs = getLocalReminderLogs();
  const todayDateStr = new Date().toISOString().split("T")[0];

  let successful = 0;
  let failed = 0;
  let skipped = 0;
  let totalProcessed = 0;

  customers.forEach((customer) => {
    if (customer.current_balance > 0 && customer.reminder_enabled !== false) {
      const sentToday = logs.some(
        (log) => log.customer_id === customer.id && log.sent_at.startsWith(todayDateStr) && log.status === "successful"
      );

      if (sentToday) {
        skipped++;
        return;
      }

      totalProcessed++;
      const result = sendWhatsAppReminderToCustomer(customer, openWindow);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }
  });

  return { totalProcessed, successful, failed, skipped };
}
