class APIHelper {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryParams = { ...this.queryString };
    const excludeParams = ['page', 'sort', 'limit', 'fields'];
    excludeParams.forEach(e => delete queryParams[e]);

    let queryStr = JSON.stringify(queryParams);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query.sort(sortBy);
    } else {
      this.query.sort('rating');
    }
    return this;
  }

  paginate() {
    const limit = Number(this.queryString.limit) || 100;
    const page = Number(this.queryString.page) || 1;
    const skipRecords = (page - 1) * limit;

    this.query.skip(skipRecords).limit(limit);

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }
}

module.exports = APIHelper;