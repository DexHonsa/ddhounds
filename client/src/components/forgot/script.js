import auth from '../../auth';
export default {
    name:'login',
    data(){
        return {
            email:'',
            errorMessage:'',
            hasError:false,
            hasSuccess:false,
            successMessage:'Reset link has been sent!'
        }
    },
    methods:{
        register(){
            this.hasError = false;
            auth.forgot({email:this.email}).then(res=>{
                this.hasSuccess = true;
            },err=>{
                this.hasError = true;
                console.log(err);
                this.errorMessage = err.response.data.error
            })

        }
    }
}