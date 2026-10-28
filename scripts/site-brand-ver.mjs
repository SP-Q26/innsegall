/** Single source · sword-in-stone mark · bump when fixtures/brand master changes */
export const BRAND_ICON_VER = "20261028a";
export const BRAND_MARK_HREF = `/icons/innsegall-mark.png?v=${BRAND_ICON_VER}`;
export const FAVICON_32_HREF = `/icons/favicon-32.png?v=${BRAND_ICON_VER}`;

export function brandMarkImgHtml() {
  return `<img class="brand-mark" src="${BRAND_MARK_HREF}" width="40" height="40" alt="" decoding="async" aria-hidden="true">`;
}
