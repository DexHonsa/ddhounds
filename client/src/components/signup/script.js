import auth from '../../auth';
export default {
    name:'login',
    data(){
        return {
            first_name:'',
            last_name:'',
            email:'',
            password:'',
            errorMessage:'',
            hasError:false
        }
    },
    methods:{
        register(){
            this.hasError = false;
            auth.signup({first_name:this.first_name, last_name:this.last_name,email:this.email, password:this.password}).then(res=>{
                this.$router.push('/collection/clients');
            },err=>{
                this.hasError = true;
                console.log(err);
                this.errorMessage = err.response.data.error
            })

        }
    }
}