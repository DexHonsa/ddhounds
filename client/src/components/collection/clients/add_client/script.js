import axios from 'axios';
export default {
    name:'add_client',
    data(){
        return {
            valid: true,
            clientName:'',
            address:'',
            phone:'',
            keys:[],
            model:{
                "name": "",
                "address": "",
                "phone": "",
                "cellphone": "",
                "date_of_order": "694249200000",
                "last_4_cc": 0,
                "credit_card_type": "",
                "dob": "694249200000",
                "number_of_payments": 0,
                "monthly_payment_amount": 0,
                "total": 0,
                "creditors_total_due": 0,
                "product_1": "",
                "product_2": "",
                "product_3": "",
                "product_4": "",
                "product_5": "",
                "product_6": "",
                "product_7": "",
                "product_8": "",
                "product_9": "",
                "product_10": "",
                "email": "",
                "reference_contact": "",
                "notes": "",
                "account_number": 0,
                "date_of_notice": "694249200000",
                "documentation": "",
                "status": "",
                "date_of_contract": "694249200000",
                "next_payment_date": "694249200000",
                "payment_amount": 0,
                "payment_method": "",
                "cc_number": 0,
                "expiration_date": "694249200000",
                "cvv": 0,
                "bank_name": "",
                "routing_number": 0,
                "check_number": 0,
                "payment_notes": "",
                "balance_due": 0,
                "account_holders_name": "",
                "billing_address": "",
                "tracking_number": 0,
                "agency": "",
                "agent": "",
                "closer": "",
                "date_of_closure": "694249200000",
                "returned_mail": "",
                "number_of_payments_made": 0,
                "creditor": "",
                "total_paid_to_date": 0,
                "creditors_invoice_date": "694249200000",
                "ssn": 0,
                "documentation_1": "",
                "documentation_2": "",
                "drivers_license_number": "",
                "judement": "",
                "account_open_date": "694249200000",
                "date_of_second_notice": "694249200000",
                "send_new_demand": "",
                "employment": "",
                "date_of_first_delinquency": "694249200000"
            },
            basicInfo:['name',"dob" ,"address","phone","cellphone","email","drivers_license_number","ssn","returned_mail","reference_contact","date_of_notice","creditor","tracking_number","status"],
            creditCardInfo:["credit_card_type","cc_number","cvv","last_4_cc",'bank_name','bank_account_number','routing_number','check_number'],
            accountInfo:['account_number','account_holders_name','creditors_total_due','creditors_invoice_date','next_payment_date','balance_due','billing_address','number_of_payments','monthly_payment_amount','date_of_order'],
            all:{0: "name",
            1: "address",
            2: "phone",
            3: "cellphone",
            4: "date_of_order",
            5: "last_4_cc",
            6: "credit_card_type",
            7: "dob",
            8: "number_of_payments",
            9: "monthly_payment_amount",
            10: "total",
            11: "creditors_total_due",
            12: "product_1",
            13: "product_2",
            14: "product_3",
            15: "email",
            16: "reference_contact",
            17: "notes",
            18: "account_number",
            19: "date_of_notice",
            20: "documentation",
            21: "status",
            22: "date_of_contract",
            23: "next_payment_date",
            24: "payment_amount",
            25: "payment_method",
            26: "cc_number",
            27: "expiration_date",
            28: "cvv",
            29: "bank_name",
            30: "routing_number",
            31: "check_number",
            32: "payment_notes",
            33: "balance_due",
            34: "account_holders_name",
            35: "billing_address",
            36: "tracking_number",
            37: "agency",
            38: "agent",
            39: "closer",
            40: "date_of_closure",
            41: "returned_mail",
            42: "number_of_payments_made",
            43: "creditor",
            44: "total_paid_to_date",
            45: "creditors_invoice_date",
            46: "ssn",
            47: "documentation_1",
            48: "documentation_2",
            49: "drivers_license_number",
            50: "judement",
            51: "account_open_date",
            52: "date_of_second_notice",
            53: "send_new_demand",
            54: "employment",
            55: "date_of_first_delinquency"}
        }
    },
    $_veeValidate: {
        validator: 'new'
      },
    mounted(){
    },
    methods:{
        getWidth(key){
            
            if(key == 'name'){
                return '250px';
            }if(key == 'billing_address'){
                return '400px';
            }if(key == 'account_number'){
                return '250px';
            }if(key == 'status'){
                return '250px';
            }if(key == 'reference_contact'){
                return '250px';
            }if(key == 'drivers_license_number'){
                return '250px';
            }if(key == 'address'){
                return '500px';
            }if(key == 'email'){
                return '200px';
            }if(key == 'cc_number'){
                return '400px';
            }if(key == 'credit_card_type'){
                return '200px';
            }else{
                return '200px';
            }
        },
        getRequired(key){
            if(key == 'name'){
                return 'required'
            }
        },
        getMask(key){
            if(key == 'phone' || key == 'cellphone'){
                return 'phone'
            }
            if(key == 'dob'){
                return 'date'
            }
            if(key == "cc_number"){
                return 'credit-card'
            }
            if(key == 'last_4_cc'){
                return '####'
            }
            if(key == 'ssn'){
                return '###-##-####'
            }
            if(key == 'cvv'){
                return '###'
            }
            if(key == 'date_of_notice'){
                return 'date'
            }
            if(key == 'next_payment_date'){
                return 'date'
            }
            if(key == 'date_of_order'){
                return 'date'
            }
            if(key == 'creditors_invoice_date'){
                return 'date'
            }
            
        },
         humanize(str) {
            var frags = str.split('_');
            if(frags != null){
                for (let i=0; i<frags.length; i++) {
                    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
                }
                return frags.join(' ');
            }else{
                return str;
            }
            
            
          },

        submit () {
            this.$validator.validateAll()
          },
        getAddressData: function (addressData, placeResultData, id) {
            this.address = addressData;
        }
    },
    computed:{

    },
    components:{

    }
    
}