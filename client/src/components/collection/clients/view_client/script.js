import axios from 'axios';
import ClientHistory from '@/components/collection/clients/client_history';
import ViewMail from '@/components/collection/clients/view_client/view_mail';
import Vue from 'vue';
import states2 from './states.json';
import moment from 'moment';

import _ from 'lodash';
export default {
    name: 'view_client',
    data() {
        return {
            paymentTabs:0,
            add_doc:false,
            add_doc_name:'',
            docs:[],
            addDocLoading:false,
            differentBillingAddress: false,
            drawer: false,
            enteredBillingAddress: {

            },
            meta:{

            },
            billing_same_as_address:false,
            states: states2,
            noteActive: false,
            viewMail: false,
            activeViewMail: {},
            credit_bureau_report: false,
            productEditing: false,
            changedProps: {},
            staticModel: {},
            menu: false,
            pickerOpen: false,
            isRecurring: false,
            paymentProcessing: false,
            paymentError: false,
            paymentSuccess: false,
            paymentErrorMessage: '',
            makePayment: false,
            updateCreditCard: true,
            makePaymentActiveTab: 0,
            transactionsLoading: false,
            model: {},
            clientHistoryOpen: false,
            isLoaded: false,
            mails: [],
            history: [],
            hasHistory: [],
            transactions: [],
            activeSubscriptions: [],
            notes: [],
            note: '',
            barLoaded: false,
            tooltipLoaded: false,
            tooltipNames: [],
            recentChange: '',
            addingNote: false,
            numberProps: ['creditors_total_due', 'total_paid_to_date', 'monthly_payment_amount'],
            dateProps: ['dob', 'date_of_notice', 'next_payment_date', 'creditors_invoice_date', 'date_of_order'],
            basicInfo: ['first_name', 'middle_name', 'last_name', "dob", "street1", "street2", "city", "state", "zip", "phone", "cellphone", "email", "drivers_license_number", "ssn", "return_mail", "reference_contact", "date_of_notice", "status"],
            creditCardInfo: ["credit_card_type", "cc_number", "cvv", "last_4_cc", 'bank_name', 'bank_account_number', 'routing_number', 'check_number', 'balance_due', "tracking_number", 'billing_address', 'number_of_payments', 'monthly_payment_amount'],
            accountInfo: ['account_number', 'account_holders_name', 'creditors_total_due', 'creditors_invoice_date', 'next_payment_date', 'date_of_order', "creditor",],
            editNote:-1,
            editedNoteBody:''
        }
    },
    mounted() {
        this.getHistory();
        this.getClient();
        this.getMails();
        this.getNotes();
        this.getTransactions();
        setTimeout(()=>{
            this.getDocs();
            
        },2500)
        
        //this.getActiveSubscriptions();

    },
    watch:{
        billing_same_as_address(val){
            if(val){
                this.charge.billing_address_street1 = this.model.street1
                this.charge.billing_address_street2 = this.model.street2
                this.charge.billing_address_city = this.model.city
                this.charge.billing_address_state = this.model.state
                this.charge.billing_address_zip = this.model.zip
            }else{
                this.charge.billing_address_street1 = '';
                this.charge.billing_address_street2 = ''
                this.charge.billing_address_city = ''
                this.charge.billing_address_state = ''
                this.charge.billing_address_zip = ''
            }
        }
    },
    methods: {
        getMeta(){
            return new Promise((resolve)=>{
              let update = {};
            axios.get('/api/meta/' + this.model.account_number).then((res)=>{
                this.meta = res.data;
                resolve();
                
            },err=>{
                resolve();
            })  
            })
            let update = {};
            axios.get('/api/meta/' + this.model.account_number).then((res)=>{
                console.log(res.data);
                this.meta = res.data;
                
            },err=>{

            })
        },
        updateMeta(meta){
            let update = {...this.meta,...meta}
                axios.post('/api/meta/update/' + this.model.account_number, update).then((res)=>{
                    this.meta = update;
            },err=>{
                console.log('Error updating Meta')
            })
        },
        getDocs(){
            axios.get('/api/files/get_docs/' + this.model.account_number).then((res)=>{
                
                this.docs = res.data.docs;
            },err=>{

            })
        },
        downloadDoc(filename){
            let a = window.document.createElement('a');
            a.href = `/api/static/${this.model.account_number}/${filename}`;
            //a.download = res.data.output_path;
            window.document.body.appendChild(a);
            a.click();
            window.document.body.removeChild(a);
        },
        selectDoc(e){
            console.log(e.target.files[0].name);
            this.add_doc_name = e.target.files[0].name;
        },
        uploadDoc(){
            this.addDocLoading = true;
            
            const selectedFile = document.getElementById('addDoc').files[0];
            
            var formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("fileName", selectedFile.name);
            
            
            axios.post('/api/files/add_doc/' + this.model.account_number, formData).then((res)=>{
                    this.getDocs();
                    axios.post('/api/clients/add_note', {
                        client_id: this.path,
                        user_id: this.$store.state.userStore.user.id,
                        user_name: `${this.$store.state.userStore.user.first_name} ${this.$store.state.userStore.user.last_name}`,
                        note: `Added Document: ${selectedFile.name}`
                    }).then(res => {
                        this.note = '';
                        this.noteActive = false;
                        this.getNotes().then(() => {
    
                            this.addingNote = false;
                        })
    
                    })
                    this.addDocLoading = false;
                    this.add_doc = false;
                
            },(err)=>{
                this.addDocLoading = false;
            })

            
            
        },
        deleteNote(id){
            this.addingNote = true;
            axios.get('/api/clients/delete_note/' + id).then(res=>{
                this.getNotes();
            },err=>{
                this.getNotes();
            })
        },
        toggleEditNote(index, body, noteId){
            if(this.editNote != -1){
                if(body != this.editedNoteBody){
                    this.submitNoteEdit(noteId);
                }
            }
            this.editedNoteBody = body;
            this.editNote = index;
        },
        submitNoteEdit(noteId){
            this.addingNote = true;
            let postData = {
                note:this.editedNoteBody,
                id:noteId
            }
            axios.post("/api/clients/edit_note", postData).then(res=>{
                this.editNote = -1;
                this.getNotes();

            })
        },
        getDaysLeft(date) {
            const date1 = new Date();
            const date2 = new Date(date);
            const diffTime = Math.floor(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        },
        hideViewMail() {
            this.viewMail = false;
        },
        toggleViewMail(mail) {
            this.viewMail = true;
            this.activeViewMail = mail;
        },
        sendMailer() {
            this.$router.push('/send_mail/' + this.path);
        },
        checkCreditBureau() {
            setTimeout(() => {
                this.updateClient({ reported_to_credit_bureau: this.activeModel['reported_to_credit_bureau'] });
            }, 100);

        },
        checkPaidInFull() {
            setTimeout(() => {
                this.updateClient({ paid_in_full: this.activeModel['paid_in_full'] });
            }, 100);

        },
        checkReturnMail(e) {
            setTimeout(() => {
                this.updateClient({ return_mail: this.activeModel['return_mail'] });
            }, 100);

        },
        closeMenu(index) {
            this[`menu${index}`] = false;
        },
        changeProp(e, key) {

            if (e != this.staticModel[key]) {
                if (this.numberProps.includes(key)) {
                    Vue.set(this.changedProps, key, Number(e));
                } else {
                    Vue.set(this.changedProps, key, e);
                }
                // if(this.dateProps.includes(key)){
                //     var date = `${e[0]}${e[1]}-${e[2]}${e[3]}-${e[4]}${e[5]}${e[6]}${e[7]}`
                //     Vue.set(this.changedProps, key, new Date(date) * 1000 / 1000);
                // }else{

                // }


            } else {
                delete this.changedProps[key]
            }
        },
        saveEdit() {
            this.isLoaded = false;
            var model = JSON.parse(JSON.stringify(this.activeModel));
            var keys = Object.keys(model);
            for (let i = 0; i < keys.length; i++) {
                if (this.dateProps.includes(keys[i])) {

                    let e = model[keys[i]];
                    let parsedDate = e.split('/');
                    let finsihedDate = `${parsedDate[2]}-${parsedDate[0]}-${parsedDate[1] - 1}`;
                    model[keys[i]] = finsihedDate;
                }
            }
            var updatePromises = [];
            for (let i = 0; i < Object.keys(this.changedProps).length; i++) {
                let obj = { type:'field',user_name: `${this.$store.state.userStore.user.first_name} ${this.$store.state.userStore.user.last_name}`, client_id: this.path, user_id: this.$store.state.userStore.user.id, action: { prop: Object.keys(this.changedProps)[i], new_value: this.changedProps[Object.keys(this.changedProps)[i]], previous_value: this.staticModel[Object.keys(this.changedProps)[i]] } };
                updatePromises.push(axios.post('/api/clients/add_history', obj))

            }
            Promise.all(updatePromises).then(res => {
                var post = JSON.parse(JSON.stringify(this.activeModel));
                if (this.changedProps.status == 'Dispute') {
                    post.active_dispute = true;
                    var today = new Date();
                    today.setDate(today.getDate() + 60);
                    post.dispute_end_date = today
                }
                axios.post('/api/clients/edit/' + this.path, post).then(res => {

                    this.getClient();
                    this.getHistory();

                }, err => {
                    console.log('eh error')
                })
            })
        },
        cancelSubscription(id, _id) {
            axios.post('/api/subscriptions/cancel/' + id, { _id }).then(() => {
                this.getActiveSubscriptions();
            }, err => {
                console.log('hey')
            })
        },
        getTransactions() {
            this.transactionsLoading = true;
            axios.get("/api/transactions/" + this.path).then(res => {
                this.transactions = res.data.reverse();
                this.transactionsLoading = false;
            })
        },
        // getActiveSubscriptions(){
        //     this.transactionsLoading = true;
        //     axios.get("/api/subscriptions/" + this.path).then(res=>{
        //         this.activeSubscriptions = res.data;
        //         this.transactionsLoading = false;
        //     })
        // },
        submitCreditCardPayment() {
            this.paymentError = false;
            this.paymentSuccess = false;
            this.paymentProcessing = true;

            if (this.charge.country == null) {
                this.charge.country = 'USA';
            }

            if (this.makePaymentActiveTab == 0) {
                if (this.charge.cc_number == "" || this.charge.exp == "" || this.charge.first_name == "" || this.charge.last_name == "" || this.charge.amount == "" || this.charge.cvv == "" || this.charge.payment_date == "" || this.charge.billing_address_street1 == ""  || this.charge.billing_address_city == "" || this.charge.billing_address_state == "" || this.charge.billing_address_zip == "") {
                    this.paymentError = true;
                    this.paymentErrorMessage = "Please fill out the form completely before hitting process."
                    this.paymentProcessing = false;
                    return;
                }
                this.chargeCreditCard();
            }
            if (this.makePaymentActiveTab == 1) {
                if (this.charge.bank_account_number == "" || this.charge.routing_number == "" || this.charge.account_holder == "" || this.charge.account_type == "" || this.charge.amount == "" || this.charge.payment_date == "") {
                    this.paymentError = true;
                    this.paymentErrorMessage = "Please fill out the form completely before hitting process."
                    this.paymentProcessing = false;
                    return;
                }
                this.chargeBankAccount();
            }
        },
        submitCheckPayment() {
            this.paymentError = false;
            this.paymentSuccess = false;
            this.paymentProcessing = true;

            if (this.charge.country == null) {
                this.charge.country = 'USA';
            }


            if (this.charge.check_number == "" || this.charge.account_holder == "" || this.charge.account_type == "" || this.charge.amount == "" || this.charge.routing_number == "" || this.charge.bank_name == "") {
                this.paymentError = true;
                this.paymentErrorMessage = "Please fill out the form completely before hitting process."
                this.paymentProcessing = false;
                return;
            }
            this.chargeCheck();






        },
        createSubscription() {
            console.log('create sub');
            // axios.post('/api/payment/create_subscription', this.charge ).then(res=>{
            //     var obj = {
            //         subscriptionId: res.data.subscriptionId, 
            //         userId:this.user.id, 
            //         userName:`${this.user.first_name} ${this.user.last_name}`, 
            //         clientId:this.path,
            //         numberOfPayments:Number(this.charge.number_of_payments), 
            //         amount:Number(this.charge.amount), 
            //         type:this.charge.type, 
            //         startDate:this.charge.start_date
            //     }
            //     axios.post('/api/subscriptions/add', obj ).then(()=>{
            //         this.paymentSuccess = true;
            //         this.paymentProcessing = false;
            //         this.getActiveSubscriptions();
            //         this.getClient();
            //     },err=>{
            //         console.log('Error creating Subscription',err);
            //     })
            // },err=>{
            //     var error = err.response.data.error;
            //     this.paymentError = true;
            //     this.paymentErrorMessage = error
            //     this.paymentProcessing = false;
            // })
        },
        createBankSubscription() {
            console.log('create-bank-sub');
            // axios.post('/api/payment/create_bank_subscription', this.charge ).then(res=>{
            //     var obj = {
            //         subscriptionId: res.data.subscriptionId, 
            //         userId:this.user.id, 
            //         userName:`${this.user.first_name} ${this.user.last_name}`, 
            //         clientId:this.path,
            //         numberOfPayments:Number(this.charge.number_of_payments), 
            //         amount:Number(this.charge.amount), 
            //         type:this.charge.type, 
            //         startDate:this.charge.start_date
            //     }
            //     axios.post('/api/subscriptions/add', obj ).then(()=>{
            //         this.paymentSuccess = true;
            //         this.paymentProcessing = false;
            //         this.getActiveSubscriptions();
            //         this.getClient();
            //     },err=>{
            //         console.log('Error creating Subscription',err);
            //     })
            // },err=>{
            //     var error = err.response.data.error;
            //     this.paymentError = true;
            //     this.paymentErrorMessage = error
            //     this.paymentProcessing = false;
            // })
        },
        chargeCreditCard() {

            let balanceDue = this.activeModel['creditors_total_due'] - this.activeModel['total_paid_to_date'] - this.charge.amount;
            let payment_type;
            if (this.makePaymentActiveTab == 0) {
                payment_type = "card"
            } else {
                payment_type = "bank"
            }
            if (!this.isRecurring) {
                this.charge.payment_date = new Date();
                axios.post('/api/payment/authorize_credit_card', this.charge).then(res => {


                    if (res.data.errors) {
                        this.paymentError = true;
                        this.paymentErrorMessage = res.data.errors.error[0].errorText;
                        this.paymentProcessing = false;
                        return
                    }

                    axios.post('/api/transactions/add', {
                        charge: this.charge,
                        transactionId: res.data.transactionId,
                        userId: this.user.id,
                        userName: `${this.user.first_name} ${this.user.last_name}`,
                        balanceAfterPayment: Number(balanceDue.toFixed(2)),
                        clientId: this.path,
                        account_number: this.model.account_number,
                        payment_date: new Date(this.charge.payment_date),
                        amount: Number(Number(this.charge.amount).toFixed(2)),
                        type: payment_type,

                    }).then(() => {
                        var cardObj = {};
                        if (this.updateCreditCard) {
                            cardObj.cc_number = this.charge.cc_number;
                            cardObj.cvv = this.charge.cvv;
                            cardObj.expiration_date = this.charge.exp;
                        }
                        this.updateClient({
                            billing_address_street1:this.charge.billing_address_street1,
                            billing_address_street2:this.charge.billing_address_street2,
                            billing_address_city:this.charge.billing_address_city,
                            billing_address_state:this.charge.billing_address_state,
                            billing_address_zip:this.charge.billing_address_zip,
                            total_paid_to_date: Number(Number(Number(this.activeModel['total_paid_to_date']) + Number(this.charge.amount)).toFixed(2)),
                            number_of_payments_made: Number(this.activeModel['number_of_payments_made'] + 1),
                            ...cardObj
                        })
                        this.paymentSuccess = true;
                        this.paymentProcessing = false;
                        this.getTransactions();
                        this.getClient();
                    })
                }, err => {
                    var error = err.response.data.error;
                    this.paymentError = true;
                    this.paymentErrorMessage = error
                    this.paymentProcessing = false;
                });
            } else {
                var timezoneDate = new Date(this.charge.payment_date);
                timezoneDate.setHours(timezoneDate.getHours() + 8);
                axios.post('/api/transactions/add', {
                    transactionId: null,
                    charge: this.charge,
                    userId: this.user.id,
                    userName: `${this.user.first_name} ${this.user.last_name}`,
                    balanceAfterPayment: 'N/A',
                    clientId: this.path,
                    account_number: this.model.account_number,
                    payment_date: new Date(timezoneDate),
                    amount: Number(Number(this.charge.amount).toFixed(2)),
                    type: payment_type,

                }).then(() => {
                    var cardObj = {};
                    if (this.updateCreditCard) {
                        cardObj.cc_number = this.charge.cc_number;
                        cardObj.cvv = this.charge.cvv;
                        cardObj.expiration_date = this.charge.exp;
                        this.updateClient({
                            ...cardObj
                        })
                    }

                    this.paymentSuccess = true;
                    this.paymentProcessing = false;
                    this.getTransactions();
                    this.getClient();
                })
            }

        },
        chargeBankAccount() {
            axios.post('/api/payment/authorize_bank_account', this.charge).then(res => {

                var payment_type;
                if (this.makePaymentActiveTab == 0) {
                    payment_type = "card"
                } else {
                    payment_type = "bank"
                }
                if (res.data.errors) {
                    this.paymentError = true;
                    this.paymentErrorMessage = res.data.errors.error[0].errorText;
                    this.paymentProcessing = false;
                    return
                }
                var balanceDue = this.activeModel['creditors_total_due'] - this.activeModel['total_paid_to_date'] - this.charge.amount;
                axios.post('/api/transactions/add', {
                    transactionId: res.data.transactionId,
                    userId: this.user.id,
                    userName: `${this.user.first_name} ${this.user.last_name}`,
                    balanceAfterPayment: Number(balanceDue.toFixed(2)),
                    clientId: this.path,
                    amount: Number(this.charge.amount).toFixed(2),
                    type: payment_type,
                }).then(() => {
                    var bankObj = {};
                    if (this.updateCreditCard) {
                        bankObj.bank_account_number = this.charge.bank_account_number;
                        bankObj.routing_number = this.charge.routing_number;
                    }
                    this.updateClient({
                        total_paid_to_date: Number(Number(Number(this.activeModel['total_paid_to_date']) + Number(this.charge.amount)).toFixed(2)),
                        number_of_payments_made: Number(this.activeModel['number_of_payments_made'] + 1),
                        ...bankObj
                    })
                    this.paymentSuccess = true;
                    this.paymentProcessing = false;
                    this.getTransactions();
                    this.getClient();
                })
            }, err => {
                var error = err.response.data.error;
                this.paymentError = true;
                this.paymentErrorMessage = error
                this.paymentProcessing = false;
            });
        },
        chargeCheck() {
            var payment_type;
            payment_type = "check"

            var balanceDue = this.activeModel['creditors_total_due'] - this.activeModel['total_paid_to_date'] - this.charge.amount;
            axios.post('/api/transactions/add', {
                transactionId: 'check',
                userId: this.user.id,
                userName: `${this.user.first_name} ${this.user.last_name}`,
                balanceAfterPayment: Number(balanceDue.toFixed(2)),
                clientId: this.path,
                amount: Number(this.charge.amount).toFixed(2),
                type: payment_type,
                check_number: this.charge.check_number,
                charge: this.charge
            }).then(() => {

                this.updateClient({
                    total_paid_to_date: Number(Number(Number(this.activeModel['total_paid_to_date']) + Number(this.charge.amount)).toFixed(2)),
                    number_of_payments_made: Number(this.activeModel['number_of_payments_made'] + 1),
                })
                this.paymentSuccess = true;
                this.paymentProcessing = false;
                this.getTransactions();
                this.getClient();
            })

        },
        toggleMakePayment() {
            this.makePayment = !this.makePayment;
        },
        getNotes() {
            return new Promise((resolve, reject) => {
                axios.get('/api/clients/notes/' + this.path).then(res => {
                    this.notes = res.data;
                    this.addingNote = false;
                    resolve();
                })
            })

        },
        addNote() {
            this.addingNote = true;
            if (this.note != '') {
                axios.post('/api/clients/add_note', {
                    client_id: this.path,
                    user_id: this.$store.state.userStore.user.id,
                    user_name: `${this.$store.state.userStore.user.first_name} ${this.$store.state.userStore.user.last_name}`,
                    note: this.note
                }).then(res => {
                    this.note = '';
                    this.noteActive = false;
                    this.getNotes().then(() => {

                        this.addingNote = false;
                    })

                })
            } else {
                this.addingNote = false;
            }

        },
        toggleClientHistory(key = '') {

            if (key != '') {
                this.activeHistoryProp = key;
                this.clientHistoryOpen = true;
            } else {
                this.clientHistoryOpen = false;
            }

        },
        getPropHistory: _.throttle(async function (prop) {
            this.tooltipLoaded = false;
            var propHist = [];
            for (let i = 0; i < this.history.length; i++) {
                if (this.history[i].action.prop == prop) {
                    propHist.push(this.history[i]);
                }
            }
            var activeProp = propHist[propHist.length - 1];
            var user = activeProp.user_name;

            this.tooltipNames = user;
            this.recentChange = `${activeProp.action.previous_value}`;
            this.tooltipLoaded = true;

        }, 2000),
        getWidth(key) {
            if (key == 'name') {
                return '250px';
            } if (key == 'billing_address') {
                return '400px';
            } if (key == 'account_number') {
                return '250px';
            } if (key == 'status') {
                return '250px';
            } if (key == 'reference_contact') {
                return '250px';
            } if (key == 'drivers_license_number') {
                return '250px';
            } if (key == 'address') {
                return '500px';
            } if (key == 'email') {
                return '200px';
            } if (key == 'cc_number') {
                return '400px';
            } if (key == 'creditor') {
                return '300px';
            } if (key == 'credit_card_type') {
                return '200px';
            } else {
                return '200px';
            }
        },
        getRequired(key) {
            if (key == 'name') {
                return 'required'
            }
        },
        getMask(key) {
            if (key == 'phone' || key == 'cellphone') {
                return 'phone'
            }
            // if (key == 'dob') {
            //     return 'date'
            // }
            if (key == "cc_number") {
                return 'credit-card'
            }
            if (key == 'last_4_cc') {
                return '####'
            }
            if (key == 'ssn') {
                return '###-##-####'
            }
            if (key == 'cvv') {
                return '###'
            }
            // if (key == 'date_of_notice') {
            //     return 'date'
            // }
            // if (key == 'next_payment_date') {
            //     return 'date'
            // }
            // if (key == 'date_of_order') {
            //     return 'date'
            // }
            // if (key == 'creditors_invoice_date') {
            //     return 'date'
            // }

        },
        humanize(str) {
            if (str == 'true') {
                return 'Yes';
            }
            if (typeof str != 'string') {
                if(typeof str == 'number'){
                    return str;
                }
                if (str) {
                    return 'Yes';
                } else {
                    return 'No';
                }

            }
            
            var frags = str.split('_');
            if (frags != null) {
                console.log('hey')
                for (let i = 0; i < frags.length; i++) {
                    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
                }
                return frags.join(' ');
            } else {
                return str;
            }


        },
        updateClient(change) {
            axios.post('/api/clients/edit/' + this.path, change).then(res => {
                this.getClient();
            }, err => {
                console.log('fick');
                console.log('error updating client')
            })
        },
        getClient() {
            this.barLoaded = false;
            axios.get('/api/clients/' + this.path).then(res => {
                this.model = res.data;

                this.staticModel = JSON.parse(JSON.stringify(res.data));
                for (let i = 0; i < Object.keys(this.model).length; i++) {
                    if (this.dateProps.includes(Object.keys(this.model)[i])) {
                        this.model[Object.keys(this.model)[i]] = moment(this.model[Object.keys(this.model)[i]]).format('MM/DD/YYYY');
                    }
                }
                this.getMeta().then(()=>{
                        this.isLoaded = true;
                    setTimeout(() => {
                        this.barLoaded = true;
                    }, 100)
                })
                
            })
        },
        getHistory() {
            axios.get('/api/clients/recent_history/' + this.path).then(res => {
                this.history = res.data.reverse();
                var arr = [];
                for (let i = 0; i < this.history.length; i++) {
                    arr.push(this.history[i].action.prop);
                }
                this.hasHistory = arr;
            }, err => {
                console.log('error has happened');
            })
        },
        getMails() {
            axios.get('/api/mail/' + this.path).then(res => {
                this.mails = res.data.items;
            }, err => {
                console.log('error has happened');
            })
        },
        format(value) {
            if (value > 100000) {
                console.log(this.formatDate(value));
                return this.formatDate(value);
            } else {
                return value;
            }
        },
        formatISO(date) {
            var dateObj = new Date(date);
            console.log(dateObj);
            if (dateObj == 'Invalid Date') {
                return date;
            }
            var currentMonth = dateObj.getMonth() + 1;
            if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
            var currentDate = dateObj.getDate() + 1;
            if (currentDate < 10) { currentDate = '0' + currentDate; }


            return `${dateObj.getFullYear()}-${currentMonth}-${currentDate}`;
        },
        parseAmount(amount) {
            if (amount) {
                return Math.round(parseFloat(amount.replace(/\$/g, '').replace(/\,/g, '')) * 100) / 100
            } else {
                return 0;
            }
        },
        formatDate(date2) {
            var date = new Date(date2);
            var monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sept",
                "Oct",
                "Nov",
                "Dec"
            ];

            var day = date.getDate();
            var monthIndex = date.getMonth();
            var year = date.getFullYear();

            return monthNames[monthIndex] + " " + day + " " + year;
        },
        compare(a, b) {
            // Use toUpperCase() to ignore character casing
            const dateB = new Date(a.created_at) * 1000;
            const dateA = new Date(b.created_at) * 1000;

            let comparison = 0;
            if (dateA > dateB) {
                comparison = 1;
            } else if (dateA < dateB) {
                comparison = -1;
            }
            return comparison;
        },
    },
    computed: {
        isAdmin() {
            if (this.user.role == 'admin') {
                return true;
            } else {
                return false;
            }
        },
        user() {
            return this.$store.state.userStore.user;
        },
        charge() {
                return {
                    first_name: this.activeModel['first_name'],
                    last_name: this.activeModel['last_name'],
                    email: this.activeModel['email'],
                    phone: this.activeModel['phone'],
                    start_date: '',
                    number_of_payments: 0,
                    city: this.activeModel['billing_address_city'],
                    address: this.activeModel['billing_address_street1'] + (this.activeModel['billing_address_street2'] || ''),
                    state: this.activeModel['billing_address_state'],
                    country: this.activeModel['billing_address_country'],
                    zip: this.activeModel['billing_address_zip'],
                    company: '',
                    cc_number: this.activeModel['cc_number'],
                    cvv: this.activeModel['cvv'],
                    expHint: 'Hint:' + this.activeModel['expiration_date'],
                    exp: this.activeModel['expiration_date'],
                    amount: '',
                    account_type: 'Checking',
                    account_holder: `${this.activeModel['first_name']} ${this.activeModel['last_name']}`,
                    bank_account_number: '',
                    routing_number: ''
                }
            

        },
        columns() {

            var columns = [

                "transaction_id",
                "amount",
                "user_name",
                "payment_date",
                "type"

            ];
            return columns
        },
        orderedNotes() {
            return this.notes.sort(this.compare)
        },
        path() {
            return this.$route.path.split('/')[this.$route.path.split('/').length - 1];
        },
        activeModel() {
            var model = JSON.parse(JSON.stringify(this.model));
            var keys = Object.keys(model);
            for (let i = 0; i < keys.length; i++) {

                if (this.dateProps.includes(keys[i])) {


                    model[keys[i]] = moment(model[keys[i]]).format('MM/DD/YYYY');

                   // model[keys[i]] = mm + "/" + dd + "/" + yyyy


                }
            }
            return model
        }
    },
    components: {
        ClientHistory,
        ViewMail
    }
}