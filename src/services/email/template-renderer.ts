export function renderTemplateString(
  template: string,
  variables: Record<string, string | number | boolean | null | undefined>
): string {
  if (!template) return "";

  // Replace simple conditionals like {{#if actionUrl}}...{{/if}}
  let rendered = template.replace(
    /\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, variableName, innerContent) => {
      const value = variables[variableName];
      if (value !== undefined && value !== null && value !== "" && value !== false) {
        return innerContent;
      }
      return "";
    }
  );

  // Replace variable tags like {{userName}}
  rendered = rendered.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (match, variableName) => {
      const val = variables[variableName];
      if (val !== undefined && val !== null) {
        return String(val);
      }
      return match;
    }
  );

  return rendered;
}

export const renderTemplate = renderTemplateString;
