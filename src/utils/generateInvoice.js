// ES6 syntax — required for React
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export const generateInvoice = (order, user) => {
  // Initialize document with better settings
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });

  // Set default font
  doc.setFont("helvetica");

  // 🔹 Branding Header with styling
  doc.setFillColor(33, 150, 243); // Brand color
  doc.rect(0, 0, 210, 30, "F");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("YourBrand.in", 15, 20);
  doc.setFontSize(14);
  doc.text("TAX INVOICE", 180, 20, null, null, "right");

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // 🔹 Invoice Metadata Section
  doc.setFontSize(10);
  doc.text(`Invoice Number: INV-${order.id.padStart(6, "0") || "XXXXXX"}`, 15, 40);
  doc.text(`Order Number: ${order.id || "N/A"}`, 15, 46);
  doc.text(`Invoice Date: ${format(new Date(), "dd MMM, yyyy")}`, 15, 52);
  doc.text(`Order Date: ${format(new Date(order.createdAt?.seconds * 1000 || Date.now()), "dd MMM, yyyy")}`, 15, 58);
  
  // GSTIN and other legal info if applicable
  doc.text("GSTIN: 22ABCDE1234F1Z5", 180, 40, null, null, "right");
  doc.text("PAN: ABCDE1234F", 180, 46, null, null, "right");
  doc.text("State: Maharashtra", 180, 52, null, null, "right");
  doc.text("Code: 27", 180, 58, null, null, "right");

  // 🔹 Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 65, 195, 65);

  // 🔹 Fixed Billing & Shipping Information Section
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("BILL TO:", 15, 75);
doc.text("SHIP TO:", 105, 75);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

// Fixed: Properly format the address as an array of strings
const billingAddress = [
  user.fullName || "N/A",
  order.billingAddress?.street || order.address || "N/A",
  `${order.billingAddress?.city || ""} ${order.billingAddress?.state || ""} ${order.billingAddress?.pincode ? `- ${order.billingAddress.pincode}` : ""}`.trim(),
  `Phone: ${user.phone || "N/A"}`,
  `Email: ${user.email || "N/A"}`
].filter(line => line && line !== " - "); // Remove empty lines

// Fixed: Use doc.text() with proper array formatting
doc.text(billingAddress, 15, 81);

// Fixed: Shipping address handling
const shippingAddressLines = [
  user.fullName || "N/A",
  order.shippingAddress?.street || order.address || "N/A",
  `${order.shippingAddress?.city || ""} ${order.shippingAddress?.state || ""} ${order.shippingAddress?.pincode ? `- ${order.shippingAddress.pincode}` : ""}`.trim(),
  `Phone: ${order.shippingAddress?.phone || user.phone || "N/A"}`
].filter(line => line && line !== " - "); // Remove empty lines

doc.text(shippingAddressLines, 105, 81);
  // 🔹 Item Table with enhanced styling
  const items = order.items.map((item, i) => [
    i + 1,
    item.name,
    item.quantity,
    `₹${item.price.toLocaleString("en-IN")}`,
    `₹${(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    "18%",
    `₹${((item.price * item.quantity) * 0.18).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
  ]);

  // Add empty row for spacing
  doc.setFontSize(12);
  doc.text(" ", 15, 110);

  autoTable(doc, {
    startY: 115,
    head: [
      [
        "#", 
        "Description", 
        "Qty", 
        "Unit Price", 
        "Net Amount", 
        "Tax Rate", 
        "Tax Amount"
      ]
    ],
    body: items,
    theme: "grid",
    headStyles: { 
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center"
    },
    columnStyles: {
      0: { halign: "center" }, // #
      1: { halign: "left" },   // Description
      2: { halign: "center" }, // Qty
      3: { halign: "right" },  // Unit Price
      4: { halign: "right" },  // Net Amount
      5: { halign: "center" }, // Tax Rate
      6: { halign: "right" }   // Tax Amount
    },
    styles: { 
      fontSize: 10,
      cellPadding: 3,
      overflow: "linebreak"
    },
    margin: { left: 15, right: 15 },
    tableWidth: "auto"
  });

  // 🔹 Totals Section
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const shippingCharges = order.shippingCharges || 0;
  const total = subtotal + tax + shippingCharges;
  const amountInWords = `Rupees ${convertToWords(Math.round(total))} only`;

  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text("Amount in Words:", 15, finalY);
  doc.setFont("helvetica", "bold");
  doc.text(amountInWords, 15, finalY + 6);
  
  doc.setFont("helvetica", "normal");
  autoTable(doc, {
    startY: finalY + 10,
    body: [
      ["Subtotal:", `₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
      ["Tax (18%):", `₹${tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
      ["Shipping Charges:", `₹${shippingCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
      ["Total Amount:", `₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`]
    ],
    columnStyles: {
      0: { cellWidth: 40, halign: "right", fontStyle: "bold" },
      1: { cellWidth: 30, halign: "right" }
    },
    styles: { 
      fontSize: 11,
      cellPadding: 5,
      lineWidth: 0.1
    },
    margin: { left: 125 },
    tableWidth: 70
  });

  // 🔹 Payment Information
  doc.setFontSize(10);
  doc.text("Payment Information:", 15, finalY + 40);
  doc.text(`Mode of Payment: ${order.paymentMethod || "Debit Card"}`, 15, finalY + 46);
  doc.text(`Transaction ID: ${order.transactionId || "XXXX-XXXX"}`, 15, finalY + 52);
  doc.text(`Payment Status: ${order.paymentStatus || "Paid"}`, 15, finalY + 58);

  // 🔹 Terms & Conditions
  doc.setFontSize(9);
  doc.text("Terms & Conditions:", 15, finalY + 70);
  doc.text("- Goods once sold will not be taken back.", 15, finalY + 76);
  doc.text("- All disputes are subject to Mumbai jurisdiction.", 15, finalY + 82);
  doc.text("- Please retain this invoice for warranty purposes.", 15, finalY + 88);

  // 🔹 Footer with company info
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("This is a computer-generated invoice and does not require a physical signature.", 105, 285, null, null, "center");
  doc.text("YourBrand.in | Regd. Office: 123 Business Park, Mumbai - 400001 | support@yourbrand.in | +91 9876543210", 105, 290, null, null, "center");

  // Save the PDF
  doc.save(`Invoice_${order.id || format(new Date(), "yyyyMMddHHmmss")}.pdf`);
};

// Helper function to convert numbers to words (simplified version)
function convertToWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  if (num === 0) return "Zero";
  
  let result = "";
  
  if (num >= 10000000) {
    result += convertToWords(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  
  if (num >= 100000) {
    result += convertToWords(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  
  if (num >= 1000) {
    result += convertToWords(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  
  if (num > 0) {
    if (num < 10) {
      result += ones[num];
    } else if (num < 20) {
      const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
      result += teens[num - 10];
    } else {
      result += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        result += " " + ones[num % 10];
      }
    }
  }
  
  return result.trim();
}