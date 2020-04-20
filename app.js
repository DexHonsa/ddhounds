var express = require("express");
var app = express();
var path = require('path');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var router = express.Router();
var userRoutes = require("./routes/users");
var authRoutes = require("./routes/auth");
var clientRoutes = require("./routes/clients");
var paymentRoutes = require('./routes/payment');
var transactionRoutes = require('./routes/transactions');
var dashboardRoutes = require('./routes/dashboard');
var notificationRoutes = require('./routes/notifications');
var subscriptionsRoutes = require('./routes/subscriptions');
var mailRoutes = require('./routes/mail');
var fileRoutes = require('./routes/file');
var futureRoutes = require('./routes/future_que')
var timesheetRoutes = require('./routes/timesheet')
var metaRoutes = require('./routes/meta');
var morgan = require("morgan");
var nodemailer = require('nodemailer');
var config = require('./config.js');
// var smtpTransport = require("nodemailer-smtp-transport");
var imdb = require('imdb-api');
var smsRoutes = require('./routes/sms');
var CronJob = require('cron').CronJob;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var axios = require('axios');

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;



var URL = config.URL;


app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET");
    return res.status(200).json({});
  }
  next();
});
app.use('/api/payment', paymentRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/clients", clientRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/future_que', futureRoutes);

app.use('/api/static', express.static(path.join(__dirname + '/uploads')));


function authorizeCreditCard(obj, callback) {
	return new Promise((resolve, reject)=>{
		const {first_name, last_name, company, address, city, state, zip, country, cc_number, cvv, exp, amount} = obj;
	
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName('93jhGrV5Jz2');
	merchantAuthenticationType.setTransactionKey('65RND55N7BDs7hza');

	var creditCard = new ApiContracts.CreditCardType();
	creditCard.setCardNumber(cc_number.toString());
	creditCard.setExpirationDate(exp.toString());
	creditCard.setCardCode(cvv.toString());

	var paymentType = new ApiContracts.PaymentType();
	paymentType.setCreditCard(creditCard);

	var orderDetails = new ApiContracts.OrderType();
	orderDetails.setInvoiceNumber('INV-12345');
	orderDetails.setDescription('Collection Amount Charge');

	
	var billTo = new ApiContracts.CustomerAddressType();
	billTo.setFirstName(first_name);
	billTo.setLastName(last_name);
	billTo.setCompany(company);
	billTo.setAddress(address);
	billTo.setCity(city);
	billTo.setState(state);
	billTo.setZip(zip.toString());
	billTo.setCountry(country);

	

	var lineItem_id1 = new ApiContracts.LineItemType();
	lineItem_id1.setItemId('1');
	lineItem_id1.setName('collection_charge');
	lineItem_id1.setDescription('n/a');
	lineItem_id1.setQuantity('1');
	lineItem_id1.setUnitPrice(amount.toString());

	var lineItemList = [];
	lineItemList.push(lineItem_id1);

	var lineItems = new ApiContracts.ArrayOfLineItem();
	lineItems.setLineItem(lineItemList);


	var transactionSetting1 = new ApiContracts.SettingType();
	transactionSetting1.setSettingName('duplicateWindow');
	transactionSetting1.setSettingValue('120');

	var transactionSetting2 = new ApiContracts.SettingType();
	transactionSetting2.setSettingName('recurringBilling');
	transactionSetting2.setSettingValue('false');

	var transactionSettingList = [];
	transactionSettingList.push(transactionSetting1);
	transactionSettingList.push(transactionSetting2);

	var transactionSettings = new ApiContracts.ArrayOfSetting();
	transactionSettings.setSetting(transactionSettingList);

	var transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setPayment(paymentType);
	transactionRequestType.setAmount(amount);
	transactionRequestType.setLineItems(lineItems);
	// transactionRequestType.setUserFields(userFields);
	transactionRequestType.setOrder(orderDetails);
	// transactionRequestType.setTax(tax);
	// transactionRequestType.setDuty(duty);
	// transactionRequestType.setShipping(shipping);
	transactionRequestType.setBillTo(billTo);
	// transactionRequestType.setShipTo(shipTo);
	transactionRequestType.setTransactionSettings(transactionSettings);

	var createRequest = new ApiContracts.CreateTransactionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType);

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateTransactionResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				if(response.getTransactionResponse().getMessages() != null){
					console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
					console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
					console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
					console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
				}
				else {
					console.log('Failed Transaction.');
					if(response.getTransactionResponse().getErrors() != null){
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					}
				}
			}
			else {
				console.log('Failed Transaction.');
				if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
				
					console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
					console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
				}
				else {
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
				}
			}
		}
		else {
			console.log('Null Response.');
		}

		
		resolve(response);
	});
	})
	
}


