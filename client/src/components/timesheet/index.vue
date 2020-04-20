<template>
  <div class="inner-stage">
    <div>
      <transition enter-active-class="fadeInUp" leave-active-class="fadeOut">
              <div v-if="isLoading" class="loaderContainer animated-fast">
                <img src="@/img/double_loader.svg" alt />
              </div>
            </transition>
      <div v-if="!isLoading" class="inner-row">
        <div class="cal-container">
          <div v-for="(item,i) in days" :key="i" class="cal-day">
            <div class="cal-title">
              <b>{{monthsList[item.month]}} {{item.date}}</b>
              {{daysList[item.day]}}
            </div>
            <div class="cal-body">
              <div class="start_times">
                <div class="time-input-container">
                  <div class="time-input">
                    <div class="time-input-title">Clock In:</div>
                    <div class="time-input-time" :class="{'disabled':true}">{{_.has(weekClock[i],'clock_in') ? moment(weekClock[i].clock_in).format('LT') :'--'}} </div>
                  </div>

                  
                </div>

                <div class="time-input-container">
                <div class="time-input">
                  <div class="time-input-title">Lunch Start:</div>
                  <div class="time-input-time" :class="{'disabled':true}">{{_.has(weekClock[i],'lunch_in') ? moment(weekClock[i].lunch_in).format('LT') :'--'}} </div>
                </div>
                </div>

                <div class="time-input-container">
                <div class="time-input">
                  <div class="time-input-title">Lunch End:</div>
                  <div class="time-input-time" :class="{'disabled':true}">{{_.has(weekClock[i],'lunch_out') ? moment(weekClock[i].lunch_out).format('LT') :'--'}} </div>
                </div>

                </div>

                <div class="time-input-container">
                <div class="time-input">
                  <div class="time-input-title">Clock Out:</div>
                  <div class="time-input-time" :class="{'disabled':true}">{{_.has(weekClock[i],'clock_out') ? moment(weekClock[i].clock_out).format('LT') :'--'}} </div>
                </div>
                </div>
                <div v-if="weekClock[i].clock_in != null && weekClock[i].lunch_in != null && weekClock[i].lunch_out != null && weekClock[i].clock_out != null" class="total-hours">Hours: <span>{{getHours(weekClock[i])}}</span> </div>
              </div>
            </div>
            
          </div>
          
        </div>
        <div >
          <div class="total-week">
          Total Hours: {{totalWeekHours}}<br>
          </div>
          <v-btn class="white--text" :disabled="retrieved" style="margin-left:0;" :color="$vuetify.theme.lightGreen" depressed @click="submitTimesheet(false)">Save Timesheet</v-btn>
          <v-btn class="white--text" :disabled="retrieved" style="margin-left:0;" :color="$vuetify.theme.lightGreen" depressed @click="submitTimesheet(true)">Submit Timesheet</v-btn><br>
          
          </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import axios from "axios";
