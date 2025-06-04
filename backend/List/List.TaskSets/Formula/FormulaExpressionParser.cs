using List.TaskSets.Formula.Nodes;
using System;
using System.Collections.Generic;
using System.Globalization;

namespace List.TaskSets.Formula
{
    /// <summary>
    ///    Parsuje výraz s podporou:
    ///      - súčtu a odčítania (+, -) 
    ///      - násobenia a delenia (*, /) 
    ///      - premenných typu “~X” (VariableNode)
    ///      - premenných typu “$X” (MaxVariableNode)
    ///      - konštánt (ConstantNode)
    ///      - zátvoriek “( … )”
    /// 
    ///    Výraz má gramatiku:
    ///      Expression := Term { ("+" | "-") Term }
    ///      Term       := Factor { ("*" | "/") Factor }
    ///      Factor     := "~"<IDENT> 
    ///                  | "$"<IDENT> 
    ///                  | <číslo> 
    ///                  | "(" Expression ")"
    /// 
    ///    Pri volaní Parse(“( ~DU + ~KV ) / ( $DU + $KV ) ”) 
    ///    dostaneme AST, ktoré korektne zodpovedá 
    ///    ( (DU + KV) / (Max(DU) + Max(KV)) ).
    /// </summary>
    public class FormulaExpressionParser
    {
        private List<string> _tokens = new();
        private int _pos;

        /// <summary>
        ///   Hlavná metóda na volanie — vráti koreň AST pre daný reťazec.
        /// </summary>
        public FormulaNode Parse(string input)
        {
            _tokens = Tokenize(input);
            _pos = 0;
            var root = ParseExpression();

            if (_pos < _tokens.Count)
            {
                throw new Exception($"Neplatný výraz – zvyšné tokeny od indexu {_pos}: “{string.Join(" ", _tokens.GetRange(_pos, _tokens.Count - _pos))}”");
            }

            return root;
        }

        /// <summary>
        ///   Rozdelí vstupný reťazec na samostatné tokeny: “(”, “)”, “+”, “-”, “*”, “/”, “~X”, “$X”, alebo čísla.
        ///   Napríklad “( ~DU + 5 )” → ["(", "~DU", "+", "5", ")"]
        /// </summary>
        private List<string> Tokenize(string input)
        {
            var spaced = input
                .Replace("(", " ( ")
                .Replace(")", " ) ")
                .Replace("+", " + ")
                .Replace("-", " - ")
                .Replace("*", " * ")
                .Replace("/", " / ");

            var parts = spaced
                .Split(new[] { ' ', '\t', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            return new List<string>(parts);
        }

        /// <summary>
        ///   Expression := Term { ("+" | "-") Term }
        /// </summary>
        private FormulaNode ParseExpression()
        {
            // najprv parseujeme jeden "Term"
            var node = ParseTerm();

            // potom dokiaľ nasledovať + alebo -, berieme ďalší Term a zabalíme do BinaryNode
            while (_pos < _tokens.Count)
            {
                var token = _tokens[_pos];
                if (token == "+" || token == "-")
                {
                    _pos++; // posuň sa za operátor
                    var rhs = ParseTerm();
                    node = new BinaryNode
                    {
                        Operator = token,
                        Left = node,
                        Right = rhs
                    };
                }
                else
                {
                    break;
                }
            }

            return node;
        }

        /// <summary>
        ///   Term := Factor { ("*" | "/") Factor }
        /// </summary>
        private FormulaNode ParseTerm()
        {
            var node = ParseFactor();

            // dokiaľ ďalší token je * alebo /, spawnujeme nové BinaryNode
            while (_pos < _tokens.Count)
            {
                var token = _tokens[_pos];
                if (token == "*" || token == "/")
                {
                    _pos++; 
                    var rhs = ParseFactor();
                    node = new BinaryNode
                    {
                        Operator = token,
                        Left = node,
                        Right = rhs
                    };
                }
                else
                {
                    break;
                }
            }

            return node;
        }

        /// <summary>
        ///   Factor := "~"<IDENT> | "$"<IDENT> | <číslo> | "(" Expression ")"
        /// </summary>
        private FormulaNode ParseFactor()
        {
            if (_pos >= _tokens.Count)
            {
                throw new Exception("Neočakávaný koniec výrazu pri parseFactor.");
            }

            var token = _tokens[_pos++];

            // 1) zatvorka → rekurzívne parse výrazu a očakávame pravej zátvorky
            if (token == "(")
            {
                var inside = ParseExpression();

                if (_pos >= _tokens.Count || _tokens[_pos] != ")")
                {
                    throw new Exception("Očakávala sa ‘)’ zatvorka.");
                }
                _pos++; // zoberieme “)”
                return inside;
            }

            // 2) "~X" → VariableNode
            if (token.StartsWith("~"))
            {
                var varName = token.Substring(1);
                if (string.IsNullOrWhiteSpace(varName))
                    throw new Exception("Neplatný názov premennej od ‘~’.");

                return new VariableNode
                {
                    Name = varName
                };
            }

            // 3) "$X" → MaxVariableNode
            if (token.StartsWith("$"))
            {
                var varName = token.Substring(1);
                if (string.IsNullOrWhiteSpace(varName))
                    throw new Exception("Neplatný názov premennej od ‘$’.");

                return new MaxVariableNode
                {
                    Name = varName
                };
            }

            // 4) číslo → ConstantNode
            if (double.TryParse(token, NumberStyles.Any, CultureInfo.InvariantCulture, out var number))
            {
                return new ConstantNode
                {
                    Value = number
                };
            }

            // 5) neznámy token
            throw new Exception($"Neznámy token pri parseFactor: “{token}”.");
        }
    }
}
