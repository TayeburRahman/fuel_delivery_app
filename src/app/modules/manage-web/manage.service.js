const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError");
const {
  PrivacyPolicy,
  TermsConditions,
  Customer,
  FAQ,
} = require("./manage.model");

//! Privacy and policy
const addPrivacyPolicy = async (payload) => {
  const checkIsExist = await PrivacyPolicy.findOne();
  if (checkIsExist) {
    await PrivacyPolicy.findOneAndUpdate({}, payload, {
      new: true,
      runValidators: true,
    });
  } else {
    return await PrivacyPolicy.create(payload);
  }
};

const getPrivacyPolicy = async () => {
  return await PrivacyPolicy.findOne();
};

const deletePrivacyPolicy = async (id) => {
  const isExist = await PrivacyPolicy.findById(id);
  if (!isExist) {
    throw new ApiError(404, "Privacy Policy not found");
  }
  return await PrivacyPolicy.findByIdAndDelete(id);
};

//! Terms Conditions
const addTermsConditions = async (payload) => {
  const checkIsExist = await TermsConditions.findOne();
  if (checkIsExist) {
    await TermsConditions.findOneAndUpdate({}, payload, {
      new: true,
      runValidators: true,
    });

    const message = { message: "Terms & conditions updated" };

    return message;
  } else {
    return await TermsConditions.create(payload);
  }
};

const getTermsConditions = async () => {
  return await TermsConditions.findOne();
};

const deleteTermsConditions = async (id) => {
  const isExist = await TermsConditions.findById(id);
  if (!isExist) {
    throw new ApiError(404, "TermsConditions not found");
  }
  return await TermsConditions.findByIdAndDelete(id);
};

const addCustomerCare = async (payload) => {
  const isExist = await Customer.findOne({
    contactNumber: payload.contactNumber,
  });

  if (isExist) {
    throw new ApiError(400, "Already have a contact number");
  } else {
    return await Customer.create(payload);
  }
};

const getCustomerContact = async () => {
  return await Customer.findOne();
};

// faq ---
const addFaq = async (payload) => {
  return await FAQ.create(payload);
};

const getSingleFaq = async (payload) => {
  const { id } = payload;

  const faq = await FAQ.findById(id);

  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, "No faq found");
  }

  return faq;
};

const updateSingleFaq = async (id, payload) => {
  const existingFaq = await FAQ.findById(id);
  console.log(payload);

  if (!existingFaq) {
    throw new ApiError(httpStatus.NOT_FOUND, "No faq found");
  }

  const faq = await FAQ.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return faq;
};

const deleteSingleFaq = async (id) => {
  const isExist = await FAQ.findById(id);
  if (!isExist) {
    throw new ApiError(404, "Faq not found");
  }
  return await FAQ.findByIdAndDelete(id);
};

const ManageService = {
  addPrivacyPolicy,
  addTermsConditions,
  getPrivacyPolicy,
  getTermsConditions,
  deletePrivacyPolicy,
  deleteTermsConditions,
  addCustomerCare,
  getCustomerContact,
  addFaq,
  getSingleFaq,
  updateSingleFaq,
  deleteSingleFaq,
};

module.exports = { ManageService };
