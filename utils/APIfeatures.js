class APIfeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filtered() {
    const strObject = { ...this.queryStr };
    const excludedItens = ['sort', 'limit', 'paginate', 'fields'];
    excludedItens.forEach((el) => delete strObject[el]);
    let queryString = JSON.stringify(strObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(this.queryStr);
    return this;
  }
}

module.exports = APIfeatures;
