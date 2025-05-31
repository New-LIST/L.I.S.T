// List.TaskSets/Formula/FormulaEvaluator.cs

using System;
using List.TaskSets.Formula.Nodes;

namespace List.TaskSets.Formula
{
    public static class FormulaEvaluator
    {
        /// <summary>
        /// Vyhodnotí stromovú formulu.
        /// </summary>
        /// <param name="node">koren stromu (BinaryNode, VariableNode, MaxVariableNode, ConstantNode)</param>
        /// <param name="variableResolver">
        /// 1) pre VariableNode (typ „~X“) dostaneš názov X a vraciaš hodnotu študentových X  
        /// 2) pre MaxVariableNode (typ „$X“) ostaneš názov X a vraciaš maximálni možný počet bodov peo X  
        /// </param>
        public static double Evaluate(
            FormulaNode node,
            Func<string, double> variableResolver,
            Func<string, double> maxVariableResolver)
        {
            if (node == null)
                throw new ArgumentNullException(nameof(node),
                  "Uzol vo formule je null – musíš to skontrolovať pri deserializácii.");

            return node switch
            {
                ConstantNode c => c.Value,
                VariableNode v => variableResolver(v.Name),
                MaxVariableNode m => maxVariableResolver(m.Name),
                BinaryNode b => ApplyOperator(
                                          b.Operator,
                                          Evaluate(b.Left, variableResolver, maxVariableResolver),
                                          Evaluate(b.Right, variableResolver, maxVariableResolver)
                                        ),
                _ => throw new NotSupportedException($"Neznámý typ uzlu: {node.GetType().Name}")
            };
        }

        private static double ApplyOperator(string op, double left, double right)
        {
            return op switch
            {
                "+" => left + right,
                "-" => left - right,
                "*" => left * right,
                "/" => right == 0
                        ? throw new DivideByZeroException("Dělení nulou ve formuli")
                        : left / right,
                _ => throw new NotSupportedException($"Neznámý operátor: {op}")
            };
        }
    }
}
