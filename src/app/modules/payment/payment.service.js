const httpStatus = require("http-status");
const config = require("../../../config");
const ApiError = require("../../../errors/ApiError");
const User = require("../auth/auth.model");
// const Driver = require("../driver/driver.model");
const Payment = require("./payment.model");
const Driver = require("../driver/driver.model");
const StripeAccount = require("./stripeAccount.model");
const stripe = require("stripe")(config.stripe.stripe_secret_key);
const fs = require('fs');
const Order = require("../order/order.model");
const Transaction = require("../order/transaction.modal");

const createPaymentIntent = async (payload) => {
  // const { amount } = payload;
  // if (!amount) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "No amount found");
  // }

  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: parseInt(Math.trunc(amount) * 100),
  //   currency: "usd",
  //   payment_method_types: ["card"],
  // });

  // const { id, client_secret, amount: deductedAmount } = paymentIntent;

  // return {
  //   transactionId: id,
  //   client_secret,
  //   deductedAmount: deductedAmount / 100,
  // };
};
  
// -----------------Create Connected Account With Bank-------------------------- 

const createConnectedAccountWithBank = async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_info: bank, business_profile: profile, address: addr, dateOfBirth: birth } = req.body;

    const bank_info = JSON.parse(bank);
    const business_profile = JSON.parse(profile);
    const address = JSON.parse(addr);
    const dob = new Date(birth);

    // Validate the input address and use the valid one if the original is not valid
    const finalAddress = address.line1 && address.city && address.state && address.postal_code && address.country && address 

    const { kycFront, kycBack } = req.files;

    // Input validation
    const validationError = validateInputs(finalAddress, kycFront, kycBack, dob, bank_info);
    if (validationError) throw new ApiError(httpStatus.BAD_REQUEST, validationError);

    // Find the user
    const existingUser = await Driver.findById(id);
    if (!existingUser) throw new ApiError(httpStatus.NOT_FOUND, "Driver not found.");

    // Handle KYC files and create token in parallel
    const [kycFileParts, token] = await Promise.all([
      handleKYCFiles(kycFront, kycBack),
      createStripeToken(existingUser, dob, finalAddress, kycFront, kycBack)
    ]);

    const { frontFilePart, backFilePart } = kycFileParts;

    // Create the Stripe account
    const account = await createStripeAccount(token, bank_info, business_profile, existingUser);

    // Save Stripe account if creation was successful
    if (account.id && account.external_accounts.data.length) {
      const saveData = await saveStripeAccount(account, existingUser, id, finalAddress, kycFront, kycBack, dob);
      return  {
        saveData,
        account,
        success: true,
        message: "Account created successfully."
      };
    } else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create the Stripe account.");
    }
  } catch (error) {
     throw new ApiError(error.statusCode || 500, error.message || "Internal Server Error" );
  }
};

const validateInputs = (address, kycFront, kycBack, dateOfBirth, bank_info) => {

    
    if (!address || !address.line1 || !address.city || !address.state || !address.country || !address.postal_code) {
      throw new Error("Missing required address information.");
    }
  if (!kycBack || !kycFront || kycBack.length === 0 || kycFront.length === 0) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Two KYC files are required");
  }
  if (!dateOfBirth || !bank_info || !bank_info?.account_number || !bank_info?.account_holder_name) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Date of birth, business profile, and bank info fields are required");
  }
  return null;
};

const handleKYCFiles = async (kycFront, kycBack) => {
  try {
    const [frontFileData, backFileData] = await Promise.all([
      fs.readFileSync(kycFront[0]?.path),
      fs.readFileSync(kycBack[0]?.path)
    ]);

    const [frontFilePart, backFilePart] = await Promise.all([
      createStripeFile(frontFileData, kycFront[0]),
      createStripeFile(backFileData, kycBack[0])
    ]);

    return { frontFilePart, backFilePart };
  } catch (fileError) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error reading KYC files: " + fileError.message);
  }
};

