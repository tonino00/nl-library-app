/**
 * Valida a força da senha com requisitos específicos
 * @param password A senha a ser validada
 * @returns Um objeto indicando se a senha é válida e uma mensagem de erro, se aplicável
 */
export const validatePassword = (password: string): { isValid: boolean, message: string } => {
  if (!password || password.length < 8) {
    return { 
      isValid: false, 
      message: 'A senha deve ter pelo menos 8 caracteres' 
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'A senha deve conter pelo menos uma letra maiúscula' 
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'A senha deve conter pelo menos uma letra minúscula' 
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return { 
      isValid: false, 
      message: 'A senha deve conter pelo menos um número' 
    };
  }
  
  if (!/[@#$%^&+=!]/.test(password)) {
    return { 
      isValid: false, 
      message: 'A senha deve conter pelo menos um caractere especial (@#$%^&+=!)' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Avalia a força da senha em uma escala de 0 a 100
 * @param password A senha a ser avaliada
 * @returns Um valor entre 0 (muito fraca) e 100 (muito forte)
 */
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Pontuação básica pelo comprimento
  strength += Math.min(password.length * 4, 40);
  
  // Pontos por diferentes tipos de caracteres
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[a-z]/.test(password)) strength += 10;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[@#$%^&+=!]/.test(password)) strength += 15;
  
  // Pontos por caracteres adicionais além do mínimo
  if (password.length > 8) strength += Math.min((password.length - 8) * 2, 10);
  
  return Math.min(strength, 100);
};

/**
 * Retorna uma mensagem descritiva da força da senha
 * @param strength Valor de força da senha (0-100)
 * @returns Uma string descrevendo a força da senha
 */
export const getPasswordStrengthLabel = (strength: number): string => {
  if (strength < 30) return 'Muito fraca';
  if (strength < 50) return 'Fraca';
  if (strength < 70) return 'Média';
  if (strength < 90) return 'Forte';
  return 'Muito forte';
};
