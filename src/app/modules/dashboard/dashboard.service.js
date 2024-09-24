const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError");
const User = require("../auth/auth.model");
const QueryBuilder = require("../../../builder/QueryBuilder"); 

// --- user ---

const getAllUsers = async (query) => {
  const usersQuery = new QueryBuilder(User.find(), query)
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await usersQuery.modelQuery;
  const meta = await usersQuery.countTotal();

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found");
  }
  return { meta, result };
};

const getSingleUser = async (payload) => {
  const { email } = payload;
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const blockUnblockUser = async (payload) => {
  const { email, is_block } = payload;
  const existingUser = await User.findOne({ email: email });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return await User.findOneAndUpdate(
    { email: email },
    { $set: { is_block } },
    {
      new: true,
      runValidators: true,
    }
  );
};
 

const DashboardServices = {
  getAllUsers,
  getSingleUser,
  blockUnblockUser, 
};

module.exports = DashboardServices;