const createStripeFile = async (fileData, file) => {
  try {
    return await stripe.files.create({
      purpose: "identity_document",
      file: {
        data: fileData,
        name: file.filename,
        type: file.mimetype,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Error creating KYC file with Stripe: " + error.message);
  }
};

const createStripeToken = async (user, dob, address, frontFilePart, backFilePart) => {
  try {
    return await stripe.tokens.create({
      account: {
        individual: {
          dob: {
            day: dob.getDate(),          
            month: dob.getMonth() + 1,   
            year: dob.getFullYear(),    
          },
          first_name: user?.name?.split(" ")[0] || 'Unknown',   
          last_name: user?.name?.split(" ")[1] || 'Unknown',    
          email: user?.email,                                 
          phone: user?.phone_number,                           
          address: {
            city: address.city,
            country: "US",
            line1: address.line1,
            postal_code: address.postal_code,
            state: address.state,
          },
          verification: {
            document: {
              front: frontFilePart.id,    
              back: backFilePart.id,     
            },
          },
        }, 
        business_type: "individual",      
        tos_shown_and_accepted: true,    
      },
    });
    
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error creating Stripe token: " + error.message);
  }
};

const createStripeAccount = async (token, bank_info, business_profile, user) => {
  try {
    return await stripe.accounts.create({
      type: "custom",
      account_token: token.id,
      capabilities: {
        // card_payments: { requested: true },
        transfers: { requested: true },
      }, 
      business_profile: {
        mcc: "5970",  
        name: business_profile.business_name || user.name || 'Unknown',
        url: business_profile.website || "www.example.com",
      },
      external_account: {
        object: "bank_account",
        account_holder_name: bank_info.account_holder_name,
        account_holder_type: bank_info.account_holder_type,
        account_number: bank_info.account_number,
        routing_number: bank_info.routing_number,
        country: "US",
        currency: "USD",
      },
    });
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error creating Stripe account: " + error.message);
  }
};

const saveStripeAccount = async (account, user, driverId, address, kycFront, kycBack, dob) => {
  const formattedAddress = `${address.line1}, ${address.city}, ${address.state}, US, ${address.postal_code}`;
  const dobFormatted = dob.toISOString(); // Convert date to ISO string

  const accountInformation = {
    stripeAccountId: account.id,
    externalAccountId: account.external_accounts?.data[0].id,
    status: true,
  };

  const newStripeAccount = new StripeAccount({
    name: user?.name || 'Unknown',
    email: user?.email,
    driverId,
    stripeAccountId: account.id,
    address: formattedAddress,
    dob: dobFormatted,
    accountInformation: accountInformation,
    kycBack: kycBack[0].path,
    kycFront: kycFront[0].path,
    line1: address.line1,
    city: address.city,
    state: address.state, 
    postal_code: address.postal_code, 
  });

  return await newStripeAccount.save();
}; 

// -----------------Update Connected Account With Bank--------------------------
const updateConnectedAccountWithBank = async (req, res) => {
  try {
    const { id } = req.params;  // Get user ID from params
    const { bank_info: bank, business_profile: profile, address: addr, dateOfBirth: birth } = req.body;

    // Parse the incoming data
    const bank_info = JSON.parse(bank);
    const business_profile = JSON.parse(profile);
    const address = JSON.parse(addr);
    const dob = new Date(birth);

    // Get the KYC files
    const { kycFront, kycBack } = req.files;

    // Input validation
    const validationError = validateInputs(address, kycFront, kycBack, dob, bank_info);
    if (validationError) throw new ApiError(httpStatus.BAD_REQUEST, validationError);

    // Find the existing user and associated Stripe account
    const existingUser = await Driver.findById(id);
    if (!existingUser) throw new ApiError(httpStatus.NOT_FOUND, "Driver not found.");

    // Fetch the Stripe account
    const stripeAccount = await stripe.accounts.retrieve(existingUser.stripeAccountId);
    if (!stripeAccount) throw new ApiError(httpStatus.NOT_FOUND, "Stripe account not found.");

    // Handle KYC files update
    const { frontFilePart, backFilePart } = await handleKYCFiles(kycFront, kycBack);

    // Update the Stripe account with the new information
    const updatedAccount = await updateStripeAccount(stripeAccount.id, bank_info, business_profile, address, dob, frontFilePart, backFilePart);

    // Update your database with the updated Stripe account information
    await saveUpdatedStripeAccount(existingUser, updatedAccount, address, kycFront, kycBack, dob);

    // Send a response back
    return  {
      account,
      success: true,
      message: "Account created successfully."
    };
  } catch (error) {
    console.error("Error updating Stripe account:", error.message);
    throw new ApiError(error.statusCode || 500, error.message || "Internal Server Error" );
  }
};

// Helper function to update the Stripe account
const updateStripeAccount = async (stripeAccountId, bank_info, business_profile, address, dob, frontFilePart, backFilePart) => {
  try {
    return await stripe.accounts.update(stripeAccountId, {
      individual: {
        dob: {
          day: dob.getDate(),
          month: dob.getMonth() + 1,
          year: dob.getFullYear(),
        },
        first_name: business_profile.first_name,
        last_name: business_profile.last_name,
        email: business_profile.email,
        phone: business_profile.phone_number,
        address: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: "US",
        },
        verification: {
          document: {
            front: frontFilePart.id,
            back: backFilePart.id,
          },
        },
      },
      external_account: {
        object: "bank_account",
        account_holder_name: bank_info.account_holder_name,
        account_holder_type: bank_info.account_holder_type,
        account_number: bank_info.account_number,
        routing_number: bank_info.routing_number,
        country: "US",
        currency: "USD",
      },
      business_profile: {
        mcc: "5970",
        name: business_profile.business_name,
        url: business_profile.website,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error updating Stripe account: " + error.message);
  }
};

// Helper function to save the updated information in your database
const saveUpdatedStripeAccount = async (existingUser, updatedAccount, address, kycFront, kycBack, dob) => {
  const formattedAddress = `${address.line1}, ${address.city}, ${address.state}, US, ${address.postal_code}`;
  const dobFormatted = dob.toISOString(); // Convert DOB to ISO string

  // Update the existing Stripe account information in your database
  existingUser.stripeAccountId = updatedAccount.id;
  existingUser.address = formattedAddress;
  existingUser.dob = dobFormatted;
  existingUser.kycBack = kycBack[0].path;
  existingUser.kycFront = kycFront[0].path;
  existingUser.line1= address.line1
  existingUser.city= address.city
  existingUser.state= address.state
  existingUser.postal_code= address.postal_code

  // Save the updated user data in the database
  return await existingUser.save();
};

// -----------------Transfer to Bank-------------------------
const TransferBallance = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Invalid Order ID!");
    }

    // Ensure the driver is confirmed
    if (!order.confirmedDriver) {
      throw new ApiError(404, "Driver not found!");
    }
 
    if (!order.deliveryFee) {
      throw new ApiError(404, "Delivery fee does not exist!");
    } 

    const stripeAccount = await StripeAccount.findOne({ driverId: order.confirmedDriver });
    if (!stripeAccount || !stripeAccount.stripeAccountId || !stripeAccount.accountInformation.externalAccountId) {
      throw new ApiError(404, "Driver's Stripe account details not found!");
    }
 
    const amount = Number(order.deliveryFee) * 100;
 
    const transfer = await stripe.transfers.create(
      {
        amount,
        currency: "usd",
        destination:   stripeAccount.stripeAccountId,  
      },
      // {
      //   stripeAccount:  stripeAccount.accountInformation.externalAccountId,  
        
      // }
    );

    if (!transfer) {
      throw new ApiError(500, "Failed to complete the transfer.");
    }

  } catch (error) {
    console.error("Transfer Balance Error:", error);
    throw new ApiError(500, "Internal server error: " + error.message);
  }
}; 

const PaymentService = {
  createPaymentIntent,
  // savePaymentUpdateSpending,
  // updateTotalEarning,
  createConnectedAccountWithBank,
  updateConnectedAccountWithBank,
  TransferBallance
};

module.exports = PaymentService;
