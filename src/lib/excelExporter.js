import * as XLSX from "xlsx";
import { formatDate } from "./utils";

export function exportSalesToExcel(sales, fileName = "Sales_Report.xlsx") {
  const data = sales.map((sale) => ({
    "Date": formatDate(sale.sale_date),
    "Customer": sale.customer_name || "N/A",
    "Broilers (Count)": sale.quantity_of_broilers || 0,
    "Weight (kg)": sale.weight_kg,
    "Rate (₹/kg)": sale.rate_per_kg,
    "Total Amount (₹)": sale.total_amount,
    "Notes": sale.notes || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
  XLSX.writeFile(workbook, fileName);
}

export function exportPaymentsToExcel(payments, fileName = "Payments_Report.xlsx") {
  const data = payments.map((pay) => ({
    "Date": formatDate(pay.payment_date),
    "Customer": pay.customer_name || "N/A",
    "Amount Received (₹)": pay.amount,
    "Payment Mode": pay.payment_mode,
    "Notes": pay.notes || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
  XLSX.writeFile(workbook, fileName);
}

export function exportCustomersToExcel(customers, fileName = "Customer_Directory.xlsx") {
  const data = customers.map((c) => ({
    "Customer Name": c.name,
    "Phone Number": c.phone || "N/A",
    "Address": c.address || "N/A",
    "Status": c.status.toUpperCase(),
    "Opening Balance (₹)": c.opening_balance,
    "Current Balance (₹)": c.current_balance,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
  XLSX.writeFile(workbook, fileName);
}
