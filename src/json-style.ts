export type Styles = Record<string, Partial<CSSStyleDeclaration>>;
/**
 * Converts camel case properties of styles to kebab case to be assigned to the console CSS
 */
export function compileStyles(styles: Styles): Styles {
  const compiledStyles: Styles = {};
  for (const [type, cssProperties] of Object.entries(styles)) {
    const transformedCss = Object.entries(cssProperties)
      .map(([k, v]) => `${toKebabCase(k)}: ${v};`)
      .join("");
    compiledStyles[type] = transformedCss as Partial<CSSStyleDeclaration>;
  }
  return compiledStyles;
}

/**
 * Convert camel case to kebab case
 */
function toKebabCase(name: string): string {
  return name.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? "-" : "") + $.toLowerCase()
  );
}

function addStyles(element: HTMLStyleElement, styles: Styles, prefix = "") {
  for (const [type, css] of Object.entries(styles)) {
    element.innerHTML += `${prefix}${type} { ${css} }`;
  }
}

export const setStyle = (styles: Styles, targetElement?: HTMLElement) => {
  const style = document.createElement("style");
  addStyles(style, compileStyles(styles));

  if (targetElement) {
    style.setAttribute("scoped", "");
  }
  const parent =
    (targetElement && targetElement.parentElement) ||
    document.getElementsByTagName("head")[0];
  parent.appendChild(style);
};
