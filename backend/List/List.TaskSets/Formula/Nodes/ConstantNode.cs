namespace List.TaskSets.Formula.Nodes;

public class ConstantNode : FormulaNode
{
    public override string Type => "Constant";
    public double Value { get; set; }
}
