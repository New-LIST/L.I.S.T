namespace List.TaskSets.Formula.Nodes;

public class MaxVariableNode : FormulaNode
{
    public override string Type => "MaxVariable";
    public string Name { get; set; } = string.Empty;
}
