export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  isActive?: boolean;
}