import moment from "moment";
export default {
  name: "dashboard",
  data() {
    return {
      moment,
      scale:'week',
      isLoading: true,
      expand: false,
      users: [],
      state:[
        {pickerOpen:false,start:0,pickerOpen2:false,end:0,pickerOpen3:false,l_end:0,pickerOpen4:false,l_start:0},
        {pickerOpen:false,start:0,pickerOpen2:false,end:0,pickerOpen3:false,l_end:0,pickerOpen4:false,l_start:0},
        {pickerOpen:false,start:0,pickerOpen2:false,end:0,pickerOpen3:false,l_end:0,pickerOpen4:false,l_start:0},
        {pickerOpen:false,start:0,pickerOpen2:false,end:0,pickerOpen3:false,l_end:0,pickerOpen4:false,l_start:0},
        {pickerOpen:false,start:0,pickerOpen2:false,end:0,pickerOpen3:false,l_end:0,pickerOpen4:false,l_start:0},
        {pickerOpen:false,start:0,pickerOpen2:false,end:0,pickerOpen3:false,l_end:0,pickerOpen4:false,l_start:0},
        {pickerOpen:false,start:0,pickerOpen2:false,end:0,pickerOpen3:false,l_end:0,pickerOpen4:false,l_start:0},
      ],
      transactionHistory: [],
      startpickerOpen: false,
      endpickerOpen: false,
      startDate: "2019-09-24",
      endDate: "2019-10-24",
      retrieved:false,
      days: [],
      weekClock:null,
      startTimeOptions:[
        {formatted:'pick',hours:0, minutes:0},
        {formatted:'7:00am',hours:7, minutes:0},
        {formatted:'7:15am',hours:7, minutes:15},
        {formatted:'7:30am',hours:7, minutes:30},
        {formatted:'7:45am',hours:7, minutes:45},
        {formatted:'8:00am',hours:8, minutes:0},
        {formatted:'8:15am',hours:8, minutes:15},
        {formatted:'8:30am',hours:8, minutes:30},
        {formatted:'8:45am',hours:8, minutes:45},
        {formatted:'9:00am',hours:9, minutes:0},
        {formatted:'9:15am',hours:9, minutes:15},
        {formatted:'9:30am',hours:9, minutes:30},
        {formatted:'9:45am',hours:9, minutes:45},
        {formatted:'10:00am',hours:10, minutes:0},
        {formatted:'10:15am',hours:10, minutes:15},
        {formatted:'10:30am',hours:10, minutes:30},
        {formatted:'10:45am',hours:10, minutes:45},
      ],
      lunchTimeOptions:[
        {formatted:'pick',hours:0, minutes:0},
        {formatted:'10:00am',hours:10, minutes:0},
        {formatted:'10:15am',hours:10, minutes:15},
        {formatted:'10:30am',hours:10, minutes:30},
        {formatted:'10:45am',hours:10, minutes:45},
        {formatted:'11:00am',hours:11, minutes:0},
        {formatted:'11:15am',hours:11, minutes:15},
        {formatted:'11:30am',hours:11, minutes:30},
        {formatted:'11:45am',hours:11, minutes:45},
        {formatted:'12:00pm',hours:12, minutes:0},
        {formatted:'12:15pm',hours:12, minutes:15},
        {formatted:'12:30pm',hours:12, minutes:30},
        {formatted:'12:45pm',hours:12, minutes:45},
        {formatted:'1:00pm',hours:13, minutes:0},
        {formatted:'1:15pm',hours:13, minutes:15},
        {formatted:'1:30pm',hours:13, minutes:30},
        {formatted:'1:45pm',hours:13, minutes:45},
        {formatted:'2:00pm',hours:14, minutes:0},
        {formatted:'2:15pm',hours:14, minutes:15},
        {formatted:'2:30pm',hours:14, minutes:30},
        {formatted:'2:45pm',hours:14, minutes:45},

      ],
      endTimeOptions:[
        {formatted:'pick',hours:0, minutes:0},
        {formatted:'2:00pm',hours:14, minutes:0},
        {formatted:'2:15pm',hours:14, minutes:15},
        {formatted:'2:30pm',hours:14, minutes:30},
        {formatted:'2:45pm',hours:14, minutes:45},
        {formatted:'3:00pm',hours:15, minutes:0},
        {formatted:'3:15pm',hours:15, minutes:15},
        {formatted:'3:30pm',hours:15, minutes:30},
        {formatted:'3:45pm',hours:15, minutes:45},
        {formatted:'4:00pm',hours:16, minutes:0},
        {formatted:'4:15pm',hours:16, minutes:15},
        {formatted:'4:30pm',hours:16, minutes:30},
        {formatted:'4:45pm',hours:16, minutes:45},
        {formatted:'5:00pm',hours:17, minutes:0},
        {formatted:'5:15pm',hours:17, minutes:15},
        {formatted:'5:30pm',hours:17, minutes:30},
        {formatted:'5:45pm',hours:17, minutes:45},
        {formatted:'6:00pm',hours:18, minutes:0},
        {formatted:'6:15pm',hours:18, minutes:15},
        {formatted:'6:30pm',hours:18, minutes:30},
        {formatted:'6:45pm',hours:18, minutes:45},
      ],
      daysList: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      monthsList: [
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
      ],
      total_transactions: [],
      start:'',
      end:''
    };
  },

  mounted() {
    let today = new Date();
    let startDay = this.startOfWeek(today);
    let promises = [];

      for (let i = 0; i < 7; i++) {
        
        let obj = {};
        obj.day = startDay.getDay();
        obj.month = startDay.getMonth();
        obj.date = startDay.getDate();
        obj.actual_date = new Date(startDay);
        this.days.push(obj);
        console.log(startDay.getDate());
        promises.push(this.getClock(startDay))
        startDay.setDate(startDay.getDate() + 1);
        
        
      }
      Promise.all(promises).then((res)=>{
        this.isLoading  = false;
        this.weekClock = res;
        console.log(res);
      })
      // this.getTimesheet().then(()=>{
      //   this.isLoading = false;
      // });

  },
  methods: {
    getClock(date){
      return new Promise((resolve,reject)=>{
        let d = new Date(date);
        d.setHours(0,0,0,0);
        let post = {
          date:d,
          user_id:this.user_id
        }
        axios.post('/api/timesheet/get_clock', post).then(res=>{
          resolve(res.data);
        })
      })
    },
    getTimesheet(){
      return new Promise((resolve,reject)=>{
      let today = new Date();
      let startDay = this.startOfWeek(today);
      startDay.setHours(0,0,0,0);
      let post = {
        week_of:startDay,
        user_id:this.user_id,
      }

      axios.post('/api/timesheet/get', post).then((res)=>{
        this.state = res.data.state;
        this.retrieved = res.data.submitted;
       
        resolve();
      },err=>{
        resolve();
      })
      })
    },
    submitTimesheet(submitted){
      this.isLoading = true;
      let today = new Date();
      let startDay = this.startOfWeek(today);
      startDay.setHours(0,0,0,0);

      let post = {
        user_id:this.user_id,
        week_of: new Date(startDay),
        state:this.state,
        total_hours:Number(this.totalWeekHours.split(':')[0]),
        total_minutes:Number(this.totalWeekHours.split(':')[1]),
        submitted
      }
      axios.post('/api/timesheet/add', post).then((res)=>{
        
        this.getTimesheet().then(()=>{
          this.isLoading = false;
        });
      },err=>{
        this.isLoading = false;
        window.alert('Week has already been submitted')
      })
    },
    getHours(obj){
      let startTime = new Date(obj.clock_in);
      let endTime = new Date(obj.clock_out);
      let lstartTime = new Date(obj.lunch_in);
      let lendTime = new Date(obj.lunch_out);
      function diff_hours(dt2, dt1,ls,le){
        var ldiff = (le.getTime() - ls.getTime()) / 1000;
        ldiff /= 60;

        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
         diff /= 60;
         diff += ldiff;
        var hours = Math.abs(Math.round(Math.ceil(diff / 60)));
        var minutes = Math.round(Math.abs(diff % 60));
        return `${hours}:${minutes < 10 ? '0' + minutes : minutes }`;
        
      }


      return diff_hours(startTime, endTime,lstartTime, lendTime);
    },
    toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },

    sameDay(d1, d2) {
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    },
    calculateCommission(amount) {
      if (amount < 2000) {
        return Number(amount * 0).toFixed(2);
      }
      if (amount >= 2000 && amount < 4000) {
        return Number(amount * 0.03).toFixed(2);
      }
      if (amount >= 4000 && amount < 6000) {
        return Number(amount * 0.05).toFixed(2);
      }
      if (amount >= 6000 && amount < 8000) {
        return Number(amount * 0.07).toFixed(2);
      }
      if (amount >= 7500) {
        return Number(amount * 0.1).toFixed(2);
      }
    },
    formatDateString(date) {
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    },
    startOfWeek(date) {
      var diff =
        date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

      return new Date(date.setDate(diff));
    },
    endOfWeek(date) {
      var lastday = date.getDate() - (date.getDay() - 1) + 6;
      return new Date(date.setDate(lastday));
    },
    changeDateScale(scale) {
      this.scale = scale;
      this.users = [];
      this.transactionHistory = [];
      this.isLoading = true;
      if (scale == "week") {
        let today = new Date();
        let t = new Date();
        let startDay = this.startOfWeek(today);
        let endDay = this.endOfWeek(today);
        this.startDate = this.formatDateString(new Date(startDay));
        this.endDate = this.formatDateString(new Date(endDay));
      }
      if (scale == "month") {
        let today = new Date();
        let t = new Date();
        var startDay = new Date(today.getFullYear(), today.getMonth(), 1);
        var endDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.startDate = this.formatDateString(new Date(startDay));
        this.endDate = this.formatDateString(new Date(endDay));
      }
      if (scale == "ytd") {
        let today = new Date();
        let t = new Date();

        let endDay = today.setDate(today.getDate() + 1);
        let e = new Date("2019-01-01");
        e.setYear(today.getFullYear() - 1);
        const diffTime = Math.abs(today - e);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let startDay = t.setDate(today.getDate() - diffDays + 2);
        this.startDate = this.formatDateString(new Date(startDay));
        this.endDate = this.formatDateString(new Date(endDay));
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
    getApprovedAmount(transactions) {
      if (transactions != null) {
        let amount = 0;
        for (let i = 0; i < transactions.length; i++) {
          if (
            transactions[i].transaction_id != "Error" &&
            transactions[i].transaction_id != "none"
          ) {
            amount = amount + Number(transactions[i].amount);
          }
        }
        return Number(amount).toFixed(2);
      } else {
        return 0;
      }
    },
    getPendingAmount(transactions) {
      if (transactions != null) {
        let amount = 0;
        for (let i = 0; i < transactions.length; i++) {
          if (transactions[i].transaction_id == "none") {
            amount = amount + Number(transactions[i].amount);
          }
        }
        return Number(amount).toFixed(2);
      } else {
        return 0;
      }
    },
    getErrorAmount(transactions) {
      if (transactions != null) {
        let amount = 0;
        for (let i = 0; i < transactions.length; i++) {
          if (transactions[i].transaction_id == "Error") {
            amount = amount + Number(transactions[i].amount);
          }
        }
        return Number(amount).toFixed(2);
      } else {
        return 0;
      }
    },

  },
  components: {
  },
  computed: {
    user_id(){
      return this.$store.state.userStore.user.id;
    },
    totalWeekHours(){
      let minutes = 0;
      for(let i = 0; i < this.state.length; i++){
        if(this.weekClock[i].clock_in != null && this.weekClock[i].lunch_in != null && this.weekClock[i].lunch_out != null && this.weekClock[i].clock_out != null  ){
          let hours = this.getHours(this.weekClock[i]);
          hours = hours.split(':');
          minutes += Number(hours[0]) * 60;
          minutes += Number(hours[1])
        }
      }
      var h = Math.abs(Math.floor(minutes / 60));
        var m = Math.round(Math.abs(minutes % 60));
      return `${h}:${m <10 ? '0' + m : m}`
    },
    _(){
           return _;
      }
  }
};
</script>
<style>
.total-week{
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 20pt;
  margin-top:15px;
}
.total-hours{
  display: flex;
  align-items: center;
  padding:5px 0px;
  font-weight: bold
}
.total-hours span{
  margin-left: auto;
  display: flex;
  height:60px;
  font-size: 14pt;
  width:60px;
  border-radius:30px;
  background:#0b8f67;
  color:#fff;
  align-items: center;
  justify-content: center;
}
.time-picker{
  overflow-x: hidden;
  display: flex;
  flex-wrap: wrap;
  
  align-items: center
}
.time-option{
  background:#ccd2d8;
  color:#000;
  font-size:8pt;
  padding:5px 0px;
  width:50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top:5px;
  border-radius: 100px;
  margin-left: 5px;
  cursor: pointer;
}
.time-option:hover{
  background: #c3c9cf;
}
.time-input-time{
  white-space: nowrap;
  cursor: pointer;
  border-radius: 3px;
  background: #fff;
  font-weight: bold;
  display: flex;
  align-items: center;
  flex:1;
  margin-left: auto;
  height:40px;
  padding:0px 10px;
  transition: all .3s ease;
}
.time-input-time.disabled{
  cursor: default;
  pointer-events: none;
  background:transparent;
}
.time-input-time:hover{
  
  box-shadow: 0px 10px 10px -4px rgba(0,0,0,0.2);
}
.time-input-container{
  background:#e8eaec;
  padding:10px;
}
.time-input{
  
  border-radius: 3px;
  margin-bottom:5px;
  display: flex;
  align-items: center;
}
.time-input-title{
  margin-right:10px;
  width:100px;
  color:#000000aa;
  font-size:1em;
}

.cal-body{
  padding:15px
}
.cal-title {
  padding: 5px;
  text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.cal-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  border: solid 1px #eaeaea;
}
.cal-day {
  min-height: 300px;
  min-width:150px;
  flex: 1;
  border-left: solid 1px #eaeaea;
  border-bottom:solid 1px #eaeaea;
}
.trans-success {
  color: #24d7a0 !important;
}
.trans-error {
  color: #ff3344 !important;
}
.date-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-left: 15px;
}
.commision {
  position: relative;
  bottom: 0;
  margin-top: 100px;
  width: 100%;
  background: #0b8f67;
  color: #fff;
  font-size: 12pt;
  display: flex;
  align-items: center;
  padding-left: 15px;
  height: 50px;
  left: 0;
}
.transaction-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-bottom: solid 1px #00000020;
}
.cal-item {
  border-radius: 5px;
  padding: 5px 15px;
  color: #fff;
  margin: 5px;
  background: #24d7a0;
}
.cal-item span {
  margin-left: auto;
  font-weight: bold;
  display: inline-block;
}
.transaction-item:hover {
  background: #e4f4fd;
}
.transaction-item span {
  margin-left: auto;
  font-weight: bold;
  color: #1b495d;
}
.expand-panel {
  width: 100%;
  background: #fff;

  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}
