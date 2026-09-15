export const CategoriesEndpoints = [
  { baseUrl: "api", name: "categories", alias: "getAllCategories", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "categories", alias: "createCategory", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "categories", alias: "updateCategory", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "categories", alias: "deleteCategory", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "categories", alias: "getCategoryById", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "categories", alias: "getCategoryOptions", path: "", noToken: false, runAt: "onDemand" },
];

export const CategoriesEndpointsMapping = {
  GetAllCategories: 'getAllCategories',
  CreateCategory: 'createCategory',
  UpdateCategory: 'updateCategory',
  DeleteCategory: 'deleteCategory',
  GetCategoryById: 'getCategoryById',
  GetCategoryOptions: 'getCategoryOptions',
};
