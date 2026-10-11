'use client';

import { useState, FormEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/actions/categories';
import type { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface SettingsPageClientProps {
  categories: Category[];
  userName: string;
  userEmail: string;
}

export function SettingsPageClient({ categories, userName, userEmail }: SettingsPageClientProps) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    const data = form.getValues();
    
    const formData = new FormData();
    formData.append('name', data.name);
    
    const result = await createCategoryAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Category created');
      form.reset();
      // Refresh would happen via revalidatePath
      window.location.reload();
    }
    setIsSubmitting(false);
  };

  const handleUpdateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    const data = form.getValues();
    
    const formData = new FormData();
    formData.append('id', editingCategory.id);
    formData.append('name', data.name);
    
    const result = await updateCategoryAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Category updated');
      setEditingCategory(null);
      form.reset();
      window.location.reload();
    }
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Works using it will become uncategorized.')) return;
    
    const formData = new FormData();
    formData.append('id', id);
    
    const result = await deleteCategoryAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Category deleted');
      window.location.reload();
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.reset({ name: category.name });
    setIsDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={userName}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Account settings are managed through Supabase Auth. 
            Only the authorized email ({userEmail}) can access this library.
          </p>
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_name">Name</Label>
                    <Controller
                      name="name"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="category_name"
                          placeholder="Category name"
                          disabled={isSubmitting}
                          autoFocus
                        />
                      )}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingCategory ? 'Update' : 'Create'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {localCategories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No categories yet. Create one to organize your works.
            </p>
          ) : (
            <div className="space-y-2">
              {localCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditCategory(category)}
                      aria-label="Edit category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive hover:text-destructive"
                      aria-label="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default View</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>Grid</option>
              <option>List</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Items per page</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>24</option>
              <option>48</option>
              <option>96</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5">
            <div>
              <p className="font-medium text-destructive">Delete All Data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all works, categories, and images. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" disabled>
              Delete Everything
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}