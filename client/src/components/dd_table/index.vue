<template>
    <div class="container" style="position:relative;">
    <transition enter-active-class="fadeInUp" leave-active-class="fadeOut">
            <div v-if="!isLoaded" class="loaderContainer animated-fast"><img src="@/img/double_loader.svg" alt=""></div>
    </transition>
    <div style="margin-bottom:25px;">
        <div class="name">Create Project</div>
    </div>
    <div class="form-container">
        <div style="display:flex; margin:20px 0px;">
        <div @click="active='name'" class="enter-by" :class="{'active': active=='name'}">Enter By Name</div>
         <div @click="active='number'" class="enter-by" :class="{'active': active=='number'}">Enter By Number</div>
        </div>
        <v-text-field label="Project Name" counter="20"  v-model="project.name" placeholder="Enter Project Name Here"></v-text-field>
        <v-text-field label="Matter Number" counter="20"  v-model="project.matter_number" placeholder="Enter Matter Number Here​"></v-text-field>
        <v-textarea label="Data" style="margin-top:15px;" box placeholder="Enter Data Here, multiples separated by “;”"></v-textarea>
        <v-btn @click="$router.push('/table/table')" block large class="white--text" :color="$vuetify.theme.lightGreen" depressed>RUN INITIAL REPORT​</v-btn>
        <v-btn @click="options = !options" block small class="white--text" :color="$vuetify.theme.accent" depressed><i style="margin-right:10px;" class="fal fa-cog"></i>Chain of title display options</v-btn>
        <v-expand-transition>
            <div class="options" v-if="options">
                <div class="inner-options">
                    <v-tooltip max-width="200" top>
                        <template v-slot:activator="{on}">
                            <v-checkbox v-on="on" height="20px" :color="$vuetify.theme.lightGreen" v-model="project.licenced_properties" label="Include Licenced Properties"></v-checkbox>
                        </template>
                        <span> In a financing transaction, you may want to exclude licensed properties. For M&A transactions,  licensed properties are typically included. Our default is to include licensed properties. </span>
                    </v-tooltip>
                    <v-tooltip max-width="200" top>
                        <template v-slot:activator="{on}">
                    <v-checkbox v-on="on" height="20px"  :color="$vuetify.theme.lightGreen" v-model="project.csn" label="Include CSN Entries as their own line item?"></v-checkbox>
                        </template>
                    <span>For serials (periodicals, newspapers,magazines, etc) the prefix CSN (Copyright Serial Number) has been discontinued and typically has embedded registrations. Some Users prefer to not include CSN registrations as their own entry, as DD Bloodhounds displays embedded registrations. Our default is to include CSN registrations as a separate line item.​</span>
                    </v-tooltip>
                    
                </div>
            </div>
        </v-expand-transition>
        
    </div>
    
</div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

export default {
    name:'table',
    data(){
        return {
            options:false,
            active:'name',
            project:{
                matter_number:0,
                name:'',
                licensed_properties:false,
                csn:false
            },
            edit:'',
            moment,
            history:[],
            isLoaded:false
        }
    },
    mounted(){
        this.isLoaded = true;
    },
    methods:{   



    },
    computed:{
        user(){
            return this.$store.state.userStore.user;
        }
    }
}
</script>
<style>
.options{
    height:150px;
    width:100%;

}
.inner-options{
    background:#fff;
    padding:15px;
}
.enter-by{
    flex:1;
    margin-right:5px;
    background:#d7d7d7;
    cursor: pointer;
    height:70px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12pt;
    font-weight: bold;
    border-radius: 5px;
    color:#fff;
}
.enter-by.active{
    background:#2d7cb7 !important; 
    color:#fff;
}
.enter-by:hover{
    background:#c0c0c0;
}
.enter-by:last-of-type{
    margin-left:5px;
    margin-right:0;
}
.form-container{
    border-radius: 5px;
    border:solid 1px #d6d6d6;
    max-width:500px;
    position:relative;
    padding:15px;
}
.container{
    padding:55px;
}
.name{
    font-size:20pt;
    font-weight: bold;
}

</style>
