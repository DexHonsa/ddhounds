import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

export default {
    name:'profile',
    data(){
        return {
            edit:'',
            moment,
            history:[],
            isLoaded:false
        }
    },
    mounted(){
        this.getHistory();
    },
    methods:{   
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
                for (let i = 0; i < frags.length; i++) {
                    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
                }
                return frags.join(' ');
            } else {
                return str;
            }


        },
        getHistory(){
            this.isLoaded = false;
            axios.get('/api/users/user_history/' + this.user.id).then(res=>{
                this.history = res.data.reverse();
                var promises = [];
                for(let i = 0; i < res.data.length; i++){
                    var post = {_id:1,first_name:1, middle_name:1,last_name:1, type:1};
                    if(_.has(res.data[i], 'action')){
                       post[res.data[i].action.prop] = 1; 
                    }
                    
                    promises.push(axios.post("/api/clients/fields/" + res.data[i].client_id, post));
                }
                Promise.all(promises).then(results=>{
                    for(let i = 0; i < results.length; i++){
                        for(let k = 0; k < this.history.length; k++){
                            
                            if(this.history[k].client_id == results[i].data._id){
                                
                                this.history[k].client_name = `${results[i].data.first_name} ${results[i].data.last_name}`;
                            }
                        }
                        
                    }
                    this.isLoaded = true;
                    //console.log(results);
                   // for(let i = 0; i < results.length;)
                })
            })
        }
    },
    computed:{
        user(){
            return this.$store.state.userStore.user;
        }
    }
}