function debitBankAccount(obj, callback) {
	return new Promise((resolve, reject)=>{
		const {first_name, last_name, company, address, city, state, zip, country, bank_account_number, routing_number, account_holder, account_type, amount} = obj;
    var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
    var accountType;
    if(account_type == 'savings'){
        accountType = ApiContracts.BankAccountTypeEnum.SAVINGS
    }else{
        ApiContracts.BankAccountTypeEnum.CHECKING
    }

	merchantAuthenticationType.setName('93jhGrV5Jz2');
	merchantAuthenticationType.setTransactionKey('65RND55N7BDs7hza');

	var bankAccountType = new ApiContracts.BankAccountType();
	bankAccountType.setAccountType(accountType);
	bankAccountType.setRoutingNumber(routing_number);
	//added code
	
	bankAccountType.setAccountNumber(bank_account_number);
	bankAccountType.setNameOnAccount(account_holder);

	var paymentType = new ApiContracts.PaymentType();
	paymentType.setBankAccount(bankAccountType);

	var orderDetails = new ApiContracts.OrderType();
	orderDetails.setInvoiceNumber('INV-12345');
	orderDetails.setDescription('Bank Account Charge');

	var billTo = new ApiContracts.CustomerAddressType();
	billTo.setFirstName(first_name);
	billTo.setLastName(last_name);
	billTo.setCompany(company);
	billTo.setAddress(address);
	billTo.setCity(city);
	billTo.setState(state);
	billTo.setZip(zip);
	billTo.setCountry(country);


	var lineItem_id1 = new ApiContracts.LineItemType();
	lineItem_id1.setItemId('1');
	lineItem_id1.setName('Collection Bank Charge');
	lineItem_id1.setDescription('n/a');
	lineItem_id1.setQuantity('1');
	lineItem_id1.setUnitPrice(amount);

	var lineItemList = [];
	lineItemList.push(lineItem_id1);

	var lineItems = new ApiContracts.ArrayOfLineItem();
	lineItems.setLineItem(lineItemList);

	var transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setPayment(paymentType);
	transactionRequestType.setAmount(amount);
	transactionRequestType.setLineItems(lineItems);
	transactionRequestType.setOrder(orderDetails);
	transactionRequestType.setBillTo(billTo);

	var createRequest = new ApiContracts.CreateTransactionRequest();
	createRequest.setRefId('123456');
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType);

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateTransactionResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				if(response.getTransactionResponse().getMessages() != null){
					console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
					console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
					console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
					console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
				}
				else {
					console.log('Failed Transaction.');
					if(response.getTransactionResponse().getErrors() != null){
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					}
				}
			}
			else {
				console.log('Failed Transaction. ');
				if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
				
					console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
					console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
				}
				else {
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
				}
			}
		}
		else {
			console.log('Null Response.');
		}

		
		resolve(response);
	});
	})
    
}

new CronJob("0 * * * * *", async () => {
  console.log('cronitize me capn');
  //await axios.get('/api/mail/generate_initial_demands')
  MongoClient.connect(URL, function(err, client) {
	const db = client.db('mine');
    if (err) throw err;
    var collection = db.collection("transactions");
    collection.find({transaction_id:'none', payment_date:{$lt:new Date()}}).toArray().then(async result=>{
      var transactions = result;
        var promises2 = [];
        for(let k = 0; k < transactions.length; k++){
					var clientAccountId = transactions[k].account_number;
					var transactionAmount = Number(transactions[k].amount);
            if(transactions[k].type == 'card'){
              await authorizeCreditCard(transactions[k].charge).then((item)=>{
								var code = item.messages.resultCode;
								
                if(code != 'Error'){
										var transactionId = item.transactionResponse.transId;
											promises2.push(db.collection('notifications').insert({user_id:transactions[k].user_id, created_at:new Date(), opened:false, body:`<b>$${Number(transactions[k].charge.amount).toFixed(2)}</b> for ${transactions[k].charge.first_name} ${transactions[k].charge.last_name} has been approved!`,code:'success',type:'transaction', client_id:transactions[k].client_id, account_number:transactions[k].account_number}))
											promises2.push(db.collection("clients").findOneAndUpdate({account_number: clientAccountId},{$inc:{total_paid_to_date:transactionAmount}}));
											promises2.push(db.collection('transactions').findOneAndUpdate({_id:ObjectId(transactions[k]._id)}, {$set:{transaction_id:transactionId}}));
										
                }else{
					var transactionError = item.transactionResponse.errors.error[0].errorText
											promises2.push(db.collection('notifications').insert({user_id:transactions[k].user_id, created_at:new Date(), opened:false, body:`<b>$${Number(transactions[k].charge.amount).toFixed(2)}</b> for ${transactions[k].charge.first_name} ${transactions[k].charge.last_name} has failed.`,code:'error',type:'transaction', client_id:transactions[k].client_id, account_number:transactions[k].account_number}))
											promises2.push(db.collection('transactions').findOneAndUpdate({_id:ObjectId(transactions[k]._id)}, {$set:{transaction_id:'Error', transaction_error:transactionError}}));
                }
              })
            }else{
              await debitBankAccount(transactions[k].charge).then((item)=>{
                var code = item.messages.resultCode;
                if(code != 'Error'){
									var transactionId = item.transactionResponse.transId;
										
										promises2.push(db.collection("clients").findOneAndUpdate({account_number: clientAccountId},{$inc:{total_paid_to_date:transactionAmount}}));
										promises2.push(db.collection('transactions').findOneAndUpdate({_id:ObjectId(transactions[k]._id)}, {$set:{transaction_id:transactionId}}));

                }else{
									var transactionError = item.transactionResponse.errors.error[0].errorText

										promises2.push(db.collection('transactions').findOneAndUpdate({_id:ObjectId(transactions[k]._id)}, {$set:{transaction_id:'Error', transaction_error:transactionError}}));

                    
                }
            })
            }
          
		}
		if(promises2.length == 0){
			client.close();
		}
        Promise.all(promises2).then(prom2=>{
					//console.log(prom2);
         // console.log('done?')
		 client.close();
        })
    //   })
    })
  })
},null, true, 'America/Los_Angeles')



app.use((req, res, next) => {
  const error = new Error("Not Found");
  res.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});




mongoose.connect(
  "mongodb://dexhonsa:Awesomeo21!@hid-shard-00-00-6vaxg.mongodb.net:27017,hid-shard-00-01-6vaxg.mongodb.net:27017,hid-shard-00-02-6vaxg.mongodb.net:27017/test?ssl=true&replicaSet=HID-shard-0&authSource=admin&retryWrites=true"
);

module.exports = app;