.expand-panel-inner {
  height: 200px;
  overflow: auto;
}
.agent-box {
  background: #f8fafb;
  border: solid 1px rgb(202, 202, 202);
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 15px;
  position: relative;
  flex: 1;
  box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.2);
  flex-basis: 25%;
  transition: all 0.3s ease;
  min-width:330px
}
.agent-box:hover {
  background: #e4f4fd;
}
.agent-box-inner {
  padding: 15px;
  position: relative;
}
.agent-amount {
  margin-left: auto;
  background: #1b495d;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  color: #fff;
  border-bottom-left-radius: 100px;
  border-top-left-radius: 100px;
  font-size: 15pt;
  justify-content: flex-end;
  font-weight: bold;
  padding: 0px 10px;
  width: 150px;
  justify-content: center;
}
.agent-name {
  font-size: 15pt;
  font-weight: bold;
}
.agent .inner-row {
  width: 100%;
  margin-bottom: 25px;
}
.inner-stage {
  padding: 45px;
  width: calc(100% - 80px);
  position: relative;
  background-color: #fff;
  color: #444;
}
.chart-container {
  height: 300px;
}
.box {
  border: solid 1px #e8eaec;
  
}
.box-content {
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
}
.basic-title {
  display: flex;
  align-items: center;
  padding: 15px;

  background: #e8eaec;
  font-size: 12pt;
  font-weight: bold;
  color: #1b495d;
  margin-bottom: 10px;
}
</style>
<style>
.form-control {
  border-radius: 0px !important;
}
.form-control:focus {
  border-color: #24d7a0 !important;
}
.VueTables__search-field {
  display: flex;
}
.VueTables__search-field label {
  margin-right: 10px;
}
.table-striped tbody tr:nth-of-type(odd) {
  background-color: #ffffff !important;
}
.table-hover tbody tr:hover {
  background-color: #f8fafb !important;
}
.VueTables__search {
  display: none !important;
}
.table thead th {
  background: #e8eaec;
}
.OnTime {
  background: #24d7a0;
}
.Overdue {
  background: #ff3344;
}
.status-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 10px;
  font-size: 10pt;
  height: 30px;
  color: #fff;
  border-radius: 3px;
}
.page-item.active .page-link {
  background-color: #e8eaec !important;
  border-color: #e8eaec !important;
}
.page-link {
  color: #868e96 !important;
}
.page-item.active .page-link {
  color: #1b495d !important;
}
.text-center {
  display: flex;
  align-items: center;
}
.VuePagination__count {
  margin: 0;
}
.VueTables__limit-field {
  display: none !important;
}
.pending{
  background:#2648574d;
}
</style>