export const fallbackImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <rect width="600" height="450" fill="#f1f3f6"/>
  <rect x="60" y="70" width="480" height="310" rx="24" fill="#ffffff" stroke="#d8e0f0"/>
  <circle cx="300" cy="185" r="58" fill="#2874f0" opacity="0.15"/>
  <path d="M250 260h100l-25-40-18 24-22-32z" fill="#2874f0" opacity="0.45"/>
  <text x="300" y="330" text-anchor="middle" font-family="Arial" font-size="24" fill="#667085">Product Image</text>
</svg>`)} `;

export function getProductImage(product) {
  return product?.images?.[0] || fallbackImage;
}
