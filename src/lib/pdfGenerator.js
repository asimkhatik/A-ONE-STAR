import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to load shop logo image as Base64 Data URL for jsPDF
function loadLogoImage() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = "/logo.jpg";
  });
}

// Vector Rupee Symbol Renderer for jsPDF
function drawRupeeSymbol(doc, x, y, color = [30, 41, 59]) {
  try {
    doc.saveState();
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    
    const topY = y - 2.5;
    // Top horizontal bar
    doc.line(x, topY, x + 2.0, topY);
    // Second horizontal bar
    doc.line(x, topY + 0.8, x + 1.8, topY + 0.8);
    // Vertical stem
    doc.line(x + 0.4, topY, x + 0.4, topY + 1.4);
    // Loop right
    doc.line(x + 0.4, topY, x + 1.5, topY);
    doc.line(x + 1.5, topY, x + 1.5, topY + 0.8);
    doc.line(x + 1.5, topY + 0.8, x + 0.4, topY + 0.8);
    // Diagonal leg
    doc.line(x + 0.5, topY + 1.0, x + 1.8, topY + 2.4);
    
    doc.restoreState();
  } catch (e) {
    // Ignore canvas state drawing errors
  }
}

export async function generateCustomerLedgerPDF(customer, ledgerItems = [], settings = {}) {
  try {
    const logoDataUrl = await loadLogoImage();
    const doc = new jsPDF();

    // Color Palette
    const brandGreen = [11, 61, 46]; // #0B3D2E
    const gold = [212, 175, 55]; // #D4AF37
    const textDark = [30, 41, 59]; // #1E293B

    const shopName = (settings.shop_name || "A ONE STAR").toUpperCase();
    const tagline = settings.tagline || "Bharosa Bhi, Hisaab Bhi";
    const phone = settings.phone || "";
    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    // 1. TOP HEADER BANNER
    doc.setFillColor(...brandGreen);
    doc.rect(0, 0, 210, 38, "F");

    // Render Official Logo if available
    let textX = 14;
    if (logoDataUrl) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(12, 5, 28, 28, 3, 3, "F");
        doc.addImage(logoDataUrl, "JPEG", 13, 6, 26, 26);
        textX = 44;
      } catch (e) {
        textX = 14;
      }
    }

    // Left Brand Information
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(shopName, textX, 16);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gold);
    doc.text(tagline, textX, 23);

    if (phone) {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.text(`Phone: ${phone}`, textX, 30);
    }

    // Right Statement Title & Date Metadata
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("CUSTOMER ACCOUNT STATEMENT", 196, 16, { align: "right" });

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("Statement Period: All Transactions", 196, 23, { align: "right" });
    doc.text(`Generated On: ${todayStr}`, 196, 30, { align: "right" });

    // 2. SIMPLIFIED ACCOUNT HOLDER SECTION (Only Customer Name & Mobile Number)
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 44, 182, 22, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 44, 182, 22, 3, 3, "D");

    doc.setTextColor(...brandGreen);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("ACCOUNT HOLDER", 20, 51);

    doc.setTextColor(...textDark);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Name:", 20, 59);
    doc.setFont("helvetica", "normal");
    doc.text(customer?.name || "N/A", 50, 59);

    doc.setFont("helvetica", "bold");
    doc.text("Mobile Number:", 115, 59);
    doc.setFont("helvetica", "normal");
    doc.text(customer?.phone || customer?.whatsapp_number || "N/A", 143, 59);

    // 3. TRANSACTION TABLE DATA PREPARATION
    const tableColumn = ["Date", "Description", "Reference", "Debit", "Credit", "Balance"];
    
    const tableRows = ledgerItems.map((item) => {
      // Format Date
      let dateStr = item.date ? new Date(item.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) : "-";

      // Format Description
      let desc = "";
      if (item.type === "Sale") {
        if (item.weight_kg && item.rate) {
          desc = `Sale — ${item.weight_kg} kg @ ₹${item.rate}/kg`;
        } else {
          desc = "Live Chicken Sale";
        }
        if (item.notes) {
          desc += ` (${item.notes})`;
        }
      } else if (item.type === "Payment") {
        desc = `Payment Received (${item.payment_mode || "Cash"})`;
        if (item.notes) {
          desc += ` (${item.notes})`;
        }
      } else if (item.type === "Opening Balance") {
        desc = "Opening Balance";
        if (item.description && item.description !== "Opening Balance") {
          desc += ` (${item.description})`;
        }
      } else {
        desc = item.description || "-";
      }

      // Format Reference ID
      let refStr = "-";
      if (item.type === "Sale") {
        refStr = item.id ? (item.id.length > 8 ? "SL-" + item.id.slice(-6).toUpperCase() : item.id) : "SALE";
      } else if (item.type === "Payment") {
        refStr = item.id ? (item.id.length > 8 ? "PAY-" + item.id.slice(-6).toUpperCase() : item.id) : "PAYMENT";
      } else if (item.type === "Opening Balance") {
        refStr = "OP-BAL";
      }

      // Format Monetary Amounts
      let debitStr = item.debit > 0 
        ? "₹" + item.debit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
        : "-";

      let creditStr = item.credit > 0 
        ? "₹" + item.credit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
        : "-";

      let balValue = item.balance || 0;
      let balStr = "₹" + Math.abs(balValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (balValue < 0 ? " Cr" : "");

      return [dateStr, desc, refStr, debitStr, creditStr, balStr];
    });

    // 4. TRANSACTION TABLE GENERATION (Fixed Width Layout & Auto Wrapping)
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 72,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 3.5,
        overflow: "linebreak"
      },
      headStyles: {
        fillColor: brandGreen,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
        halign: "left"
      },
      bodyStyles: {
        textColor: textDark
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 24, halign: "left" },    // Date
        1: { cellWidth: 62, halign: "left" },    // Description
        2: { cellWidth: 26, halign: "center" },  // Reference
        3: { cellWidth: 22, halign: "right" },   // Debit
        4: { cellWidth: 22, halign: "right" },   // Credit
        5: { cellWidth: 26, halign: "right" }    // Balance
      },
      didParseCell: (data) => {
        // Replace non-standard Rupee glyphs with spaces to prevent jsPDF '¹' encoding artifacts
        if (Array.isArray(data.cell.text)) {
          data.cell.rawText = data.cell.text.join(" ");
          data.cell.text = data.cell.text.map((line) => line.replace(/₹/g, "  "));
        }
      },
      didDrawCell: (data) => {
        try {
          if (data.section === "body" && data.cell.rawText && data.cell.rawText.includes("₹")) {
            const text = data.cell.rawText;
            const cell = data.cell;
            const doc = data.doc;
            
            const paddingRight = typeof cell.padding === "number" ? cell.padding : (cell.padding?.right ?? 3.5);
            const paddingLeft = typeof cell.padding === "number" ? cell.padding : (cell.padding?.left ?? 3.5);

            if (cell.styles.halign === "right") {
              const cleanVal = text.replace("₹", "").trim();
              const valWidth = doc.getTextWidth(cleanVal);
              const rupeeX = cell.x + cell.width - paddingRight - valWidth - 2.8;
              const rupeeY = cell.y + cell.height / 2 + 1;
              drawRupeeSymbol(doc, rupeeX, rupeeY, textDark);
            } else if (cell.styles.halign === "left") {
              const parts = text.split("₹");
              let prefixWidth = doc.getTextWidth(parts[0]);
              const rupeeX = cell.x + paddingLeft + prefixWidth + 0.2;
              const rupeeY = cell.y + cell.height / 2 + 1;
              drawRupeeSymbol(doc, rupeeX, rupeeY, textDark);
            }
          }
        } catch (err) {
          // Ignore cell draw error
        }
      }
    });

    // 5. CLOSING ACCOUNT BALANCE SECTION (At bottom of table)
    let finalY = (doc.lastAutoTable?.finalY || 100) + 8;
    if (finalY + 28 > 275) {
      doc.addPage();
      finalY = 20;
    }

    const currentBal = customer?.current_balance || 0;
    const isOutstanding = currentBal > 0;
    const boxBg = isOutstanding ? [255, 241, 242] : [240, 253, 244];
    const boxBorder = isOutstanding ? [254, 205, 211] : [167, 243, 208];
    const valColor = isOutstanding ? [225, 29, 72] : [16, 185, 129];

    doc.setFillColor(...boxBg);
    doc.roundedRect(14, finalY, 182, 24, 3, 3, "F");
    doc.setDrawColor(...boxBorder);
    doc.roundedRect(14, finalY, 182, 24, 3, 3, "D");

    doc.setTextColor(...textDark);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("CLOSING ACCOUNT BALANCE", 22, finalY + 8);

    const formattedBal = Math.abs(currentBal).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...valColor);
    
    const balText = "  " + formattedBal + (currentBal < 0 ? " (Advance Credit)" : "");
    doc.text(balText, 22, finalY + 18);
    drawRupeeSymbol(doc, 22, finalY + 18, valColor);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text(isOutstanding ? "Amount Outstanding" : "Account Fully Settled", 190, finalY + 14, { align: "right" });

    // 6. FOOTER (Every Page)
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 284, 196, 284);
      doc.text(
        `Thank you for doing business with ${settings.shop_name || "A ONE STAR"}.`,
        14,
        289
      );
      doc.text(`Page ${i} of ${totalPages}`, 196, 289, { align: "right" });
    }

    const fileName = `${(customer?.name || "Customer").replace(/[^a-zA-Z0-9]/g, "_")}_Statement.pdf`;
    
    // Save PDF
    doc.save(fileName);
  } catch (globalErr) {
    console.error("PDF Generation Error:", globalErr);
  }
}
