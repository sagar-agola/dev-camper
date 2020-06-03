const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  // fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // loop over removed fields and remove from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string and create operators (gt => $gt)
  let queryString = JSON.stringify(reqQuery);
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // find resource
  query = model.find(JSON.parse(queryString));

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // pagination
  let pageNumber = parseInt(req.query.page, 10) || 1;
  const page = pageNumber > 0 ? pageNumber : 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // populate referenced fields
  if (populate) {
    query = query.populate(populate);
  }

  // executing query
  const results = await query;

  // paginaion result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0 && startIndex < total) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination: pagination,
    query: query,
    results: results,
  };

  next();
};

module.exports = advancedResults;
