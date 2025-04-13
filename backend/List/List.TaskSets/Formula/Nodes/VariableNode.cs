namespace List.TaskSets.Formula.Nodes;

public class VariableNode : FormulaNode
{
    public override string Type => "Variable";
    public string Name { get; set; } = string.Empty;
}
