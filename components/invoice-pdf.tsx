"use client";

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  restaurant_name: string;
  restaurant_address?: string;
  restaurant_email?: string;
  restaurant_phone?: string;
  amount: number;
  status: string;
  period_start?: string;
  period_end?: string;
  created_at: string;
  orders?: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    total: number;
    created_at: string;
  }>;
}

export async function generateInvoicePDF(invoiceData: InvoiceData) {
  // Dynamic imports to avoid SSR issues
  const jsPDF = (await import("jspdf")).default;
  const html2canvas = (await import("html2canvas")).default;

  const issueDate = new Date(invoiceData.created_at);
  const periodEnd = invoiceData.period_end || invoiceData.created_at;
  const dueDate = new Date(periodEnd);
  dueDate.setDate(dueDate.getDate() + 7);

  const subtotal = invoiceData.orders?.reduce((sum, order) => sum + order.subtotal, 0) || 0;

  // Create a hidden div for the invoice HTML
  const invoiceContainer = document.createElement("div");
  invoiceContainer.style.position = "absolute";
  invoiceContainer.style.left = "-9999px";
  invoiceContainer.style.width = "210mm"; // A4 width
  invoiceContainer.style.padding = "20mm";
  invoiceContainer.style.backgroundColor = "#ffffff";
  invoiceContainer.style.fontFamily = "var(--font-geist-sans), -apple-system, sans-serif";

  // Build table rows
  let tableRows = "";
  if (invoiceData.orders && invoiceData.orders.length > 0) {
    invoiceData.orders.forEach((order) => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const itemDate = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const endDate = new Date(periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          tableRows += `
            <tr>
              <td style="padding: 12px 0; border-bottom: 0.5px solid #e6e6e6;">
                <div style="font-size: 10pt;">${item.name}</div>
                <div style="font-size: 8pt; color: #666; margin-top: 2px;">${itemDate} - ${endDate}</div>
              </td>
              <td style="padding: 12px 8px; border-bottom: 0.5px solid #e6e6e6; text-align: center;">${item.quantity}</td>
              <td style="padding: 12px 8px; border-bottom: 0.5px solid #e6e6e6; text-align: right;">AED ${item.price.toFixed(2)}</td>
              <td style="padding: 12px 0; border-bottom: 0.5px solid #e6e6e6; text-align: right;">AED ${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `;
        });
      }

      // Add delivery fee
      if (order.delivery_fee > 0) {
        const itemDate = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const endDate = new Date(periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        tableRows += `
          <tr>
            <td style="padding: 12px 0; border-bottom: 0.5px solid #e6e6e6;">
              <div style="font-size: 10pt;">Delivery Fee</div>
              <div style="font-size: 8pt; color: #666; margin-top: 2px;">${itemDate} - ${endDate}</div>
            </td>
            <td style="padding: 12px 8px; border-bottom: 0.5px solid #e6e6e6; text-align: center;">1</td>
            <td style="padding: 12px 8px; border-bottom: 0.5px solid #e6e6e6; text-align: right;">AED ${order.delivery_fee.toFixed(2)}</td>
            <td style="padding: 12px 0; border-bottom: 0.5px solid #e6e6e6; text-align: right;">AED ${order.delivery_fee.toFixed(2)}</td>
          </tr>
        `;
      }

      // Add service fee
      if (order.service_fee > 0) {
        const itemDate = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const endDate = new Date(periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        tableRows += `
          <tr>
            <td style="padding: 12px 0; border-bottom: 0.5px solid #e6e6e6;">
              <div style="font-size: 10pt;">Service Fee</div>
              <div style="font-size: 8pt; color: #666; margin-top: 2px;">${itemDate} - ${endDate}</div>
            </td>
            <td style="padding: 12px 8px; border-bottom: 0.5px solid #e6e6e6; text-align: center;">1</td>
            <td style="padding: 12px 8px; border-bottom: 0.5px solid #e6e6e6; text-align: right;">AED ${order.service_fee.toFixed(2)}</td>
            <td style="padding: 12px 0; border-bottom: 0.5px solid #e6e6e6; text-align: right;">AED ${order.service_fee.toFixed(2)}</td>
          </tr>
        `;
      }
    });
  }

  invoiceContainer.innerHTML = `
    <div style="font-family: var(--font-geist-sans), -apple-system, sans-serif; color: #000;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <h1 style="font-size: 28pt; font-weight: 700; margin: 0;">Invoice</h1>
        <img src="/logo.png" alt="Cuts Logo" style="width: 60px; height: 60px; object-fit: contain;" />
      </div>

      <!-- Invoice details -->
      <div style="margin-bottom: 30px;">
        <div style="margin-bottom: 6px;">
          <span style="font-weight: 600; font-size: 10pt;">Invoice number</span>
          <span style="margin-left: 40px; font-size: 10pt;">${invoiceData.invoiceNumber}</span>
        </div>
        <div style="margin-bottom: 6px;">
          <span style="font-weight: 600; font-size: 10pt;">Date of issue</span>
          <span style="margin-left: 51px; font-size: 10pt;">${issueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
        <div>
          <span style="font-weight: 600; font-size: 10pt;">Date due</span>
          <span style="margin-left: 76px; font-size: 10pt;">${dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      <!-- Two columns -->
      <div style="display: flex; gap: 80px; margin-bottom: 30px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 10pt; margin-bottom: 6px;">Cuts LLC</div>
          <div style="font-size: 10pt; margin-bottom: 4px;">Baqir Husain</div>
          <div style="font-size: 10pt; margin-bottom: 4px;">Dubai, United Arab Emirates</div>
          <div style="font-size: 10pt;">support@cuts.ae</div>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 10pt; margin-bottom: 6px;">Bill to</div>
          <div style="font-weight: 600; font-size: 10pt; margin-bottom: 4px;">${invoiceData.restaurant_name}</div>
          ${invoiceData.restaurant_address ? `<div style="font-size: 10pt; margin-bottom: 4px;">${invoiceData.restaurant_address}</div>` : ""}
          ${invoiceData.restaurant_email ? `<div style="font-size: 10pt; margin-bottom: 4px;">${invoiceData.restaurant_email}</div>` : ""}
          ${invoiceData.restaurant_phone ? `<div style="font-size: 10pt;">${invoiceData.restaurant_phone}</div>` : ""}
        </div>
      </div>

      <!-- Amount due -->
      <div style="font-size: 16pt; font-weight: 700; margin-bottom: 30px;">
        AED ${invoiceData.amount.toFixed(2)} due ${dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </div>

      <!-- Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 0.5px solid #e6e6e6;">
            <th style="text-align: left; font-weight: 600; font-size: 10pt; padding: 8px 0;">Description</th>
            <th style="text-align: center; font-weight: 600; font-size: 10pt; padding: 8px;">Qty</th>
            <th style="text-align: right; font-weight: 600; font-size: 10pt; padding: 8px;">Unit price</th>
            <th style="text-align: right; font-weight: 600; font-size: 10pt; padding: 8px 0;">Amount</th>
          </tr>
        </thead>
        <tbody style="font-size: 10pt;">
          ${tableRows}
        </tbody>
      </table>

      <!-- Summary -->
      <div style="margin-top: 20px; margin-left: auto; width: 200px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 10pt;">
          <span>Subtotal</span>
          <span>AED ${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 10pt;">
          <span>Total</span>
          <span>AED ${invoiceData.amount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 10pt;">
          <span>Amount due</span>
          <span>AED ${invoiceData.amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(invoiceContainer);

  try {
    // Wait for fonts and images to load
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 100));

    // Convert to canvas
    const canvas = await html2canvas(invoiceContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save
    const fileName = `${invoiceData.invoiceNumber.replace(/\s+/g, "_")}_${invoiceData.restaurant_name.replace(/\s+/g, "_")}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(invoiceContainer);
  }
}

export async function downloadInvoicePDF(invoiceData: InvoiceData) {
  try {
    await generateInvoicePDF(invoiceData);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}
