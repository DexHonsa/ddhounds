import axios from 'axios';
import auth from '@/auth';
import Vue from 'vue';

export default {
    name: 'user_management',
    data() {
        return {
            users: [],
            editing: false,
            editUser: {},
            editIndex: null,
            isLoaded: false,
            isLoading: false,
            newUserEdit: false,
            errorMessage: '',
            hasError: false,
            tab:0,
            dialog:false,
            newPassword:'',
            changePasswordId:'',
            changePasswordLoading:false
        }
    },
    mounted() {
        this.getUsers();
    },
    
    watch:{
        tab(val) {
            if (val == 0) {
              this.isLoaded = false;
              this.getUsers();
            }
            if (val == 1) {
              this.isLoaded = false;
              this.getUsers();
            }
          }
    },
    methods: {
        submitChangePassword(){
            this.changePasswordLoading = true;
            axios.post('/api/users/change_password', {userId:this.changePasswordId, password:this.newPassword}).then(()=>{
                this.dialog = false;
                this.changePasswordLoading = false;
            },err=>{
                window.alert('There was an Error')
                this.changePasswordLoading = false;
            })
        },
        changePassword(){
            this.dialog = true;
        },
        deleteUser(){
            let userObj = this.editUser;
            userObj['archived'] = true;
            axios.post('/api/users/update_user/', userObj).then(() => {
                this.getUsers()
                this.editing = false;
                this.editUser = {};
            })
        },
        submitAddUser() {
            auth.signup(this.editUser).then(() => {
                this.isLoaded = false;
                this.getUsers();
                window.location.reload();
            }, err => {
                //this.errorMessage = err.response.data.message;
                Vue.set(this, 'errorMessage', err.response.data.error)
                this.hasError = true;
            })
        },
        addUser() {
            this.newUserEdit = true;
            this.users.push({
                first_name: '',
                last_name: '',
                email: '',
                role: 'agent',
                password: ''
            })
            this.editUser = { first_name: '', last_name: '', email: '', role: 'agent', password: '' }
            this.editing = true;
            this.editIndex = this.users.length - 1;
        },
        getUsers() {
            this.isLoaded = false;
            if(this.tab == 0){
                axios.get('/api/users/get_users/').then(res => {
                    this.isLoaded = true;
                    this.users = res.data;
                }) 
            }else{
                axios.get('/api/users/get_archived_users/').then(res => {
                    this.isLoaded = true;
                    this.users = res.data;
                })
            }
            
        },
        toggleUserEdit(id, index) {
            if (this.newUserEdit) {
                this.submitAddUser();
                return;
            }

            if (this.editIndex != null) {
                this.editIndex = null;

                this.isLoaded = false;

                axios.post('/api/users/update_user/', this.editUser).then(() => {
                    this.getUsers()
                    this.editUser = {};
                })

            } else {
                this.editIndex = index;
                var user = this.users.filter((item) => {
                    return item._id == id;
                })

                this.editUser = user[0]
                this.$route.params.id = user[0].id;
                this.editing = !this.editing
            }


        }
    },
    computed: {
        isAdmin(){
            if(this.$store.state.userStore.user.role == 'admin'){
                return true
            }else{
                return false;
            }
        }
    },
    components: {

    }
}