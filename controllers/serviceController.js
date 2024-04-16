const {body, validationResult, param} = require('express-validator');
const Service = require('../models/service');
const User = require("../models/user");

exports.getServices = async (req, res) => {
  const services = await Service.find({})
  console.log(services);
  let updatedServices = []
  for (const service of services) {
    let providers = []
    for (const provider of service.providers) {
      let user = await User.findById(provider).select({"first_name": 1, "last_name": 1}).exec();
      if (user === null) return res.status(400).send('User not found');
      providers.push({"_id": provider._id, "name": user.first_name + ' ' + user.last_name});
    }
    updatedServices.push({service: service, providers: providers})
  }
  return res.json(updatedServices);
}

exports.getAvailableServices = async (req, res) => {
  const services = await Service.find({providers: {$not: {$size: 0}}});
  // console.log("Services", services)
  let updatedServices = []
  for (const service of services) {
    let providers = []
    for (const provider of service.providers) {
      let user = await User.findById(provider).select({"first_name": 1, "last_name": 1}).exec();
      // console.log("User :",user);

      if (user !== null) 
      providers.push({"_id": provider._id, "name": user.first_name + ' ' + user.last_name});
    }
    // console.log("providers :",providers);
    updatedServices.push({service: service, providers: providers})
  }
  // console.log("updatedServices :",updatedServices);
  if (updatedServices && updatedServices !== 'null') {
    return res.json(updatedServices);  } else {
    return res.status(400).send('User not found in getAvailableServices');
  }
  
  // if (updatedServices) return res.status(400).send('User not found in getAvailableServices');
 
}

exports.getServicesOfProvider = async (req, res) => {
  const services2 = await Service.find({providers: {$not: {$size: 0}}});
  console.log("Servicesall", services2);
  console.log("res.locals._id", res.locals._id);
  const services = await Service.find({providers: {$nin: [res.locals._id]}})
  console.log("Services", services)
  return res.json(services.map(service => ({service: service})));
}

exports.getRegisteredServicesOfProvider = async (req, res) => {
  const services = await Service.find({providers: [res.locals._id]})
  return res.json(services.map(service => ({service: service})));
}

// get service by id
exports.getService = [
  param('_id').trim().escape().notEmpty().withMessage('_id must not be empty').isMongoId().withMessage('_id is not valid'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);
    return res.json(await Service.findById(req.params['_id']).exec());
  }
]

// create a new service
exports.createService = [
  body('name').trim().escape().notEmpty().withMessage('Name must not be empty'),
  body('description').trim().escape().notEmpty().withMessage('Description must not be empty'),
  body('providers').optional().isArray({min: 1}).withMessage('Providers must be a non-empty array'),
  body('providers.*').optional().isMongoId().withMessage('Invalid provider id'),
  async (req, res) => {
    const errors = validationResult(req);
    console.log("Req validation error 0" , errors)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    const service = new Service({
      name: req.body['name'],
      description: req.body['description'],
    });
    if (req.body['providers']) {
      service.providers = req.body['providers'];
    }
    console.log("before creating the services ")
    return res.json(await service.save());
  },
];


// update a service by id
exports.updateService = [
  param('_id').trim().escape().notEmpty().withMessage('_id must not be empty').isMongoId().withMessage('_id is not valid'),
  body('name').trim().escape().notEmpty().withMessage('Name must not be empty'),
  body('description').trim().escape().notEmpty().withMessage('Description must not be empty'),
  body('providers').optional({checkFalsy: true}).isArray().withMessage('Providers must be a non-empty array'),
  body('providers.*').optional({checkFalsy: true}).isMongoId().withMessage('Invalid provider id'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);
    const updateParams = {
      name: req.body['name'],
      description: req.body['description'],
    };
    if (req.body['providers']) {
      updateParams.providers = req.body['providers'];
    }
    return res.json(await Service.findByIdAndUpdate(req.params._id, updateParams, {returnDocument: 'after'}));
  }
]

exports.addProvider = [
  param('_id').trim().escape().notEmpty().withMessage('_id must not be empty').isMongoId().withMessage('_id is not valid'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);
    const service = await Service.findById(req.params['_id']).exec();
    if (service.providers.find(provider => provider.toString() === res.locals._id)) {
      return res.status(400).json('Already registered');
    }
    return res.json(await Service.findByIdAndUpdate(req.params._id, {$push: {providers: res.locals._id}}, {returnDocument: 'after'}));
  }
]

exports.deleteProvider = [
  param('_id').trim().escape().notEmpty().withMessage('_id must not be empty').isMongoId().withMessage('_id is not valid'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);
    return res.json(await Service.findByIdAndUpdate(req.params._id, {$pull: {providers: res.locals._id}}, {returnDocument: 'after'}));
  }
]


// delete a service by id
exports.deleteService = [
  param('_id').trim().escape().notEmpty().withMessage('_id must not be empty').isMongoId().withMessage('_id is not valid'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);
    return res.json(await Service.findByIdAndRemove(req.params['_id']));
  }
]

echo "# BE-Project-FE" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Vaibhavnanne18/BE-Project-FE.git
git push -u origin main