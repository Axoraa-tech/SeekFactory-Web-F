/**
 * Link to the RFQ form about what the buyer is looking at, so the form arrives filled in:
 * - a product (product page, a seek showing it): factory and product are fixed;
 * - a factory (its page, a chat with it): the factory is fixed, the buyer picks one of its products;
 * - nothing (navbar "Post RFQ"): the buyer picks category, factory and product from lists.
 * `reel` links the RFQ to the seek (video) it was sent from.
 */
export function rfqHref(target: { manufacturer?: string; product?: string; reel?: string } = {}) {
  const params = new URLSearchParams();
  if (target.manufacturer) params.set("manufacturer", target.manufacturer);
  if (target.product) params.set("product", target.product);
  if (target.reel) params.set("reel", target.reel);
  const query = params.toString();
  return query ? `/rfq/new?${query}` : "/rfq/new";
}
