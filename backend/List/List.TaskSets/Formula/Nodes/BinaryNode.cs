namespace List.TaskSets.Formula.Nodes;

public class BinaryNode : FormulaNode
{
    public override string Type => "Binary";
    public string Operator { get; set; } = string.Empty; // +, -, *, /
    public FormulaNode Left { get; set; } = null!;
    public FormulaNode Right { get; set; } = null!;
}
