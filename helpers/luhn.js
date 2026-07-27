/**
 * Implementación del algoritmo de Luhn para validación de números de tarjeta.
 *
 * Replica exactamente el método IsValidLuhn() privado del TransactionService.cs:
 *   1. Eliminar espacios del número de tarjeta
 *   2. Invertir la cadena de dígitos
 *   3. Cada segundo dígito (posición par desde el primero invertido) se multiplica por 2
 *   4. Si el resultado > 9, se le resta 9
 *   5. La suma de todos los dígitos procesados debe ser divisible por 10
 *
 * @param {string} cardNumber - Número de tarjeta (puede incluir espacios)
 * @returns {boolean} true si el número pasa la validación de Luhn
 */
export const isValidLuhn = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');

  // Validar que solo contenga dígitos
  if (!/^\d+$/.test(cleaned)) return false;

  const digits = cleaned.split('').reverse();
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    let n = parseInt(digits[i], 10);

    // Duplicar cada segundo dígito (índice impar en el array invertido)
    if (i % 2 !== 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    sum += n;
  }

  return sum % 10 === 0;
};
