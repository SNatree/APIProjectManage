function exampleModel(empid) {
  // Accept all the constructor
  this.empid = empid || null;
}

exampleModel.prototype.getEmpid = function () {
  return this.empid;
};

exampleModel.prototype.setEmpid = function (empid) {
  this.empid = empid;
};

exampleModel.prototype.equals = function (o) {
  return o.getEmpid() == this.getEmpid();
};

exampleModel.prototype.fill = function (newFields) {
  for (var field in newFields) {
    if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
      if (this[field] !== "undefined") {
        this[field] = newFields[field];
      }
    }
  }
};

export const ExampleModel = exampleModel;
