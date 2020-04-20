import init_demand from './init_demand.js';
import moment from 'moment';
import axios from 'axios';
export default {
    name: 'mailer',
    data() {
        return {
            init_demand,
            client: {},
            data: {},
            isLoading: false,
            payment_amount: 0,
            isExporting: false,
            mail_type: '',
            complaint_number: '',
            consumer: '',
            destroy: () => {
                return;
            }
        }
    },
    mounted() {

        this.getClient().then(() => {
            this.data = JSON.parse(JSON.stringify(this.client));
            this.data.remaining_balance = Number(this.data.creditors_total_due - this.data.total_paid_to_date);
            this.mail_type = 'Payment Receipt';
        })

    },
    watch: {

        mail_type(val) {
            if (val == "Initial Demand") {
                setTimeout(() => {
                    this.destroy();
                    this.init_demand(this.client).then(destroy => {
                        this.destroy = destroy;
                        document.getElementById('init_demand').click();
                    });
                }, 10)

            }
        }
    },
    computed: {

        types() {
            return [
                //'Initial Demand',
                //'Second Demand (30 Days past due notice)', 
                // 'Notice Of Credit Reporting', 
                'Payment Receipt',
                'Paid In Full Notice',
                // 'Creditor Address Request (Validation)', 
                // 'Validation Letter Cover', 
                // 'Notice of declined payment', 
                // 'Notice of bounced check', 
                // 'Government Complaint response'
            ];
        },
        path() {
            return this.$route.params.id;
        },
        user() {
            return this.$store.state.userStore.user;
        }
    },
    methods: {
        updateRemainingBalance(text) {

            this.data.remaining_balance = Number(this.data.creditors_total_due - this.data.total_paid_to_date - Number(text)).toFixed(2);
        },
        doneRemainingBalance(text) {
            this.data.amount = Number(text).toFixed(2);
        },
        getClient() {
            return new Promise((resolve, reject) => {
                axios.get('/api/clients/' + this.path).then(res => {
                    this.client = res.data;
                    this.isLoaded = true;
                    resolve();
                }, err => {
                    reject()
                })
            })

        },
        exportDocx() {
            this.data.date = moment().format('MMM DD, YYYY')
            axios.post('/api/mail/generate_mail', {
                "type": this.mail_type.toLowerCase().replace(/ /g, "_"),
                "account_number": this.client.account_number,
                "data": this.data
            }).then(res => {
                this.$router.go(-1);
                console.log(res.data);
            }, err => {
                window.alert('Mailer Already Exists');
                console.log(err);
            })
        },
        exportPDF() {
            let canvas = document.getElementById('init_demand');
            let context = canvas.getContext('2d');
            context.scale(1, 1);
            var imgData = canvas.toDataURL("image/jpeg", 1);
            var pdf = new jsPDF({ format: 'letter' });
            var width = pdf.internal.pageSize.getWidth();
            var height = pdf.internal.pageSize.getHeight();

            //pdf.scale(2,2);
            pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
            //pdf.save(`inital_demand_${moment().format('MM_DD_YYYY')}.pdf`);
            var blob = pdf.output('blob');
            const newFile = new File([blob], `inital_demand_${moment().format('MM_DD_YYYY')}.pdf`, { type: 'application/pdf' });
            var formData = new FormData();
            //formData.append('pdf', blob);
            formData.append("file", newFile);
            formData.append("account_number", this.client.account_number);

            axios.post('/api/mail/add/' + this.client.account_number, formData).then((res) => {
                let obj = { 
                    user_name: `${this.$store.state.userStore.user.first_name} ${this.$store.state.userStore.user.last_name}`, 
                    type:'mailer',
                    client_id: this.path, 
                    user_id: this.$store.state.userStore.user.id, 
                    message:'Created Initial Demand'
                };
                axios.post('/api/clients/add_history', obj).then(()=>{
                    this.$router.go(-1);
                },err=>{window.alert('an error has occured')})
                
            }, err => {
                window.alert('Mailer Already Exists')
            });

            //axios.post('/api/mail/add',)

        }
    }
}