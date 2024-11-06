const paginate = (items, page, limit) => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);

  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);

  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
    },
  };
};

module.exports = paginate;
