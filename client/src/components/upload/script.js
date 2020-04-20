import axios from 'axios';
import keys from './keys'
import moment from 'moment';

export default {
  name: 'upload',
  data() {
    return {
      moment,
      isLoading: false,
      imageName: "No Image",
      file: null,
      loadedProgress: 0,
      results: [],
      resultsLoaded: false,
      columns: [],
      included: [],
      exportIncluded: [],
      match: null,
      matchTo: 'first_name',
      size: 0,
      length: 0,
      isUploading: false,
      isLoaded: false,
      confirmLoading: false,
      importComplete: false,
      hasError: false,
      errorMessage: '',
      hasSuccess: false,
      successMessage: '',
      tab: 0,
      updateProp: '',
      conditionProp: '',
      numberProps: ['creditors_total_due', 'total_paid_to_date', 'monthly_payment_amount'],
      dateProps: ['dob', 'date_of_notice', 'next_payment_date', 'creditors_invoice_date', 'date_of_order'],
      condition_start_date: '',
      update_start_date: '',
      end_date: '',
      menu: false,
      menu2: false,
      operator: '',
      condition_value: '',
      update_value: '',
      isUpdating: false,
      filterMenu: false,
      activeDataType: "number",
      filterMin: 0,
      filterMax: 0,
      filterValue: "",
      filterStartDate: "",
      filterEndDate: "",
      filterOperator: "between",
      filter: "",
      filterSort: "asc",
      filterError: false,
      filterErrorMessage: "",
      filterChain: [],
      pickerOpen: false,
      transferDate:moment().format('YYYY-MM-DD'),
      deleteByProp: false,
      previewItems: [],
      future: false,
      futureClients: [],
      queId:'',
      allQues:[]
    }
  },
  watch: {
    
    deleteByProp(val) {
      if (val) {
        this.previewItems = [];
      }
      this.hasError = false;
      this.hasSuccess = false;
    }
  },
  mounted(){
    this.getTransferDate();
  },
  computed: {
    selectedAll() {
      return this.exportIncluded.length === this.dbKeys.length;
    },
    selectedSome() {
      return this.exportIncluded.length > 0 && !this.selectedAll;
    },
    icon() {
      if (this.selectedAll) return 'fa fa-check-square';
      if (this.selectedSome) return 'fa fa-minus-square';
      return 'far fa-square';
    },
    futureColumns() {
      return ["first_name", "last_name", "_id"]
    },
    
    
    previewColumns() {
      return ['account_number', this.conditionProp, this.updateProp]
    },
    user() {
      return this.$store.state.userStore.user;
    },
    dbKeys() {
      return keys.keys
    },

    filters() {
      if (this.filter != "") {
        return [
          {
            name: this.filter,
            type: this.activeDataType,
            min: this.filterMin,
            max: this.filterMax,
            value: this.filterValue,
            startDate: this.filterStartDate,
            operator: this.filterOperator
          }
        ];
      } else {
        return [];
      }
    },
    
    filterColumns() {
      return [
        { label: "Account Number", value: "account_number", type: "string" },
        { label: "First Name", value: "first_name", type: "string" },
        { label: "Middle Name", value: "middle_name", type: "string" },
        { label: "Last Name", value: "last_name", type: "string" },
        {
          label: "Monthly Payment Amount",
          value: "monthly_payment_amount",
          type: "number"
        },
        { label: "Phone", value: "phone", type: "string" },
        { label: "Date of Notice", value: "date_of_notice", type: "date" },
        {
          label: "Creditors Total Due",
          value: "creditors_total_due",
          type: "number"
        },
        {
          label: "Zip",
          value: "zip",
          type: "string"
        },
        {
          label: "address",
          value: "address",
          type: "string"
        },
        {
          label: "State",
          value: "state",
          type: "string"
        },
        {
          label: "Reported To Credit Bureau",
          value: "reported_to_credit_bureau",
          type: "bool"
        },
        {
          label: "Total Paid to Date",
          value: "total_paid_to_date",
          type: "number"
        }
      ];
    },
  },
  methods: {
    toggle(){
      this.$nextTick(() => {
        if (this.selectedAll) {
          this.exportIncluded = [];
        } else {
          this.exportIncluded = this.dbKeys;
        }
      });
      
    },
    updateQue(val){
      if(this.queId != ''){
        var d = new Date(val);
        d.setDate(d.getDate() + 1);
        axios.post("/api/future_que/update", {queId:this.queId, transferDate:d}).then(()=>{
          this.getAllQues();
        })
      }
      
    },
    convertDate(d){

        this.transferDate = moment(d).format('YYYY-MM-DD');
    },
    getTransferDate(){
      var dayOfWeek = 5;//friday
        let date = new Date();
        var diff = date.getDay() - dayOfWeek;
        if (diff > 0) {
          date.setDate(date.getDate() + 6);
        }
        else if (diff < 0) {
          date.setDate(date.getDate() + ((-1) * diff))
        }
        this.transferDate = moment(date).format('YYYY-MM-DD');
    },
    allowedDates(val) {
      let date = new Date();
      let test = new Date(val);
      console.log(new Date(val) > new Date());
      console.log(new Date(val));
      return test > date;
    },
    getAllQues(){
      axios.get('/api/future_que/allques').then(res=>{
        this.allQues = res.data.sort((a, b) => new Date(a.transfer_date) - new Date(b.transfer_date));
      })
    },
    getFutureQue(date) {
      axios.post('/api/future_que/transfer_que', {date}).then((res) => {
        if (res.data != null) {
          this.futureClients = res.data.items;
          this.queId = res.data.queId;

        } else { }
      })
    },
    confirmPreview() {
      this.previewItems = [];
      this.isUpdating = true;
      var ut, ct;
      if (this.numberProps.includes(this.updateProp)) {
        ut = 'number';
      }
      if (this.numberProps.includes(this.conditionProp)) {
        ct = 'number';
      }

      if (this.dateProps.includes(this.updateProp)) {
        ut = 'date';
      }
      if (this.dateProps.includes(this.conditionProp)) {
        ct = 'date';
      }

      if (!this.numberProps.includes(this.updateProp) && !this.dateProps.includes(this.updateProp)) {
        ut = 'string';
      }
      if (!this.numberProps.includes(this.conditionProp) && !this.dateProps.includes(this.conditionProp)) {
        ct = 'string';
      }
      var updateObj = {
        condition_value: this.condition_value,
        condition_type: ct,
        update_type: ut,
        update_value: this.update_value,
        update_prop: this.updateProp,
        condition_prop: this.conditionProp,
        operator: this.operator,
      };
      let domain = 'update';
      if (this.deleteByProp) {
        domain = 'delete';
      }
      axios.post('/api/files/preview/' + domain, updateObj).then(res => {
        this.previewItems = res.data;
        this.isUpdating = false;
        this.hasSuccess = true;
        this.successMessage = 'These are the items to be updated:'
      }, err => {
        this.hasError = true;
        this.errorMessage = 'There was an Error';
        this.isUpdating = false;
      })
    },
    addToFilterChain() {
      let filter = {
        name: this.filter,
        type: this.activeDataType,
        min: this.filterMin,
        max: this.filterMax,
        value: this.filterValue,
        startDate: this.filterStartDate,
        operator: this.filterOperator
      };
      this.filterChain.push(filter);
    },
    submitFilter() {
      this.$router.push({ query: { page: 1 } });
      if (this.activeDataType == "number") {
        if (this.filterOperator == "between") {
          if (this.filterMin == 0 || this.filterMax == 0) {
            this.filterError = true;
            this.filterErrorMessage = "Please Fix the issues";
            return;
          }
        } else {
          if (this.filterValue == "" || this.filterOperator == "") {
            this.filterError = true;
            this.filterErrorMessage = "Please Fix the issues";
            return;
          }
        }
      }
      if (this.activeDataType == "string") {
        if (this.filterValue == "" || this.filterOperator == "") {
          this.filterError = true;
          this.filterErrorMessage = "Please Fix the issues";
          return;
        }
      }
      if (this.activeDataType == "date") {
        if (this.filterStartDate == "" || this.filterOperator == "") {
          this.filterError = true;
          this.filterMessage = "Please Fix the issues";
          return;
        }
      }
      var post = {
        term: this.term,
        filters: [
          {
            name: this.filter,
            type: this.activeDataType,
            min: this.filterMin,
            max: this.filterMax,
            value: this.filterValue,
            startDate: this.filterStartDate,
            operator: this.filterOperator
          }
        ],
        sortName: this.filter,
        type: "all",
      };
      axios.post("/api/clients/search", post).then(res => {
        this.clients = res.data.items;
        this.total = res.data.total;
        this.isLoaded = true;
      });
    },
    getDataType(filter, i) {
      var arr = this.filterColumns.filter((item, i) => {
        return item.value == filter;
      });
      if (arr[0].type == "string") {
        this.filterOperator = "contains";
      }
      if (arr[0].type == "number") {
        this.filterOperator = "between";
      }
      if (arr[0].type == "date") {
        this.filterOperator = "before";
      }
      if (arr[0].type == "bool") {
        this.filterOperator = "equals";
      }
      this.activeDataType = arr[0].type;
    },
    confirmExport() {
      axios.post('/api/files/export', { filters: this.filterChain, term: '', type: 'all', included: this.exportIncluded }).then(res => {

        let a = window.document.createElement('a');
        a.href = `/api/${res.data.url}`;
        //a.download = res.data.output_path;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
      }, err => {
        console.log(err);
      })
    },
    includeAll() {
      this.included = this.columns;
    },
    confirmUpdate() {
      this.isUpdating = true;
      var ut, ct;
      if (this.numberProps.includes(this.updateProp)) {
        ut = 'number';
      }
      if (this.numberProps.includes(this.conditionProp)) {
        ct = 'number';
      }

      if (this.dateProps.includes(this.updateProp)) {
        ut = 'date';
      }
      if (this.dateProps.includes(this.conditionProp)) {
        ct = 'date';
      }

      if (!this.numberProps.includes(this.updateProp) && !this.dateProps.includes(this.updateProp)) {
        ut = 'string';
      }
      if (!this.numberProps.includes(this.conditionProp) && !this.dateProps.includes(this.conditionProp)) {
        ct = 'string';
      }
      var updateObj = {
        condition_value: this.condition_value,
        condition_type: ct,
        update_type: ut,
        update_value: this.update_value,
        update_prop: this.updateProp,
        condition_prop: this.conditionProp,
        operator: this.operator,
      };
      let domain = 'update';
      if (this.deleteByProp) {
        domain = 'delete';
      }
      axios.post('/api/files/' + domain, updateObj).then(res => {
        this.isUpdating = false;
        this.hasSuccess = true;
        this.successMessage = 'Success!'
      }, err => {
        this.hasError = true;
        this.errorMessage = 'There was an Error';
        this.isUpdating = false;
      })
    },
    sendToServer() {
      this.$socket.send('some data')
    },
    uploadfile(e) {
      //console.log(e.target.files[0].name);

      if (e.target.files[0].name.indexOf('.csv') > -1) {
        this.file = e.target.files[0].name
        this.imageName = e.target.files[0].name;
        this.hasError = false;
        this.errorMessage = '';
      } else {
        this.hasError = true;
        this.errorMessage = 'Please upload a csv.'
      }
    },
    confirmUpload() {
      this.hasError = false;
      this.confirmLoading = true;
      this.$options.sockets.onmessage = (data) => {
        if (data.data == 'import complete') {
          this.confirmLoading = false;
          this.importComplete = true;
        }
        // this.$refs.loadBar.style.transform = `scaleX(${data.data})`
        // this.loadedProgress = data.data;
      }
      var included = this.included;
      if (this.future) {
        included.push('future');
      }
      var match = this.match;
      var matchTo = this.matchTo;
      axios.post('/api/files/confirm_upload', { user_id: this.user.id, included, match, matchTo, length: this.length, future: this.future }).then((res) => {
        console.log(res.data);
        if(this.future){
          axios.get('/api/get500').then((res2)=>{

          })
        }
        //this.$router.push('collection/master_search?page=1')
      }, err => {
        console.log(err);
      })

    },
    upload(e) {
      this.isUploading = true;


      this.isLoading = true;
      var form = event.target;
      var data = new FormData(form);
      data = data.entries();
      var obj = data.next();
      var retrieved = {};
      while (undefined !== obj.value) {
        retrieved[obj.value[0]] = obj.value[1];
        obj = data.next();
      }

      var formData = new FormData();


      const newFile = new File([retrieved.file], 'upload.csv', { type: retrieved.file.type });

      formData.append("file", newFile);
      formData.append("fileName", 'upload.csv');
      formData.append("userId", this.user.id);

      axios
        .post("/api/files/add/" + this.user.id, formData)
        .then(
          res => {
            this.isUploading = false;
            this.results = res.data.results;
            this.columns = res.data.headers;
            this.size = res.data.size;
            this.length = res.data.length;
            this.resultsLoaded = true
            this.isLoaded = true;

          },
          err => {
            this.isUploading = false;
            this.hasError = true;
            this.isLoading = false;
            this.errorMessage = err.response.data.message;
          }
        );
    }
  }
}