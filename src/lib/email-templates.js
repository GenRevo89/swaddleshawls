// Dynamic order confirmation email template generator
// Produces Stripe-tier HTML email from order data

const PRODUCT_IMAGES = {
    "MBS-001": "/products/MBS-001_1.png",
    "DSH-001": "/products/DSH-001_1.png",
    "JPP-001": "/products/JPP-001_1.png",
    "ILB-001": "/products/ILB-001_1.png",
    "GSS-001": "/products/GSS-001_1.png",
    "JLS-001": "/products/JLS-001_1.png",
    "MNB-001": "/products/MNB-001_1.png",
    "BNB-001": "/products/BNB-001_1.png",
};

function getProductImage(item) {
    const baseUrl = process.env.NEXT_PUBLIC_BRAND_URL || "https://swaddleshawls.com";
    // Try SKU match first
    if (item.sku) {
        const skuBase = item.sku.split("_")[0]; // handle variant SKUs
        if (PRODUCT_IMAGES[skuBase]) return `${baseUrl}${PRODUCT_IMAGES[skuBase]}`;
    }
    // Fuzzy match by product name
    const name = (item.productName || "").toLowerCase();
    if (name.includes("marigold")) return `${baseUrl}/products/MBS-001_1.png`;
    if (name.includes("desert")) return `${baseUrl}/products/DSH-001_1.png`;
    if (name.includes("jaipur") && name.includes("peony")) return `${baseUrl}/products/JPP-001_1.png`;
    if (name.includes("indigo")) return `${baseUrl}/products/ILB-001_1.png`;
    if (name.includes("goa") || name.includes("sandalwood")) return `${baseUrl}/products/GSS-001_1.png`;
    if (name.includes("loungewear") || name.includes("jaipur") && name.includes("set")) return `${baseUrl}/products/JLS-001_1.png`;
    if (name.includes("midnight")) return `${baseUrl}/products/MNB-001_1.png`;
    if (name.includes("burp") || name.includes("bib")) return `${baseUrl}/products/BNB-001_1.png`;
    return `${baseUrl}/SwaddleShawlsLogoTransparent.png`; // fallback
}

/**
 * Generate order confirmation email HTML
 * @param {Object} order - Order document from MongoDB
 * @returns {string} HTML email content
 */
