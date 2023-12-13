class APIFeatures {
  constructor(query, queryString) {
    // Query obj. mongoose.model('ModelName', new mongoose.Schema({})).find()
    this.query = query;
    // req.query. From Express
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // hard copy, dustructuring -> create new obj
    // Filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering. ?FIELD[gte|gt|lte|lt]=VALUE
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // Sorting. ?sort=FIELD,SECOND_CRITERIA (asc), =-FIELD (dec)
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // Mongo expects str
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // Field limiting. ?fields=FIELD1,FIELD2
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;