/**
 * Sanitiza uma string HTML para prevenir ataques XSS
 * @param text O texto que pode conter caracteres HTML
 * @returns O texto sanitizado com caracteres HTML escapados
 */
export const sanitizeHtml = (text: string | undefined | null): string => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Sanitiza um objeto inteiro, escapando qualquer string que possa conter HTML
 * @param data O objeto a ser sanitizado
 * @returns Uma cópia sanitizada do objeto
 */
export const sanitizeObject = <T extends Record<string, any>>(data: T): T => {
  if (!data) return {} as T;
  
  const sanitized: Record<string, any> = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeHtml(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized as T;
};

/**
 * Remove scripts e HTML malicioso de uma string
 * Útil para conteúdo HTML que precisa ser renderizado como HTML
 * @param html String HTML potencialmente insegura
 * @returns String HTML com scripts e atributos perigosos removidos
 */
export const stripDangerousHtml = (html: string | undefined | null): string => {
  if (!html) return '';
  
  return String(html)
    // Remove tags de script
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    // Remove iframes
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove objetos
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Remove embeds
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
};
