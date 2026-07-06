import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export const generateInvoicePDF = (order) => {
  if (!order) return;

  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const navy = [11, 31, 51];
  const gold = [212, 175, 55];
  const lightGray = [245, 245, 245];
  const darkText = [30, 30, 30];

  // Header
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setTextColor(...gold);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("STYLE AVENUE", 14, 17);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Fashion Store", 14, 25);
  doc.text("Official Tax Invoice", 14, 32);

  doc.setTextColor(...gold);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 14, 17, { align: "right" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: SA-${order.id}`, pageWidth - 14, 25, {
    align: "right",
  });
  doc.text(`Tracking: ${order.trackingId || "N/A"}`, pageWidth - 14, 32, {
    align: "right",
  });

  // Info Boxes
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, 52, 84, 47, 3, 3, "F");
  doc.roundedRect(112, 52, 84, 47, 3, 3, "F");

  doc.setTextColor(...darkText);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Order Information", 20, 62);
  doc.text("Customer Information", 118, 62);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.text(`Order ID: #${order.id}`, 20, 71);
  doc.text(`Order Date: ${formatDate(order.createdAt)}`, 20, 78);
  doc.text(`Status: ${order.status || "Pending"}`, 20, 85);
  doc.text(`Payment: ${order.paymentMethod || "COD"}`, 20, 92);

  doc.text(`Name: ${order.customer || "N/A"}`, 118, 71);
  doc.text(`Email: ${order.email || "N/A"}`, 118, 78);
  doc.text(`Phone: ${order.phone || "N/A"}`, 118, 85);

  const addressLines = doc.splitTextToSize(
    `Address: ${order.address || "N/A"}`,
    70
  );
  doc.text(addressLines, 118, 92);

  // Table
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
    startY: 112,
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

  const shipping = Number(order.shippingFee || 0);
  const grandTotal = Number(order.total || subtotal + shipping || 0);

  // Total Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(120, finalY - 4, 76, 38, 3, 3, "F");

  doc.setTextColor(...darkText);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text("Subtotal", 126, finalY + 4);
  doc.text(formatCurrency(subtotal), 190, finalY + 4, { align: "right" });

  doc.text("Shipping", 126, finalY + 12);
  doc.text(formatCurrency(shipping), 190, finalY + 12, { align: "right" });

  doc.setDrawColor(210, 210, 210);
  doc.line(126, finalY + 17, 190, finalY + 17);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.setFontSize(12);
  doc.text("Grand Total", 126, finalY + 27);
  doc.text(formatCurrency(grandTotal), 190, finalY + 27, { align: "right" });

  // Note
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.text(
    "Note: This invoice is computer generated and does not require a signature.",
    14,
    finalY + 48
  );

  // Footer
  doc.setDrawColor(...gold);
  doc.line(14, pageHeight - 22, pageWidth - 14, pageHeight - 22);

  doc.setTextColor(...darkText);
  doc.setFontSize(9);
  doc.text("Thank you for shopping with Style Avenue.", 14, pageHeight - 14);

  doc.setTextColor(100, 100, 100);
  doc.text(
    "raza@styleavenue.pk | www.styleavenue.pk",
    14,
    pageHeight - 8
  );

  doc.save(`Style-Avenue-Invoice-${order.trackingId || order.id}.pdf`);
};