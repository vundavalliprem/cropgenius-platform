import { useState, useEffect } from "react";
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const DEFAULT_CATEGORIES = {
  expense: [
    { value: "seeds", label: "Seeds" },
    { value: "fertilizer", label: "Fertilizer" },
    { value: "equipment", label: "Equipment" },
    { value: "labor", label: "Labor" },
    { value: "other", label: "Other" }
  ],
  income: [
    { value: "sales", label: "Crop Sales" },
    { value: "subsidies", label: "Subsidies" },
    { value: "other", label: "Other Income" }
  ]
};

const SUGGESTIONS = {
  seeds: ["Winter Wheat Seeds", "Corn Seeds", "Soybean Seeds"],
  fertilizer: ["NPK Fertilizer", "Organic Compost", "Nitrogen Supplement"],
  equipment: ["Tractor Maintenance", "New Tools", "Equipment Repair"],
  labor: ["Seasonal Workers", "Harvesting Labor", "Field Maintenance"],
  sales: ["Wheat Sale", "Corn Sale", "Soybean Sale"],
  subsidies: ["Government Subsidy", "Agricultural Grant", "Environmental Payment"],
  other: ["Miscellaneous Expense", "Other Cost", "Additional Income"]
};

export function FinancialForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<Record<string, { value: string; label: string }[]>>({
    expense: [],
    income: []
  });
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const { toast } = useToast();

  const categories = {
    expense: [...DEFAULT_CATEGORIES.expense, ...customCategories.expense],
    income: [...DEFAULT_CATEGORIES.income, ...customCategories.income]
  };

  useEffect(() => {
    if (category) {
      setSuggestions(SUGGESTIONS[category as keyof typeof SUGGESTIONS] || []);
    }
  }, [category]);

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

      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
    } catch (error) {
      console.error('Error adding financial record:', error);
      toast({
        title: "Error",
        description: "Failed to add financial record",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = () => {
    if (newCategory) {
      setCustomCategories(prev => ({
        ...prev,
        [newCategoryType]: [
          ...prev[newCategoryType as keyof typeof prev],
          { value: newCategory.toLowerCase(), label: newCategory }
        ]
      }));
      setNewCategory("");
      toast({
        title: "Success",
        description: "New category added successfully",
      });
    }
  };

  return (
    <Card title="Add Financial Record" description="Record income or expenses">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select whether this is an income or expense record</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-primary-600">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories[type as keyof typeof categories].map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-6">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Category Type</label>
                  <Select value={newCategoryType} onValueChange={setNewCategoryType}>
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
                  <label className="text-sm font-medium">Category Name</label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <label className="text-sm font-medium text-primary-600">Amount (₹)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-primary-600">Description</label>
          <div className="relative">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="mt-1"
            />
            {suggestions.length > 0 && description === "" && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => setDescription(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full gap-2">
          <Plus className="h-4 w-4" /> Add Record
        </Button>
      </form>
    </Card>
  );
}