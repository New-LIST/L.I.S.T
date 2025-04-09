using List.TaskSets.Formula.Nodes;
using System.Globalization;

namespace List.TaskSets.Formula;

public class FormulaExpressionParser
{
    public FormulaNode Parse(string input)
    {
        var tokens = Tokenize(input);
        var node = ParseTokens(tokens);
        return node;
    }

    private List<string> Tokenize(string input)
    {
        return input
            .Replace("(", " ( ")
            .Replace(")", " ) ")
            .Split(" ", StringSplitOptions.RemoveEmptyEntries)
            .ToList();
    }

    private FormulaNode ParseTokens(List<string> tokens)
    {
        var stack = new Stack<FormulaNode>();
        var opStack = new Stack<string>();

        foreach (var token in tokens)
        {
            if (token == "(" || token == ")") continue;

            if (IsOperator(token))
            {
                opStack.Push(token);
            }
            else if (token.StartsWith("~"))
            {
                var varName = token[1..];
                stack.Push(new VariableNode { Name = varName });
            }
            else if (token.StartsWith("$"))
            {
                var varName = token[1..];
                stack.Push(new MaxVariableNode { Name = varName });
            }
            else if (double.TryParse(token, NumberStyles.Any, CultureInfo.InvariantCulture, out var number))
            {
                stack.Push(new ConstantNode { Value = number });
            }
            else
            {
                throw new Exception($"Neznámy token: {token}");
            }

            // ak sú dvaja operandy a operátor, vytvárame uzol
            if (stack.Count >= 2 && opStack.Count >= 1)
            {
                var right = stack.Pop();
                var left = stack.Pop();
                var op = opStack.Pop();

                stack.Push(new BinaryNode
                {
                    Operator = op,
                    Left = left,
                    Right = right
                });
            }
        }

        if (stack.Count != 1)
            throw new Exception("Neplatná štruktúra výrazu.");

        return stack.Pop();
    }

    private bool IsOperator(string s) => s is "+" or "-" or "*" or "/";
}
