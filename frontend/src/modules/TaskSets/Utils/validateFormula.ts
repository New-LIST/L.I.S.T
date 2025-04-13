// validateFormula.ts
export function validateFormula(
  input: string,
  allowedVariables: string[]
): { valid: boolean; error?: string } {
  const tokens = tokenize(input);
  let index = 0;
  console.log("Validating")
  try {
    parseExpression();
    if (index < tokens.length) {
      return { valid: false, error: "Príliš veľa tokenov." };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }

  function tokenize(expr: string): string[] {
    return expr.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/);
  }

  function parseExpression(): void {
    if (tokens[index] !== "(") {
      throw new Error(`Očakávaná zatvorka '(', dostal '${tokens[index]}'`);
    }
    index++; // preskoč "("

    parseOperand();

    const operator = tokens[index];
    if (!["+", "-", "*", "/"].includes(operator)) {
      throw new Error(`Neplatný operátor: '${operator}'`);
    }
    index++;

    parseOperand();

    if (tokens[index] !== ")") {
      throw new Error(`Očakávaná zatvorka ')', dostal '${tokens[index]}'`);
    }
    index++; // preskoč ")"
  }

  function parseOperand(): void {
    const token = tokens[index];
    if (!token) throw new Error("Chýbajúci operand.");

    if (token === "(") {
      parseExpression();
    } else if (token.startsWith("~") || token.startsWith("$")) {
      const name = token.slice(1);
      if (!allowedVariables.includes(name)) {
        throw new Error(`Nepovolená premenná: '${token}'`);
      }
      index++;
    } else if (!isNaN(Number(token))) {
      index++;
    } else {
      throw new Error(`Neplatný operand: '${token}'`);
    }
  }
}
