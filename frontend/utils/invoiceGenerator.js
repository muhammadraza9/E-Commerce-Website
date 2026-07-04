import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (order) => {
  if (!order) return;

  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(11, 31, 51);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(212, 175, 55);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("STYLE AVENUE", 14, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Official Invoice", 14, 24);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Invoice #${order.id}`, pageWidth - 45, 16);
  doc.text(`Tracking: ${order.trackingId}`, pageWidth - 75, 24);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Order Information", 14, 48);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Order ID: #${order.id}`, 14, 58);
  doc.text(`Tracking ID: ${order.trackingId}`, 14, 65);
  doc.text(
    `Order Date: ${new Date(order.createdAt).toLocaleDateString("en-PK")}`,
    14,
    72
  );
  doc.text(`Order Status: ${order.status}`, 14, 79);
  doc.text(`Payment Method: ${order.paymentMethod || "COD"}`, 14, 86);
  doc.text(`Payment Status: ${order.paymentStatus || "PENDING"}`, 14, 93);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 115, 48);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Name: ${order.customer || "N/A"}`, 115, 58);
  doc.text(`Email: ${order.email || "N/A"}`, 115, 65);
  doc.text(`Phone: ${order.phone || "N/A"}`, 115, 72);

  const addressLines = doc.splitTextToSize(
    `Address: ${order.address || "N/A"}`,
    80
  );
  doc.text(addressLines, 115, 79);

  const tableRows =
    order.items?.map((item, index) => {
      const productName = item.product?.name || `Product ${index + 1}`;
      const quantity = item.quantity || 1;
      const price = Number(item.price || 0);
      const subtotal = quantity * price;

      return [
        index + 1,
        productName,
        quantity,
        `Rs ${price}`,
        `Rs ${subtotal}`,
      ];
    }) || [];

  autoTable(doc, {
    startY: 110,
    head: [["#", "Product", "Qty", "Price", "Total"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [11, 31, 51],
      textColor: [212, 175, 55],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 85 },
      2: { cellWidth: 18 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  const subtotal = order.items?.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);

  const shipping = 0;
  const grandTotal = Number(order.total || subtotal || 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("Subtotal:", 145, finalY);
  doc.text(`Rs ${subtotal}`, 175, finalY);

  doc.text("Shipping:", 145, finalY + 8);
  doc.text(`Rs ${shipping}`, 175, finalY + 8);

  doc.setTextColor(212, 175, 55);
  doc.text("Grand Total:", 145, finalY + 18);
  doc.text(`Rs ${grandTotal}`, 175, finalY + 18);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.text(
    "Thank you for shopping with Style Avenue.",
    14,
    282
  );

  doc.text(
    "support@styleavenue.pk | www.styleavenue.pk",
    14,
    288
  );

  doc.save(`Style-Avenue-Invoice-${order.trackingId || order.id}.pdf`);
};