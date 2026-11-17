export const filterRegisteredCategories = (categories, registeredCategoryId) => {
  if (!Array.isArray(categories) || registeredCategoryId == null) return [];

  return categories.filter(
    category => String(category.id) === String(registeredCategoryId),
  );
};
