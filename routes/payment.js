const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;

router.post("/authorize_credit_card", (req, res, next) => {
    authorizeCreditCard(req.body, (item) => {
        //res.status(200).send(item);
        var code = item.messages.resultCode;
        if(code != 'Error'){
            var transactionId = item.transactionResponse.transId;
            res.status(200).send({transactionId, errors:item.transactionResponse.errors});
        }else{
            var transactionError = item.transactionResponse.errors.error[0].errorText
            res.status(500).send({error:transactionError})
        }
    })
})

router.post("/authorize_bank_account", (req, res, next) => {
    debitBankAccount(req.body, (item) => {
        //res.status(200).send(item);
        var code = item.messages.resultCode;
        if(code != 'Error'){
            var transactionId = item.transactionResponse.transId;
            res.status(200).send({transactionId, message:'success',errors:item.transactionResponse.errors});
        }else{
            var transactionError = item.transactionResponse.errors.error[0].errorText
            res.status(500).send({error:transactionError})
        }
    })
})

router.post("/create_subscription", (req, res, next) => {
    createSubscription(req.body, (item) => {
		//res.status(200).send(item);
		//return;
        var code = item.messages.resultCode;
        if(code != 'Error'){
            var subscriptionId = item.subscriptionId;
            res.status(200).send({subscriptionId: subscriptionId, message:'success'});
        }else{
            var transactionError = item.messages.message[0].text
            res.status(500).send({error:transactionError})
        }
    })
})

router.post("/create_bank_subscription", (req, res, next) => {
    createBankSubscription(req.body, (item) => {
		//res.status(200).send(item);
		//return;
        var code = item.messages.resultCode;
        if(code != 'Error'){
            var subscriptionId = item.subscriptionId;
            res.status(200).send({subscriptionId: subscriptionId, message:'success'});
        }else{
            var transactionError = item.messages.message[0].text
            res.status(500).send({error:transactionError})
        }
    })
})

router.get("/get_subscription/:id", (req, res, next) => {
	var id = req.params.id;
    getSubscription(id, (item) => {
		res.status(200).send(item);
		return;
        var code = item.messages.resultCode;
        if(code != 'Error'){
            var transactionId = item.transactionResponse.transId;
            res.status(200).send({transactionId, message:'success'});
        }else{
            var transactionError = item.transactionResponse.errors.error[0].errorText
            res.status(500).send({error:transactionError})
        }
    })
})


function authorizeCreditCard(obj, callback) {
	const {first_name, last_name, company, billing_address_street1, billing_address_city, billing_address_state, billing_address_zip, country, cc_number, cvv, exp, amount} = obj;
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
	billTo.setAddress(billing_address_street1);
	billTo.setCity(billing_address_city);
	billTo.setState(billing_address_state);
	billTo.setZip(billing_address_zip.toString());
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
	console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateTransactionResponse(apiResponse);

		//pretty print response
		console.log(JSON.stringify(response, null, 2));

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

		callback(response);
	});
}


function debitBankAccount(obj, callback) {
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
	console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateTransactionResponse(apiResponse);

		//pretty print response
		console.log(JSON.stringify(response, null, 2));

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

		callback(response);
	});
}


function createSubscription(obj, callback) {
	
	const {first_name, last_name, start_date, number_of_payments, company, phone, email, address, city, state, zip, country, cc_number, cvv, exp, amount} = obj;
	console.log(start_date);
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName('93jhGrV5Jz2');
	merchantAuthenticationType.setTransactionKey('65RND55N7BDs7hza');

	var interval = new ApiContracts.PaymentScheduleType.Interval();
	interval.setLength(1);
	interval.setUnit(ApiContracts.ARBSubscriptionUnitEnum.MONTHS);

	var paymentScheduleType = new ApiContracts.PaymentScheduleType();
	paymentScheduleType.setInterval(interval);
	paymentScheduleType.setStartDate(start_date);
	paymentScheduleType.setTotalOccurrences(number_of_payments);
	paymentScheduleType.setTrialOccurrences(0);

	var creditCard = new ApiContracts.CreditCardType();
	creditCard.setExpirationDate(exp);
	creditCard.setCardNumber(cc_number);
	creditCard.setCardCode(cvv);

	var payment = new ApiContracts.PaymentType();
	payment.setCreditCard(creditCard);

	var orderType = new ApiContracts.OrderType();
	orderType.setInvoiceNumber('sub-1234'); 
	orderType.setDescription('Recurring Payments');

	var customer = new ApiContracts.CustomerType();
	customer.setType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
	customer.setId(first_name);
	customer.setEmail(email);
	customer.setPhoneNumber(phone);
	//customer.setTaxId('911011011');

	var nameAndAddressType = new ApiContracts.NameAndAddressType();
	nameAndAddressType.setFirstName(first_name);
	nameAndAddressType.setLastName(last_name);
	nameAndAddressType.setCompany(company);
	nameAndAddressType.setAddress(address);
	nameAndAddressType.setCity(city);
	nameAndAddressType.setState(state);
	nameAndAddressType.setZip(zip);
	nameAndAddressType.setCountry(country);

	var arbSubscription = new ApiContracts.ARBSubscriptionType();
	arbSubscription.setName(`${first_name} ${last_name}`);
	arbSubscription.setPaymentSchedule(paymentScheduleType);
	arbSubscription.setAmount(amount);
	arbSubscription.setTrialAmount(0);
	arbSubscription.setPayment(payment);
	arbSubscription.setOrder(orderType);
	arbSubscription.setCustomer(customer);
	arbSubscription.setBillTo(nameAndAddressType);

	var createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setSubscription(arbSubscription);

	console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.ARBCreateSubscriptionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.ARBCreateSubscriptionResponse(apiResponse);

		console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				console.log('Subscription Id : ' + response.getSubscriptionId());
				console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
				console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());
			}
			else{
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else{
			console.log('Null Response.');
		}



		callback(response);
	});
}

