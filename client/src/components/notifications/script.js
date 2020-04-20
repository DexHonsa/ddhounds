import axios from 'axios';

export default {
    name: 'notifications',
    data() {
        return {
            notifications: [],
            editing: false,
            editUser: {},
            editIndex: null,
            isLoaded:false,
            isLoading:false,
            newUserEdit:false,
            errorMessage:'',
            hasError:false
        }
    },
    mounted() {
        this.getNotifications();
    },
    methods: {
        getNotifications() {
            axios.get('/api/notifications/get_all/' + this.user._id).then(res => {
                this.isLoaded = true;
                this.notifications = res.data;
            })
        },

    },
    computed: {
        user(){
            return this.$store.state.userStore.user;
        }
    },
    components: {
        
    }
}