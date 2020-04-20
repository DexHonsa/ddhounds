import auth from '../../auth';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
export default {
    name:'login',
    data(){
        return {
            password:'',
            errorMessage:'',
            hasError:false,
            successMessage:'Password successfully changed!',
            displaySuccessButton:false,
            hasLoggedIn:false,
            user:{
                
            }
        }
    },
    computed:{
        
        path(){
            return this.$route.query.token
        },
        id(){
            return this.$route.params.id;
        }
    },
    mounted(){
        this.getUser()
    },
    methods:{
        getUser(){
            axios.get('/api/users/' + this.id).then(res=>{
                console.log(res.data.user);
                this.user = res.data.user;
            })
        },
        register(){
            axios.post('/api/users/new_account_login', {id:this.id, password:this.password}).then(res=>{

                auth.login({email:res.data.value.email, password:this.password}).then(()=>{
                    this.$router.push('/dashboard');
                })
            })
        }
    }
}