function createBankSubscription(obj, callback) {
	
	const {first_name, last_name, company, address, city, state, zip, country, email, phone, start_date,number_of_payments, bank_account_number, routing_number, account_holder, account_type, amount} = obj;
	var accountType;
    if(account_type == 'savings'){
        accountType = ApiContracts.BankAccountTypeEnum.SAVINGS
    }else{
        ApiContracts.BankAccountTypeEnum.CHECKING
    }
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName('93jhGrV5Jz2');
	merchantAuthenticationType.setTransactionKey('65RND55N7BDs7hza');

	var interval = new ApiContracts.PaymentScheduleType.Interval();
	interval.setLength(1);
	interval.setUnit(ApiContracts.ARBSubscriptionUnitEnum.MONTHS);

	var paymentScheduleType = new ApiContracts.PaymentScheduleType();
	paymentScheduleType.setInterval(interval);
	paymentScheduleType.setStartDate(start_date);
	paymentScheduleType.setTotalOccurrences(number_of_payments);
	paymentScheduleType.setTrialOccurrences(0);

	var bankAccountType = new ApiContracts.BankAccountType();
	bankAccountType.setAccountType(accountType);
	bankAccountType.setRoutingNumber(routing_number);
	//added code
	
	bankAccountType.setAccountNumber(bank_account_number);
	bankAccountType.setNameOnAccount(account_holder);

	var payment = new ApiContracts.PaymentType();
	payment.setBankAccount(bankAccountType);

	var orderType = new ApiContracts.OrderType();
	orderType.setInvoiceNumber('sub-1234'); 
	orderType.setDescription('Recurring Payments');

	var customer = new ApiContracts.CustomerType();
	customer.setType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
	customer.setId(first_name);
	customer.setEmail(email);
	customer.setPhoneNumber(phone);
	//customer.setTaxId('911011011');

	var nameAndAddressType = new ApiContracts.NameAndAddressType();
	nameAndAddressType.setFirstName(first_name);
	nameAndAddressType.setLastName(last_name);
	nameAndAddressType.setCompany(company);
	nameAndAddressType.setAddress(address);
	nameAndAddressType.setCity(city);
	nameAndAddressType.setState(state);
	nameAndAddressType.setZip(zip);
	nameAndAddressType.setCountry(country);

	var arbSubscription = new ApiContracts.ARBSubscriptionType();
	arbSubscription.setName(`${first_name} ${last_name}`);
	arbSubscription.setPaymentSchedule(paymentScheduleType);
	arbSubscription.setAmount(amount);
	arbSubscription.setTrialAmount(0);
	arbSubscription.setPayment(payment);
	arbSubscription.setOrder(orderType);
	arbSubscription.setCustomer(customer);
	arbSubscription.setBillTo(nameAndAddressType);

	var createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setSubscription(arbSubscription);

	console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.ARBCreateSubscriptionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.ARBCreateSubscriptionResponse(apiResponse);

		console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				console.log('Subscription Id : ' + response.getSubscriptionId());
				console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
				console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());
			}
			else{
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else{
			console.log('Null Response.');
		}



		callback(response);
	});
}

function getSubscriptionStatus(subscriptionId, callback) {
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName('93jhGrV5Jz2');
	merchantAuthenticationType.setTransactionKey('65RND55N7BDs7hza');

	var getRequest = new ApiContracts.ARBGetSubscriptionStatusRequest();
	getRequest.setMerchantAuthentication(merchantAuthenticationType);
	getRequest.setSubscriptionId(subscriptionId);

	console.log(JSON.stringify(getRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.ARBGetSubscriptionStatusController(getRequest.getJSON());

	ctrl.execute(function(){
		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.ARBGetSubscriptionStatusResponse(apiResponse);

		console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				console.log('Status : ' + response.getStatus());
				console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
				console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());
			}
			else{
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else{
			console.log('Null Response.');
		}
		
		callback(response);
	});
}

function getSubscription(subscriptionId, callback) {
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName('93jhGrV5Jz2');
	merchantAuthenticationType.setTransactionKey('65RND55N7BDs7hza');

	var getRequest = new ApiContracts.ARBGetSubscriptionRequest();
	getRequest.setMerchantAuthentication(merchantAuthenticationType);
	getRequest.setSubscriptionId(subscriptionId);

	console.log(JSON.stringify(getRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.ARBGetSubscriptionController(getRequest.getJSON());

	ctrl.execute(function(){
		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.ARBGetSubscriptionResponse(apiResponse);

		console.log(JSON.stringify(response, null, 2));
		
		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				console.log('Subscription Name : ' + response.getSubscription().getName());
				console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
				console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());
			}
			else{
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else{
			console.log('Null Response.');
		}


		callback(response);
	});
}

var URL =
  "mongodb://dexhonsa:Awesomeo21@knacksite-shard-00-00-jh46e.mongodb.net:27017,knacksite-shard-00-01-jh46e.mongodb.net:27017,knacksite-shard-00-02-jh46e.mongodb.net:27017/test?replicaSet=knacksite-shard-0&ssl=true&authSource=admin";

// For PRODUCTION use
//ctrl.setEnvironment(SDKConstants.endpoint.production);


module.exports = router;