export function generateOrderConfirmationEmail(order) {
    const baseUrl = process.env.NEXT_PUBLIC_BRAND_URL || "https://swaddleshawls.com";
    const firstName = (order.customerName || "there").split(" ")[0];
    const subtotal = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const shipping = Math.max(0, order.total - subtotal);
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const itemRows = order.items.map(item => {
        const img = getProductImage(item);
        const lineTotal = (item.price * item.quantity).toFixed(2);
        return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #F3F4F6;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="72" valign="top">
                  <img src="${img}" alt="${item.productName}" width="60" height="60" style="width:60px;height:60px;border-radius:8px;object-fit:cover;border:1px solid #F3F4F6;background-color:#FAF7F2;" />
                </td>
                <td valign="top" style="padding-left:16px;">
                  <p style="margin:0 0 4px 0;font-size:15px;font-weight:500;color:#111827;">${item.productName}</p>
                  <p style="margin:0;font-size:14px;color:#6B7280;">Qty ${item.quantity}</p>
                </td>
                <td valign="top" align="right" style="width:80px;">
                  <p style="margin:0;font-size:15px;font-weight:500;color:#111827;">$${lineTotal}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }).join("");

    const addr = order.shippingAddress;
    const hasAddress = addr && (addr.street || addr.city);
    const addressHtml = hasAddress
        ? [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join("<br>")
        : '<span style="color:#9CA3AF;font-style:italic;">Address pending</span>';

    const paymentMethod = order.paymentMethod === "stripe" ? "Stripe" : "BasaltSurge";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SwaddleShawls Receipt</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block}
    table{border-collapse:collapse!important}
    body{margin:0!important;padding:0!important;width:100%!important;background-color:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;color:#111827}
    @media screen and (max-width:600px){.container{width:100%!important;border-radius:0!important}.content-padding{padding:32px 24px!important}}
  </style>
</head>
<body style="background-color:#F9FAFB;margin:0;padding:40px 0;">
  <div style="display:none;max-height:0px;overflow:hidden;">Your SwaddleShawls receipt for $${order.total.toFixed(2)}. Thank you for your purchase!</div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F9FAFB;">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table border="0" cellpadding="0" cellspacing="0" class="container" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:48px 40px 32px 40px;border-bottom:1px solid #F3F4F6;" class="content-padding">
              <a href="${baseUrl}" target="_blank" style="text-decoration:none;">
                <img src="${baseUrl}/SwaddleShawlsLogoTransparent.png" alt="SwaddleShawls" width="160" style="width:160px;max-width:100%;height:auto;margin:0 auto;" />
              </a>
              <h1 style="margin:24px 0 8px 0;font-size:24px;font-weight:600;color:#111827;letter-spacing:-0.02em;">Receipt</h1>
              <p style="margin:0;font-size:15px;color:#6B7280;">Order ${order.orderNumber}</p>
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding:40px 40px 16px 40px;" class="content-padding">
              <p style="margin:0 0 16px 0;font-size:16px;font-weight:500;color:#111827;">Hi ${firstName},</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">Thanks for your purchase. We are getting your order ready to be shipped. We will notify you when it has been sent.</p>
            </td>
          </tr>
          <!-- Items -->
          <tr>
            <td style="padding:24px 40px 32px 40px;" class="content-padding">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                ${itemRows}
              </table>
              <!-- Totals -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;">
                <tr><td width="30%"></td><td width="70%">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="left" style="padding:6px 0;font-size:14px;color:#4B5563;">Subtotal</td>
                      <td align="right" style="padding:6px 0;font-size:15px;font-weight:500;color:#111827;">$${subtotal.toFixed(2)}</td>
                    </tr>
                    ${shipping > 0.01 ? `<tr>
                      <td align="left" style="padding:6px 0;font-size:14px;color:#4B5563;">Shipping</td>
                      <td align="right" style="padding:6px 0;font-size:15px;font-weight:500;color:#111827;">$${shipping.toFixed(2)}</td>
                    </tr>` : ""}
                    <tr>
                      <td align="left" style="padding:16px 0 0 0;font-size:16px;font-weight:600;color:#111827;border-top:1px solid #E5E7EB;padding-top:16px;">Total</td>
                      <td align="right" style="padding:16px 0 0 0;font-size:20px;font-weight:600;color:#111827;border-top:1px solid #E5E7EB;padding-top:16px;">$${order.total.toFixed(2)}</td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>
          <!-- Details -->
          <tr>
            <td style="padding:32px 40px;background-color:#F9FAFB;border-top:1px solid #E5E7EB;" class="content-padding">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50%" valign="top">
                    <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6B7280;">Shipping details</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#111827;">${order.customerName}<br>${addressHtml}</p>
                  </td>
                  <td width="50%" valign="top">
                    <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6B7280;">Payment method</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#111827;">${paymentMethod}<br>${order.email}<br>${orderDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Footer -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
          <tr>
            <td align="center" style="padding:32px 24px;">
              <p style="margin:0 0 12px 0;font-size:13px;color:#6B7280;line-height:1.5;">If you have any questions, reply to this email or contact us at <a href="mailto:support@swaddleshawls.com" style="color:#4F46E5;text-decoration:none;">support@swaddleshawls.com</a>.</p>
              <p style="margin:0;font-size:13px;color:#9CA3AF;">&copy; 2026 SwaddleShawls.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate order shipping email HTML with tracking link
 * @param {Object} order - Order document from MongoDB
 * @returns {string} HTML email content
 */
export function generateShippingEmail(order) {
    const baseUrl = process.env.NEXT_PUBLIC_BRAND_URL || "https://swaddleshawls.com";
    const firstName = (order.customerName || "there").split(" ")[0];
    const trackingUrl = order.trackingUrl || "#";
    const trackingNumber = order.trackingNumber || "Pending";
    const carrier = order.trackingCarrier || "Carrier";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped!</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block}
    table{border-collapse:collapse!important}
    body{margin:0!important;padding:0!important;width:100%!important;background-color:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;color:#111827}
    @media screen and (max-width:600px){.container{width:100%!important;border-radius:0!important}.content-padding{padding:32px 24px!important}}
  </style>
</head>
<body style="background-color:#F9FAFB;margin:0;padding:40px 0;">
  <div style="display:none;max-height:0px;overflow:hidden;">Good news! Order ${order.orderNumber} has shipped. Track your package inside.</div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F9FAFB;">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table border="0" cellpadding="0" cellspacing="0" class="container" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03);">
          <tr>
            <td align="center" style="padding:48px 40px 32px 40px;border-bottom:1px solid #F3F4F6;" class="content-padding">
              <a href="${baseUrl}" target="_blank" style="text-decoration:none;">
                <img src="${baseUrl}/SwaddleShawlsLogoTransparent.png" alt="SwaddleShawls" width="160" style="width:160px;max-width:100%;height:auto;margin:0 auto;" />
              </a>
              <h1 style="margin:24px 0 8px 0;font-size:24px;font-weight:600;color:#111827;letter-spacing:-0.02em;">Your Order is on the Way</h1>
              <p style="margin:0;font-size:15px;color:#6B7280;">Order ${order.orderNumber}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px 40px;" class="content-padding">
              <p style="margin:0 0 16px 0;font-size:16px;font-weight:500;color:#111827;">Hi ${firstName},</p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#4B5563;">Great news! Your SwaddleShawls order is packed and has been handed off to ${carrier}.</p>
              <div style="background-color:#F3F4F6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6B7280;">Tracking Number</p>
                <p style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#111827;letter-spacing:0.02em;">${trackingNumber}</p>
                <a href="${trackingUrl}" target="_blank" style="display:inline-block;background-color:#111827;color:#FFFFFF;font-size:15px;font-weight:500;text-decoration:none;padding:12px 24px;border-radius:8px;">Track Package</a>
              </div>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#6B7280;text-align:center;">Please allow up to 24 hours for the tracking link to show movement.</p>
            </td>
          </tr>
        </table>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
          <tr>
            <td align="center" style="padding:32px 24px;">
              <p style="margin:0 0 12px 0;font-size:13px;color:#6B7280;line-height:1.5;">If you have any questions, reply to this email or contact us at <a href="mailto:support@swaddleshawls.com" style="color:#4F46E5;text-decoration:none;">support@swaddleshawls.com</a>.</p>
              <p style="margin:0;font-size:13px;color:#9CA3AF;">&copy; 2026 SwaddleShawls.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
