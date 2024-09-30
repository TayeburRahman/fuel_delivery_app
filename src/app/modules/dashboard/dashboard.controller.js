const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const DashboardServices = require("./dashboard.service");
 

// -------drive----------

const acceptDriver = catchAsync(async (req, res) => {
  const result = await DashboardServices.acceptDriver(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver blocked successfully",
    data: result,
  });
});

const blockDriver = catchAsync(async (req, res) => {
  const result = await DashboardServices.blockDriver(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver blocked successfully",
    data: result,
  });
});

const deleteDriver = catchAsync(async (req, res) => {
  const result = await DashboardServices.deleteDriver(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver delete successfully",
    data: result,
  });
});


// --- Fuel actions ---
const addNewFuel = catchAsync(async (req, res) => {
  const result = await DashboardServices.addNewFuel(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Add new successfully",
    data: result,
  });
});
 

const updateFuel = async (req, res) => { 
  const result = await DashboardServices.updateFuel(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Updated successfully",
    data: result,
  });
}

const getAllFuels = async (req, res) => { 
  const result = await DashboardServices.getAllFuels();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All get successfully",
    data: result,
  });
}

const deleteFuel = async (req, res) => { 
  const result = await DashboardServices.deleteFuel(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delete successfully",
    data: result,
  });
}

const updateFuelStatus = async (req, res) => { 
  const result = await DashboardServices.updateFuelStatus(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Update status successfully",
    data: result,
  });
}

// --- ads action ---
const insertIntoDB = catchAsync(async (req, res) => {
  const result = await DashboardServices.insertIntoDB(req.files, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Adds created successfully',
    data: result,
  });
});

const updateAdds = catchAsync(async (req, res) => {
  const result = await DashboardServices.updateAdds(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Adds updated successfully',
    data: result,
  });
});

const deleteAdds = catchAsync(async (req, res) => {
  const result = await DashboardServices.deleteAdds(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Adds deleted successfully',
    data: result,
  });
});

const allAdds = catchAsync(async (req, res) => {
  const result = await DashboardServices.allAdds(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Adds retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});
// -----------------
const totalCount = catchAsync(async (req, res) => {
  const result = await DashboardServices.totalCount();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Data retrieved successful',
    data: result,
  });
});

const getGrowthOfApp = catchAsync(async (req, res ) => {
  const year = req.query.year
    ? parseInt(req.query.year, 10)
    : undefined;
  const result = await DashboardServices.getGrowthOfApp(year);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Data retrieved successful',
    data: result,
  });
});


 
 

const DashboardController = { 
  acceptDriver,
  addNewFuel,
  updateFuel,
  getAllFuels,
  deleteFuel,
  updateFuelStatus,
  insertIntoDB,
  updateAdds,
  deleteAdds,
  allAdds,
  blockDriver,
  totalCount,
  getGrowthOfApp
};

module.exports = DashboardController;
