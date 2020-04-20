import auth from '../../auth';
import jwtDecode from 'jwt-decode';
export default {
    name:'login',
    data(){
        return {
            password:'',
            errorMessage:'',
            hasError:false,
            successMessage:'Password successfully changed!',
            displaySuccessButton:false
        }
    },
    computed:{
        email(){
            return jwtDecode(this.$route.query.token).email;
        },
        path(){
            return this.$route.query.token
        }
    },
    methods:{
        register(){
            if(this.email.indexOf('@') > -1){
              this.hasError = false;
            auth.resetPassword({email:this.email, password:this.password}).then(res=>{
                this.hasSuccess = true;
                this.displaySuccessButton = true;
            },err=>{
                this.hasError = true;
                console.log(err);
                this.errorMessage = err.response.data.error
            })  
            }else{
                this.hasError = true;
                this.errorMessage = 'Link broken or token expired.'
            }
            

        }
    }
}