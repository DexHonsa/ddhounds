import axios from 'axios';

export default {
    name:'profile',
    data(){
        return {
            keys:[],
            isLoaded:false
        }
    },
    mounted(){
        this.getKeys();
    },
    methods:{   
        getKeys(){
            axios.get('/api/clients/keys').then((res)=>{
                this.keys = res.data.sort();
                this.isLoaded = true;
            })
        }
    },
    computed:{
        user(){
            return this.$store.state.userStore.user;
        }
    }
}