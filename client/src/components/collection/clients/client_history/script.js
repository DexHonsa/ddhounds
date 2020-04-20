import axios from "axios";
import Vue from 'vue';

export default {
    name:'client_history',
    props:['history', 'prop','hide'],
    data(){
        return {
           hist:[],
           isLoaded:false
        }
    },
    mounted(){
        this.getHistory();
    },
    methods:{
        format(value){
            
            if(Number(value) > 10000000000){
                return this.formatDate(value);
            }else{
                return value;
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
        getHistory(){
            var hist = [];
            for(let i = 0; i < this.history.length; i++){
                if(this.history[i].action.prop == this.prop){
                    hist.push(this.history[i]);
                }
                
            }
            this.hist = hist;
            this.isLoaded = true;
            
        }
    },
    computed:{
        path(){
            return this.$route.path.split('/')[this.$route.path.split('/').length - 1];
        }
    }

}