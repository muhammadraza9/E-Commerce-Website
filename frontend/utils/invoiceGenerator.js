import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/services/api";

const DEFAULT_SETTINGS = {
  storeName: "Style Avenue",
  storeEmail: "support@styleavenue.pk",
  phoneNumber: "+92 312 6779452",
  storeAddress: "Style Avenue, Main Market, Rawalpindi, Punjab, Pakistan",
  shippingFee: 0,
  taxPercentage: 0,
};

const formatCurrency = (amount) => {
  return `Rs ${Number(amount || 0).toLocaleString("en-PK")}`;
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getSettings = async () => {
  try {
    const res = await api.get("/admin-settings");
    return {
      ...DEFAULT_SETTINGS,
      ...res.data,
    };
  } catch (error) {
    console.log("Invoice settings load failed:", error);
    return DEFAULT_SETTINGS;
  }
};

export const generateInvoicePDF = async (order, type = "user") => {
  if (!order) return;

  const settings = await getSettings();

  const isAdmin = type === "admin";
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const navy = [11, 31, 51];
  const gold = [212, 175, 55];
  const lightGray = [245, 245, 245];
  const darkText = [30, 30, 30];

  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setTextColor(...gold);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(settings.storeName.toUpperCase(), 14, 17);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Fashion Store", 14, 25);
  doc.text(isAdmin ? "Admin Order Invoice" : "Official Customer Invoice", 14, 32);

  doc.setTextColor(...gold);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 14, 17, { align: "right" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${settings.orderPrefix || "SA"}-${order.id}`, pageWidth - 14, 25, {
    align: "right",
  });
  doc.text(`Tracking: ${order.trackingId || "N/A"}`, pageWidth - 14, 32, {
    align: "right",
  });

  doc.setFillColor(...lightGray);

  if (isAdmin) {
    doc.roundedRect(14, 52, 58, 58, 3, 3, "F");
    doc.roundedRect(76, 52, 58, 58, 3, 3, "F");
    doc.roundedRect(138, 52, 58, 58, 3, 3, "F");

    doc.setTextColor(...darkText);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    doc.text("Order Info", 19, 62);
    doc.text("Customer Info", 81, 62);
    doc.text("Payment Info", 143, 62);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");

    doc.text(`Order ID: #${order.id}`, 19, 72);
    doc.text(`Date: ${formatDate(order.createdAt)}`, 19, 79);
    doc.text(`Status: ${order.status || "Pending"}`, 19, 86);
    doc.text(`Tracking: ${order.trackingId || "N/A"}`, 19, 93);

    doc.text(`Name: ${order.customer || "N/A"}`, 81, 72);
    doc.text(`Email: ${order.email || "N/A"}`, 81, 79);
    doc.text(`Phone: ${order.phone || "N/A"}`, 81, 86);

    const addressLines = doc.splitTextToSize(
      `Address: ${order.address || "N/A"}`,
      50
    );
    doc.text(addressLines, 81, 93);

    doc.text(`Method: ${order.paymentMethod || "COD"}`, 143, 72);
    doc.text(`Status: ${order.paymentStatus || "PENDING"}`, 143, 79);
    doc.text(`Txn Ref: ${order.txnRefNo || "N/A"}`, 143, 86);
    doc.text(`Total: ${formatCurrency(order.total)}`, 143, 93);
  } else {
    doc.roundedRect(14, 52, 84, 47, 3, 3, "F");
    doc.roundedRect(112, 52, 84, 47, 3, 3, "F");

    doc.setTextColor(...darkText);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    doc.text("Order Information", 20, 62);
    doc.text("Delivery Information", 118, 62);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.text(`Order ID: #${order.id}`, 20, 71);
    doc.text(`Tracking ID: ${order.trackingId || "N/A"}`, 20, 78);
    doc.text(`Order Date: ${formatDate(order.createdAt)}`, 20, 85);
    doc.text(`Order Status: ${order.status || "Pending"}`, 20, 92);

    doc.text(`Customer: ${order.customer || "N/A"}`, 118, 71);
    doc.text(`Phone: ${order.phone || "N/A"}`, 118, 78);
    doc.text(`Payment: ${order.paymentMethod || "COD"}`, 118, 85);

    const addressLines = doc.splitTextToSize(
      `Address: ${order.address || "N/A"}`,
      70
    );
    doc.text(addressLines, 118, 92);
  }

  const tableRows =
    order.items?.map((item, index) => {
      const productName = item.product?.name || `Product ${index + 1}`;
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      const subtotal = quantity * price;

      return [
        index + 1,
        productName,
        quantity,
        formatCurrency(price),
        formatCurrency(subtotal),
      ];
    }) || [];

  autoTable(doc, {
    startY: isAdmin ? 122 : 112,
    head: [["#", "Product", "Qty", "Unit Price", "Subtotal"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: navy,
      textColor: gold,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: darkText,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 82 },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 36, halign: "right" },
      4: { cellWidth: 36, halign: "right" },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  const subtotal =
    order.items?.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0) || 0;

  const grandTotal = Number(order.total || subtotal);
  const taxPercentage = Number(settings.taxPercentage || 0);
  const taxAmount = Math.round((subtotal * taxPercentage) / 100);
  const shipping = Math.max(grandTotal - subtotal - taxAmount, 0);

  doc.setFillColor(...lightGray);
  doc.roundedRect(120, finalY - 4, 76, 46, 3, 3, "F");

  doc.setTextColor(...darkText);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text("Subtotal", 126, finalY + 4);
  doc.text(formatCurrency(subtotal), 190, finalY + 4, { align: "right" });

  doc.text("Shipping", 126, finalY + 12);
  doc.text(formatCurrency(shipping), 190, finalY + 12, { align: "right" });

  doc.text(`Tax (${taxPercentage}%)`, 126, finalY + 20);
  doc.text(formatCurrency(taxAmount), 190, finalY + 20, { align: "right" });

  doc.setDrawColor(210, 210, 210);
  doc.line(126, finalY + 25, 190, finalY + 25);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.setFontSize(12);
  doc.text("Grand Total", 126, finalY + 35);
  doc.text(formatCurrency(grandTotal), 190, finalY + 35, { align: "right" });

  doc.setTextColor(90, 90, 90);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.text(
    isAdmin
      ? "Admin copy: This invoice includes customer and payment information."
      : "Customer copy: Please keep this invoice for your order record.",
    14,
    finalY + 56
  );

  doc.text(
    "Note: This invoice is computer generated and does not require a signature.",
    14,
    finalY + 63
  );

  doc.setDrawColor(...gold);
  doc.line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);

  doc.setTextColor(...darkText);
  doc.setFontSize(9);
  doc.text(`Thank you for shopping with ${settings.storeName}.`, 14, pageHeight - 17);

  doc.setTextColor(100, 100, 100);
  doc.text(
    `${settings.storeEmail} | ${settings.phoneNumber}`,
    14,
    pageHeight - 11
  );

  doc.text(settings.storeAddress || "", 14, pageHeight - 6);

  doc.save(
    `${settings.storeName.replace(/\s+/g, "-")}-${
      isAdmin ? "Admin" : "Invoice"
    }-${order.trackingId || order.id}.pdf`
  );
};