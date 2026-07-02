import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../../utils/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  children?: Category[];
  _count?: { products: number };
}

const categorySchema = z.object({
  name: z.string().min(1, 'Required').max(100),
  slug: z
    .string()
    .min(1, 'Required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  parentId: z.string().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function CategoryRow({
  category,
  depth = 0,
  onDelete,
  onAddChild,
  deleting,
}: {
  category: Category;
  depth?: number;
  onDelete: (id: string, name: string) => void;
  onAddChild: (parentId: string, parentName: string) => void;
  deleting: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (category.children?.length ?? 0) > 0;

  return (
    <>
      <tr className="hover:bg-surface-50/50 transition-colors group">
        <td className="px-5 py-3">
          <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setExpanded((e) => !e)} className="p-0.5 rounded text-surface-400 hover:text-surface-700">
                {expanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className="text-sm font-medium text-surface-900">{category.name}</span>
          </div>
        </td>
        <td className="px-5 py-3">
          <code className="text-xs bg-surface-100 px-2 py-0.5 rounded text-surface-700">{category.slug}</code>
        </td>
        <td className="px-5 py-3 text-sm text-surface-500">{category.description ?? '—'}</td>
        <td className="px-5 py-3 text-sm text-surface-700 text-center">{category._count?.products ?? 0}</td>
        <td className="px-5 py-3">
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddChild(category.id, category.name)}
              title="Add subcategory"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="danger"
              isLoading={deleting}
              onClick={() => onDelete(category.id, category.name)}
              title="Delete"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </Button>
          </div>
        </td>
      </tr>
      {expanded &&
        category.children?.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            onDelete={onDelete}
            onAddChild={onAddChild}
            deleting={deleting}
          />
        ))}
    </>
  );
}

export function AdminCategories() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>();
  const [defaultParentName, setDefaultParentName] = useState<string | undefined>();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  watch('name', '');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories-tree'],
    queryFn: () => api.get<Category[]>('/categories/tree').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (values: CategoryForm) => api.post('/categories', values),
    onSuccess: () => {
      toast.success('Category created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories-tree'] });
      setShowCreate(false);
      reset();
      setDefaultParentId(undefined);
      setDefaultParentName(undefined);
    },
    onError: (e: { message: string }) => toast.error(e.message ?? 'Failed to create category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories-tree'] });
    },
    onError: () => toast.error('Cannot delete — category may have products or subcategories'),
  });

  function openCreate(parentId?: string, parentName?: string) {
    reset();
    setDefaultParentId(parentId);
    setDefaultParentName(parentName);
    if (parentId) setValue('parentId', parentId);
    setShowCreate(true);
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete category "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-500">
          {categories?.length ?? 0} top-level categories
        </p>
        <Button size="sm" onClick={() => openCreate()}>
          <PlusIcon className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 border border-surface-200 rounded-xl">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-surface-200 rounded-2xl overflow-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-surface-50 border-b border-surface-100">
              <tr>
                {['Name', 'Slug', 'Description', 'Products', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {categories?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-surface-400 text-sm">
                    No categories yet — add one above
                  </td>
                </tr>
              )}
              {categories?.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onDelete={handleDelete}
                  onAddChild={openCreate}
                  deleting={deleteMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); reset(); }}
        title={defaultParentName ? `Add Subcategory under "${defaultParentName}"` : 'Add Category'}
      >
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <Input
            label="Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Electronics"
            onChange={(e) => {
              setValue('name', e.target.value);
              setValue('slug', slugify(e.target.value));
            }}
          />
          <Input
            label="Slug"
            {...register('slug')}
            error={errors.slug?.message}
            placeholder="electronics"
          />
          <Input
            label="Description (optional)"
            {...register('description')}
            placeholder="Browse all electronics"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Display Order" type="number" {...register('displayOrder')} placeholder="0" />
          </div>
          {defaultParentId && (
            <p className="text-xs text-surface-500 bg-surface-50 rounded-lg px-3 py-2">
              Parent: <strong>{defaultParentName}</strong>
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
