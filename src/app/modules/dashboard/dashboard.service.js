const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError");
const User = require("../auth/auth.model");
const QueryBuilder = require("../../../builder/QueryBuilder"); 
const { Fuel } = require("../fuelmanage/fuel.model");
const { Banner } = require("../ads/ads.model");
const Driver = require("../driver/driver.model");
const { logger } = require("../../../shared/logger");
const getYearRange = require("../../../helpers/getYearRange");

 
// ---Manage Driver ---------------------------
// --block driver-----
// const blockUnblockDriver = async (payload) => {
//   const { email, is_block } = payload;
//   const existingUser = await Driver.findOne({ email: email });

//   if (!existingUser) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Driver not found");
//   }
//   return await Driver.findOneAndUpdate(
//     { email: email },
//     { $set: { is_block } },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
// };

 
 
// -- add fuel -----
const addNewFuel = async (payload) => {
  const result = await Fuel.create(payload);
  return  result
};

// -- update fuel -----
const updateFuel = async (req) => {
  const id = req.params.id;  
  const data = req.body;
 
  const result = await Fuel.findById(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Fuel not found");
  }

  // Update the fuel record
  const updatedFuel = await Fuel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedFuel; // Return the updated record
};

// -- get all fuel -----
const getAllFuels = async () => {
  const fuels = await Fuel.find({});
  return fuels;
};

// -- delete fuel -----
const deleteFuel = async (req) => {
  const id = req.params.id;   
  const deletedFuel = await Fuel.findByIdAndDelete(id);

  if (!deletedFuel) {
    throw new ApiError(httpStatus.NOT_FOUND, "Fuel not found");
  }

  return {DeleteId: deletedFuel?._id, Name: deletedFuel?.fuelType};  
};

// -- update status fuel -----
const updateFuelStatus = async (req) => {
  const id = req.params.id; 
  const { status } = req.body;    
  if (!['IN_STOCK', 'OUT_OF_STOCK'].includes(status)) {
    throw new ApiError(400, "Invalid status value. It must be either 'IN_STOCK' or 'OUT_OF_STOCK'.");
  }

  const updatedFuel = await Fuel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });

  if (!updatedFuel) {
    throw new ApiError(httpStatus.NOT_FOUND, "Fuel not found");
  }

  return updatedFuel; 
};

// --- create ads ---
const insertIntoDB = async (files, payload) => {
  if (!files?.image) {
    throw new ApiError(400, 'File is missing');
  }

  if (files?.image) {
    payload.image = `/images/image/${files.image[0].filename}`;
  }

  return await Banner.create(payload);
}; 

// --- all ads ---
const allAdds = async (query) => {
  const addsQuery = new QueryBuilder(Banner.find(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await addsQuery.modelQuery;
  const meta = await addsQuery.countTotal();

  return {
    meta,
    data: result,
  };
}; 

// --- update ads ---
const updateAdds = async (req) => {
  const { files } = req;
  const id = req.params.id;
  const { ...AddsData } = req.body;

  if (files && files.image) {
    AddsData.image = `/images/image/${files.image[0].filename}`;
  }

  const isExist = await Banner.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Adds not found !');
  }

  const updatedData = { ...AddsData };

  const result = await Banner.findOneAndUpdate(
    { _id: id },
    { ...updatedData },
    {
      new: true,
    },
  );
  return result;
}; 

// --- delete ads ---
const deleteAdds = async (id) => {
  const isExist = await Banner.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Adds not found !');
  }
  
  return await Banner.findByIdAndDelete(id);
}; 

// --- user driver total count ---
const totalCount = async () => {
  const users = await User.countDocuments();
  const drivers = await Driver.countDocuments();

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const newDrivers = await Driver.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });

  const newDriversDetails = await Driver.find({
    createdAt: { $gte: oneMonthAgo },
  });

  return {
    users,
    drivers,
    newDrivers,
    newDriversDetails,
  };
};

// --- Driver Growth ---
const getGrowthOfApp = async (year) => {
  try {
    const currentYear = new Date().getFullYear();
    const selectedYear = year || currentYear;

    const { startDate, endDate } = getYearRange(selectedYear);

    const monthlyUserGrowth = await Auth.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          count: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const result = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyUserGrowth.find(
        data => data.month === i + 1,
      ) || {
        month: i + 1,
        count: 0,
        year: selectedYear,
      };
      return {
        ...monthData,
        month: months[i],
      };
    });

    return {
      year: selectedYear,
      data: result,
    };
  } catch (error) {
    logger.error('Error in getGrowthOfApp function: ', error);
    throw error;
  }
};





const DashboardServices = {  
  addNewFuel,
  updateFuel,
  getAllFuels,
  deleteFuel,
  updateFuelStatus,
  insertIntoDB,
  allAdds,
  updateAdds,
  deleteAdds,
  totalCount,
  getGrowthOfApp

};

module.exports = DashboardServices;
