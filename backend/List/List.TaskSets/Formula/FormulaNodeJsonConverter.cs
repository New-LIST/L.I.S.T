using System.Text.Json;
using System.Text.Json.Serialization;
using List.TaskSets.Formula.Nodes;

namespace List.TaskSets.Formula;

public class FormulaNodeJsonConverter : JsonConverter<FormulaNode>
{
    public override FormulaNode? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var doc = JsonDocument.ParseValue(ref reader);
        var type = doc.RootElement.GetProperty("type").GetString();

        return type switch
        {
            "Binary" => JsonSerializer.Deserialize<BinaryNode>(doc.RootElement.GetRawText(), options),
            "Variable" => JsonSerializer.Deserialize<VariableNode>(doc.RootElement.GetRawText(), options),
            "MaxVariable" => JsonSerializer.Deserialize<MaxVariableNode>(doc.RootElement.GetRawText(), options),
            "Constant" => JsonSerializer.Deserialize<ConstantNode>(doc.RootElement.GetRawText(), options),
            _ => throw new NotSupportedException($"Unknown node type: {type}")
        };
    }

    public override void Write(Utf8JsonWriter writer, FormulaNode value, JsonSerializerOptions options)
    {
        switch (value)
        {
            case BinaryNode binary:
                JsonSerializer.Serialize(writer, binary, options);
                break;
            case VariableNode variable:
                JsonSerializer.Serialize(writer, variable, options);
                break;
            case ConstantNode constant:
                JsonSerializer.Serialize(writer, constant, options);
                break;
            default:
                throw new NotSupportedException($"Unknown node type: {value.GetType()}");
        }
    }
}
