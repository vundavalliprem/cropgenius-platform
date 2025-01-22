import { useState } from "react";
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function FinancialForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("seeds");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('financial_records')
        .insert({
          amount: Number(amount),
          category,
          type,
          description,
          record_date: new Date().toISOString().split('T')[0],
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial record added successfully",
      });

      setAmount("");
      setDescription("");
    } catch (error) {
      console.error('Error adding financial record:', error);
      toast({
        title: "Error",
        description: "Failed to add financial record",
        variant: "destructive",
      });
    }
  };

  return (
    <Card title="Add Financial Record" description="Record income or expenses">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-primary-600">Type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-primary-600">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seeds">Seeds</SelectItem>
              <SelectItem value="fertilizer">Fertilizer</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="labor">Labor</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-primary-600">Amount ($)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-primary-600">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>

        <Button type="submit" className="w-full">Add Record</Button>
      </form>
    </Card>
  );
}